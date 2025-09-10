import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const handleIdentifyPlant = () => {
    console.log('Identify Plant clicked - Coming soon!');
  };

  const handleDiagnosePlant = () => {
    console.log('Diagnose Plant clicked - Coming soon!');
  };

  const handleUpgrade = () => {
    console.log('Upgrade clicked - Coming soon!');
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