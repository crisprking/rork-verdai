import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import RevenueCatService from './services/RevenueCatService';
import PostHogService from './services/PostHogService';
import SupabaseService from './services/SupabaseService';
import PlantAIService from './services/PlantAIService';

const { width, height } = Dimensions.get('window');

// Premium Color Palette
const COLORS = {
  primary: '#2E7D32',
  secondary: '#66BB6A',
  accent: '#FFC107',
  premium: '#FFD700',
  background: '#F5F9F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  subtext: '#757575',
  error: '#F44336',
  success: '#4CAF50',
  gradient1: '#43A047',
  gradient2: '#1B5E20'
};

export default function App() {
  // State Management
  const [activeTab, setActiveTab] = useState('home');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userPlants, setUserPlants] = useState([]);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Plant Parent',
    plantsCount: 0,
    streak: 0,
    level: 'Beginner'
  });

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Initialize App
  useEffect(() => {
    initializeApp();
    animateEntry();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize all services
      await Promise.all([
        RevenueCatService.initialize(),
        PostHogService.initialize(),
        SupabaseService.initialize(),
        PlantAIService.initialize()
      ]);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      await Notifications.requestPermissionsAsync();
      
      // Check premium status from RevenueCat
      const premiumStatus = await RevenueCatService.isPremiumUser();
      setIsPremium(premiumStatus);

      // Load user data from Supabase if authenticated
      const user = SupabaseService.getCurrentUser();
      if (user) {
        const { data } = await SupabaseService.getUserPlants();
        if (data) {
          setUserPlants(data);
        }
      } else {
        // Load from local storage as fallback
        const savedPlants = await AsyncStorage.getItem('userPlants');
        if (savedPlants) {
          setUserPlants(JSON.parse(savedPlants));
        }
      }

      // Setup notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Track app launch
      PostHogService.trackAppLaunch();
      
    } catch (error) {
      console.error('App initialization error:', error);
      PostHogService.trackError('app_initialization', error.message);
    }
  };

  const animateEntry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // AI Plant Identification
  const identifyPlant = async () => {
    try {
      if (!isPremium && userPlants.length >= 3) {
        PostHogService.trackPaywallViewed('plant_limit', 'monthly');
        setShowPaywall(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        PostHogService.track('Plant Scan Initiated', { source: 'gallery' });
        
        // Use real AI service
        const aiResult = await PlantAIService.identifyPlant(result.assets[0].uri);
        
        if (aiResult.success) {
          const plantData = {
            ...aiResult,
            image: result.assets[0].uri
          };
          
          setIdentificationResult(plantData);
          await savePlantToCollection(plantData);
          setActiveTab('identify');
        } else {
          Alert.alert('Identification Failed', aiResult.error || 'Please try again with a clearer image');
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error('Plant identification error:', error);
      PostHogService.trackError('plant_identification', error.message);
      setLoading(false);
      Alert.alert('Error', 'Failed to identify plant. Please try again.');
    }
  };

  // Plant Health Diagnosis
  const diagnosePlant = async () => {
    try {
      if (!isPremium) {
        PostHogService.trackPaywallViewed('health_diagnosis', 'yearly');
        setShowPaywall(true);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        PostHogService.track('Health Check Initiated', { source: 'camera' });
        
        // Use real AI service for diagnosis
        const diagnosisResult = await PlantAIService.diagnosePlantHealth(
          result.assets[0].uri,
          { commonName: 'Unknown Plant' }
        );
        
        if (diagnosisResult.success) {
          const diagnosis = {
            ...diagnosisResult,
            image: result.assets[0].uri
          };
          
          setDiagnosisResult(diagnosis);
          
          // Save to Supabase if authenticated
          const user = SupabaseService.getCurrentUser();
          if (user) {
            await SupabaseService.saveDiagnosis(null, diagnosis, result.assets[0].uri);
          }
          
          setActiveTab('diagnose');
        } else {
          Alert.alert('Diagnosis Failed', diagnosisResult.error || 'Please try again with a clearer image');
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error('Health diagnosis error:', error);
      PostHogService.trackError('health_diagnosis', error.message);
      setLoading(false);
      Alert.alert('Error', 'Failed to diagnose plant health. Please try again.');
    }
  };

  // Save Plant to Collection
  const savePlantToCollection = async (plant) => {
    const newPlant = {
      ...plant,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      nickname: '',
      lastWatered: null,
      nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: []
    };

    const updatedPlants = [...userPlants, newPlant];
    setUserPlants(updatedPlants);
    await AsyncStorage.setItem('userPlants', JSON.stringify(updatedPlants));
    
    // Schedule care reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to water ${plant.commonName}! 💧`,
        body: 'Your plant needs some love and care.',
      },
      trigger: {
        seconds: 7 * 24 * 60 * 60,
        repeats: true
      },
    });
  };

  // Premium Subscription
  const subscribeToPremium = async (plan) => {
    try {
      setLoading(true);
      
      // Map plan to product ID
      const productId = plan === 'monthly' 
        ? 'app.rork.verdai.premium.monthly'
        : 'app.rork.verdai.premium.yearly';
      
      // Purchase through RevenueCat
      const result = await RevenueCatService.purchaseProduct(productId);
      
      if (result.success) {
        setIsPremium(true);
        setShowPaywall(false);
        
        // Track purchase
        const price = plan === 'monthly' ? 4.99 : 29.99;
        PostHogService.trackPurchase(productId, price, 'USD');
        
        Alert.alert('Welcome to Premium! 🌟', 'Enjoy unlimited access to all features');
      } else if (result.cancelled) {
        console.log('Purchase cancelled by user');
      } else {
        Alert.alert('Purchase Failed', result.error || 'Please try again');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Subscription error:', error);
      PostHogService.trackError('subscription_purchase', error.message);
      setLoading(false);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    }
  };

  // Render Header
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.gradient1, COLORS.gradient2]}
      style={styles.header}
    >
      <SafeAreaView>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>FloraMind AI</Text>
            <Text style={styles.headerSubtitle}>
              {isPremium ? '✨ Premium Member' : 'Your Smart Plant Companion'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // Render Home Tab
  const renderHomeTab = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionCard, styles.identifyCard]}
          onPress={identifyPlant}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.actionGradient}
          >
            <Text style={styles.actionIcon}>📸</Text>
            <Text style={styles.actionTitle}>Identify Plant</Text>
            <Text style={styles.actionDescription}>AI-powered identification</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.diagnoseCard]}
          onPress={diagnosePlant}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.actionGradient}
          >
            <Text style={styles.actionIcon}>🔬</Text>
            <Text style={styles.actionTitle}>Health Check</Text>
            <Text style={styles.actionDescription}>Diagnose issues</Text>
            {!isPremium && <Text style={styles.premiumBadge}>PRO</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* My Plants Collection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Plants ({userPlants.length})</Text>
          <TouchableOpacity onPress={() => setActiveTab('collection')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        
        {userPlants.length > 0 ? (
          <FlatList
            horizontal
            data={userPlants.slice(0, 5)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.plantCard}>
                <Image source={{ uri: item.image }} style={styles.plantImage} />
                <Text style={styles.plantName}>{item.commonName}</Text>
                <Text style={styles.plantStatus}>💧 {item.waterFrequency}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>Start your plant collection!</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={identifyPlant}>
              <Text style={styles.ctaButtonText}>Add Your First Plant</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Care Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Care Tips</Text>
        <View style={styles.tipsContainer}>
          {[
            { icon: '☀️', title: 'Light Check', tip: 'Rotate plants for even growth' },
            { icon: '💧', title: 'Water Wisely', tip: 'Check soil moisture first' },
            { icon: '🌡️', title: 'Temperature', tip: 'Keep away from AC vents' },
            { icon: '✂️', title: 'Pruning', tip: 'Remove dead leaves regularly' }
          ].map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.tip}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Premium Features */}
      {!isPremium && (
        <TouchableOpacity 
          style={styles.premiumBanner}
          onPress={() => setShowPaywall(true)}
        >
          <LinearGradient
            colors={[COLORS.premium, '#FFB300']}
            style={styles.premiumGradient}
          >
            <Text style={styles.premiumTitle}>🌟 Unlock Premium</Text>
            <Text style={styles.premiumDescription}>
              Unlimited plant scans • Advanced diagnosis • Expert care guides
            </Text>
            <View style={styles.premiumCTA}>
              <Text style={styles.premiumPrice}>$4.99/month</Text>
              <Text style={styles.premiumAction}>Try Free →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  // Render Identification Result
  const renderIdentificationResult = () => (
    <ScrollView style={styles.container}>
      {identificationResult && (
        <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
          <Image source={{ uri: identificationResult.image }} style={styles.resultImage} />
          
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{identificationResult.plantName}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(identificationResult.confidence * 100)}% Match
                </Text>
              </View>
            </View>
            
            <Text style={styles.resultCommonName}>{identificationResult.commonName}</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>☀️ Light</Text>
                <Text style={styles.infoValue}>{identificationResult.lightRequirement}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>💧 Water</Text>
                <Text style={styles.infoValue}>{identificationResult.waterFrequency}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>💨 Humidity</Text>
                <Text style={styles.infoValue}>{identificationResult.humidity}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>🌡️ Temperature</Text>
                <Text style={styles.infoValue}>{identificationResult.temperature}</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailTitle}>Plant Details</Text>
              <Text style={styles.detailText}>Family: {identificationResult.family}</Text>
              <Text style={styles.detailText}>Origin: {identificationResult.origin}</Text>
              <Text style={styles.detailText}>Care Level: {identificationResult.careLevel}</Text>
              <Text style={styles.detailText}>Growth Rate: {identificationResult.growthRate}</Text>
              <Text style={styles.detailText}>Mature Size: {identificationResult.matureSize}</Text>
              <Text style={[styles.detailText, styles.warning]}>
                ⚠️ {identificationResult.toxicity}
              </Text>
            </View>

            <View style={styles.careSection}>
              <Text style={styles.detailTitle}>Special Care</Text>
              <Text style={styles.careText}>{identificationResult.specialCare}</Text>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => Alert.alert('Success', 'Plant added to your collection!')}
            >
              <Text style={styles.saveButtonText}>Add to My Plants</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );

  // Render Diagnosis Result
  const renderDiagnosisResult = () => (
    <ScrollView style={styles.container}>
      {diagnosisResult && (
        <View style={styles.resultContainer}>
          <Image source={{ uri: diagnosisResult.image }} style={styles.resultImage} />
          
          <View style={styles.healthScoreContainer}>
            <Text style={styles.healthScoreLabel}>Plant Health Score</Text>
            <View style={styles.healthScoreCircle}>
              <Text style={styles.healthScoreValue}>{diagnosisResult.healthScore}</Text>
              <Text style={styles.healthScoreMax}>/100</Text>
            </View>
            <Text style={[styles.healthStatus, 
              diagnosisResult.healthScore >= 80 ? styles.healthGood :
              diagnosisResult.healthScore >= 60 ? styles.healthModerate :
              styles.healthPoor
            ]}>
              {diagnosisResult.status}
            </Text>
          </View>

          <View style={styles.issuesSection}>
            <Text style={styles.sectionTitle}>Detected Issues</Text>
            {diagnosisResult.issues.map((issue, index) => (
              <View key={index} style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <Text style={styles.issueType}>{issue.type}</Text>
                  <View style={[styles.severityBadge, 
                    issue.severity === 'High' ? styles.severityHigh :
                    issue.severity === 'Moderate' ? styles.severityModerate :
                    styles.severityLow
                  ]}>
                    <Text style={styles.severityText}>{issue.severity}</Text>
                  </View>
                </View>
                <Text style={styles.issueCause}>Cause: {issue.cause}</Text>
                <Text style={styles.issueSolution}>✓ {issue.solution}</Text>
              </View>
            ))}
          </View>

          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Care Recommendations</Text>
            {diagnosisResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationNumber}>{index + 1}</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.scheduleButton}>
            <Text style={styles.scheduleButtonText}>Schedule Care Reminders</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  // Render Paywall
  const renderPaywall = () => (
    <Modal visible={showPaywall} animationType="slide" transparent>
      <View style={styles.paywallContainer}>
        <BlurView intensity={100} style={styles.paywallBlur}>
          <View style={styles.paywallContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPaywall(false)}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.paywallTitle}>🌟 Unlock Premium</Text>
            <Text style={styles.paywallSubtitle}>
              Get unlimited access to all features
            </Text>

            <View style={styles.featuresGrid}>
              {[
                '✓ Unlimited Plant Scans',
                '✓ Advanced Disease Detection',
                '✓ Expert Care Guides',
                '✓ Personalized Reminders',
                '✓ Plant Journal & Notes',
                '✓ Priority Support'
              ].map((feature, index) => (
                <Text key={index} style={styles.featureItem}>{feature}</Text>
              ))}
            </View>

            <View style={styles.plansContainer}>
              <TouchableOpacity 
                style={styles.planCard}
                onPress={() => subscribeToPremium('monthly')}
              >
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planPrice}>$4.99</Text>
                <Text style={styles.planPeriod}>per month</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.planCard, styles.popularPlan]}
                onPress={() => subscribeToPremium('yearly')}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
                <Text style={styles.planName}>Yearly</Text>
                <Text style={styles.planPrice}>$29.99</Text>
                <Text style={styles.planPeriod}>per year</Text>
                <Text style={styles.planSaving}>Save 50%</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={() => subscribeToPremium('yearly')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.trialText}>7-day free trial, cancel anytime</Text>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  // Render Tab Bar
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'identify', icon: '📸', label: 'Identify' },
        { id: 'diagnose', icon: '🔬', label: 'Diagnose' },
        { id: 'collection', icon: '🌿', label: 'Plants' },
        { id: 'profile', icon: '👤', label: 'Profile' }
      ].map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={[styles.tabIcon, activeTab === tab.id && styles.activeTabIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.gradient1} />
      
      {renderHeader()}
      
      <Animated.View style={[styles.mainContent, { 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }]}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>AI Processing...</Text>
          </View>
        )}
        
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'identify' && renderIdentificationResult()}
        {activeTab === 'diagnose' && renderDiagnosisResult()}
        {activeTab === 'collection' && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonIcon}>🌿</Text>
            <Text style={styles.comingSoonText}>Plant Collection</Text>
            <Text style={styles.comingSoonSubtext}>Track all your plants in one place</Text>
          </View>
        )}
        {activeTab === 'profile' && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonIcon}>👤</Text>
            <Text style={styles.comingSoonText}>Your Profile</Text>
            <Text style={styles.comingSoonSubtext}>
              {isPremium ? 'Premium Member' : 'Free Account'}
            </Text>
          </View>
        )}
      </Animated.View>
      
      {renderTabBar()}
      {renderPaywall()}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  actionCard: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.premium,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  plantCard: {
    width: 120,
    marginRight: 15,
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantImage: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  plantStatus: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.card,
    borderRadius: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.subtext,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 15,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 30,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  premiumBanner: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 25,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 15,
    lineHeight: 20,
  },
  premiumCTA: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  premiumAction: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultContainer: {
    backgroundColor: COLORS.card,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultImage: {
    width: '100%',
    height: 250,
  },
  resultContent: {
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  resultCommonName: {
    fontSize: 16,
    color: COLORS.subtext,
    marginBottom: 20,
  },
  confidenceBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  infoItem: {
    width: '47%',
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 5,
    lineHeight: 20,
  },
  warning: {
    color: COLORS.error,
    fontWeight: '600',
  },
  careSection: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  careText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  healthScoreContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: COLORS.background,
    marginBottom: 20,
  },
  healthScoreLabel: {
    fontSize: 16,
    color: COLORS.subtext,
    marginBottom: 15,
  },
  healthScoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  healthScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  healthScoreMax: {
    fontSize: 20,
    color: COLORS.subtext,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  healthGood: {
    color: COLORS.success,
  },
  healthModerate: {
    color: COLORS.accent,
  },
  healthPoor: {
    color: COLORS.error,
  },
  issuesSection: {
    padding: 20,
  },
  issueCard: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  severityHigh: {
    backgroundColor: '#FFEBEE',
  },
  severityModerate: {
    backgroundColor: '#FFF3E0',
  },
  severityLow: {
    backgroundColor: '#E8F5E9',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  issueCause: {
    fontSize: 13,
    color: COLORS.subtext,
    marginBottom: 5,
  },
  issueSolution: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  recommendationsSection: {
    padding: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  scheduleButton: {
    backgroundColor: COLORS.secondary,
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paywallContainer: {
    flex: 1,
  },
  paywallBlur: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  paywallContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: COLORS.subtext,
  },
  paywallTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: 25,
  },
  featuresGrid: {
    marginBottom: 30,
  },
  featureItem: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
    paddingLeft: 5,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  popularPlan: {
    borderColor: COLORS.primary,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  planSaving: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 5,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trialText: {
    fontSize: 12,
    color: COLORS.subtext,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.subtext,
  },
  activeTabIcon: {
    transform: [{ scale: 1.1 }],
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: COLORS.subtext,
    textAlign: 'center',
  },
});