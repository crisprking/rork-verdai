import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PostHogService from './services/PostHogService';
import SupabaseService from './services/SupabaseService';
import RevenueCatService from './services/RevenueCatService';
import AIService from './services/AIService';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize PostHog Analytics
      await PostHogService.getInstance().initialize();
      
      // Initialize RevenueCat
      await RevenueCatService.getInstance().initialize();
      
      // Track app launch
      PostHogService.getInstance().trackAppLaunch();
      
      // Check premium status
      const premiumStatus = await RevenueCatService.getInstance().isPremiumUser();
      setIsPremium(premiumStatus);
      
      setIsInitialized(true);
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      setIsInitialized(true); // Allow app to continue even if some services fail
    }
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to identify plants.');
      return false;
    }
    return true;
  };

  const handleIdentifyPlant = async () => {
    if (!isInitialized) return;

    // Track feature usage
    PostHogService.getInstance().trackFeatureUsage('plant_identification', 'started');

    // Check premium status for advanced features
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Plant identification is available for premium users. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: handleUpgrade },
        ]
      );
      return;
    }

    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        
        const aiResult = await AIService.getInstance().identifyPlant(result.assets[0].uri);
        
        if (aiResult.success && aiResult.data) {
          // Track successful identification
          PostHogService.getInstance().trackPlantIdentification(
            true, 
            aiResult.data.plantName, 
            aiResult.data.confidence
          );

          // Save to Supabase (if user is logged in)
          const user = await SupabaseService.getInstance().getCurrentUser();
          if (user) {
            await SupabaseService.getInstance().savePlantIdentification({
              user_id: user.id,
              plant_name: aiResult.data.plantName,
              scientific_name: aiResult.data.scientificName,
              confidence_score: aiResult.data.confidence,
              image_url: result.assets[0].uri,
            });
          }

          Alert.alert(
            'Plant Identified! 🌱',
            `${aiResult.data.plantName}\n(${aiResult.data.scientificName})\n\nConfidence: ${Math.round(aiResult.data.confidence * 100)}%\n\n${aiResult.data.description}`
          );
        } else {
          PostHogService.getInstance().trackPlantIdentification(false);
          Alert.alert('Identification Failed', aiResult.error || 'Unable to identify plant');
        }
      }
    } catch (error) {
      console.error('❌ Plant identification error:', error);
      PostHogService.getInstance().trackPlantIdentification(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiagnosePlant = async () => {
    if (!isInitialized) return;

    PostHogService.getInstance().trackFeatureUsage('health_diagnosis', 'started');

    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Health diagnosis is available for premium users. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: handleUpgrade },
        ]
      );
      return;
    }

    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        
        const aiResult = await AIService.getInstance().diagnosePlantHealth(result.assets[0].uri);
        
        if (aiResult.success && aiResult.data) {
          PostHogService.getInstance().trackHealthDiagnosis(
            true, 
            aiResult.data.diagnosis, 
            aiResult.data.severity
          );

          // Save to Supabase
          const user = await SupabaseService.getInstance().getCurrentUser();
          if (user) {
            await SupabaseService.getInstance().saveHealthDiagnosis({
              user_id: user.id,
              diagnosis: aiResult.data.diagnosis,
              severity: aiResult.data.severity,
              recommendations: aiResult.data.treatment,
              image_url: result.assets[0].uri,
            });
          }

          Alert.alert(
            'Health Diagnosis 🩺',
            `Diagnosis: ${aiResult.data.diagnosis}\nSeverity: ${aiResult.data.severity.toUpperCase()}\n\nTreatment:\n${aiResult.data.treatment.join('\n')}`
          );
        } else {
          PostHogService.getInstance().trackHealthDiagnosis(false);
          Alert.alert('Diagnosis Failed', aiResult.error || 'Unable to diagnose plant health');
        }
      }
    } catch (error) {
      console.error('❌ Health diagnosis error:', error);
      PostHogService.getInstance().trackHealthDiagnosis(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = async () => {
    if (!isInitialized) return;

    PostHogService.getInstance().trackPremiumUpgrade('viewed');

    Alert.alert(
      '⭐ Upgrade to Premium',
      'Unlock unlimited plant identification, health diagnosis, and care recommendations!',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => PostHogService.getInstance().trackPremiumUpgrade('cancelled') },
        { text: 'Monthly $4.99', onPress: () => purchasePremium('monthly') },
        { text: 'Yearly $29.99', onPress: () => purchasePremium('yearly') },
      ]
    );
  };

  const purchasePremium = async (type: 'monthly' | 'yearly') => {
    try {
      PostHogService.getInstance().trackPremiumUpgrade('started');
      setIsProcessing(true);

      const result = type === 'monthly' 
        ? await RevenueCatService.getInstance().purchaseMonthlyPremium()
        : await RevenueCatService.getInstance().purchaseYearlyPremium();

      if (result.success) {
        PostHogService.getInstance().trackPremiumUpgrade('completed');
        setIsPremium(true);
        Alert.alert('Welcome to Premium! 🎉', 'You now have access to all premium features.');
      } else {
        Alert.alert('Purchase Failed', result.error || 'Unable to complete purchase');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌱 FloraMind</Text>
          <Text style={styles.subtitle}>AI Plant Care Companion</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Identify & Care for Your Plants</Text>
          <Text style={styles.heroSubtitle}>
            AI-powered plant identification and health diagnosis
          </Text>
        </View>

        {/* Main Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleIdentifyPlant}>
            <Text style={styles.primaryButtonText}>📸 Identify Plant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleDiagnosePlant}>
            <Text style={styles.primaryButtonText}>🔍 Diagnose Health</Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤖</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>AI Plant Identification</Text>
              <Text style={styles.featureDescription}>Identify 10,000+ plants instantly</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🩺</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Health Diagnosis</Text>
              <Text style={styles.featureDescription}>Detect diseases and pests</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💡</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Care Recommendations</Text>
              <Text style={styles.featureDescription}>Personalized plant care advice</Text>
            </View>
          </View>
        </View>

        {/* Upgrade Section */}
        <View style={styles.upgradeSection}>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>⭐ Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  upgradeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});