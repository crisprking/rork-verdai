import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function App() {
  const handleIdentifyPlant = () => {
    Alert.alert('🌱 Plant Identification', 'Take a photo of your plant and AI will identify it instantly!');
  };

  const handleDiagnosePlant = () => {
    Alert.alert('🔬 Plant Diagnosis', 'Upload a photo and get expert health analysis!');
  };

  const handleCareGuide = () => {
    Alert.alert('📖 Care Guide', 'Get personalized watering, light, and care instructions!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 FloraMind AI</Text>
        <Text style={styles.subtitle}>Smart Plant Care Assistant</Text>
      </View>

      <View style={styles.features}>
        <TouchableOpacity style={[styles.button, styles.identifyBtn]} onPress={handleIdentifyPlant}>
          <Text style={styles.buttonIcon}>📸</Text>
          <Text style={styles.buttonTitle}>Identify Plant</Text>
          <Text style={styles.buttonDesc}>AI-powered instant identification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.diagnoseBtn]} onPress={handleDiagnosePlant}>
          <Text style={styles.buttonIcon}>🔬</Text>
          <Text style={styles.buttonTitle}>Health Check</Text>
          <Text style={styles.buttonDesc}>Diagnose plant problems</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.careBtn]} onPress={handleCareGuide}>
          <Text style={styles.buttonIcon}>📖</Text>
          <Text style={styles.buttonTitle}>Care Guide</Text>
          <Text style={styles.buttonDesc}>Personalized care instructions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>🚀 Available on App Store Soon!</Text>
        <Text style={styles.infoText}>
          FloraMind AI is the smartest plant care assistant with AI-powered plant identification,
          health diagnosis, and personalized care guides.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#22C55E',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  features: {
    padding: 20,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  buttonDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  identifyBtn: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  diagnoseBtn: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  careBtn: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  info: {
    padding: 30,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});