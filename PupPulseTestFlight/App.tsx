import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  pulseScore: number;
  lastCheck: Date;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

interface HealthEvent {
  id: string;
  type: 'walk' | 'meal' | 'medication' | 'symptom' | 'vet_visit' | 'vaccination';
  title: string;
  description: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export default function App() {
  const [currentDog, setCurrentDog] = useState<Dog | null>(null);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [pulseScore, setPulseScore] = useState(87);
  const [healthStreak, setHealthStreak] = useState(5);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(1250);

  useEffect(() => {
    // Initialize with sample data
    const sampleDog: Dog = {
      id: '1',
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      weight: 28.5,
      pulseScore: 87,
      lastCheck: new Date(),
      healthStatus: 'excellent'
    };

    const sampleEvents: HealthEvent[] = [
      {
        id: '1',
        type: 'walk',
        title: 'Morning Walk',
        description: '30 minutes, good energy',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'low'
      },
      {
        id: '2',
        type: 'meal',
        title: 'Breakfast',
        description: '1 cup premium kibble + supplements',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: 'low'
      },
      {
        id: '3',
        type: 'symptom',
        title: 'Slight Limping',
        description: 'Noticed during evening walk',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        severity: 'medium'
      }
    ];

    setCurrentDog(sampleDog);
    setHealthEvents(sampleEvents);
  }, []);

  const getPulseScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#8BC34A';
    if (score >= 60) return '#FFC107';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '😊';
      case 'good': return '🙂';
      case 'fair': return '😐';
      case 'poor': return '😟';
      case 'critical': return '⚠️';
      default: return '🐕';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FFC107';
      case 'poor': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleEmergencyMode = () => {
    Alert.alert(
      '🚨 Emergency Mode Activated',
      'Your dog needs immediate veterinary attention. We\'re here to help you through this.',
      [
        { text: 'Call Nearest Vet', onPress: () => console.log('Calling vet...') },
        { text: 'Export Health Report', onPress: () => console.log('Exporting...') },
        { text: 'Find Emergency Clinic', onPress: () => console.log('Finding clinic...') }
      ]
    );
  };

  const handleSymptomChecker = () => {
    Alert.alert(
      '🔍 AI Symptom Checker',
      'Describe your dog\'s symptoms and we\'ll provide immediate triage guidance.',
      [
        { text: 'Start Symptom Check', onPress: () => console.log('Starting check...') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (!currentDog) {
    return (
      <View style={[styles.container, { backgroundColor: '#4CAF50' }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>🐕</Text>
          <Text style={styles.loadingText}>Loading PupPulse...</Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#4CAF50' }]}>
        <View style={styles.headerContent}>
          <View style={styles.dogInfo}>
            <Text style={styles.dogIcon}>🐕</Text>
            <View style={styles.dogDetails}>
              <Text style={styles.dogName}>{currentDog.name}</Text>
              <Text style={styles.dogBreed}>{currentDog.breed} • {currentDog.age} years</Text>
            </View>
          </View>
          
          <View style={styles.pulseScoreContainer}>
            <Text style={styles.pulseScoreLabel}>Pulse Score</Text>
            <Text style={[styles.pulseScore, { color: getPulseScoreColor(pulseScore) }]}>
              {pulseScore}
            </Text>
            <View style={styles.healthStatus}>
              <Text style={styles.healthStatusIcon}>{getHealthStatusIcon(currentDog.healthStatus)}</Text>
              <Text style={[styles.healthStatusText, { color: getHealthStatusColor(currentDog.healthStatus) }]}>
                {currentDog.healthStatus.toUpperCase()}
              </Text>
            </View>
            
            {/* Gamification Elements */}
            <View style={styles.gamificationRow}>
              <View style={styles.levelContainer}>
                <Text style={styles.levelIcon}>⭐</Text>
                <Text style={styles.levelText}>Level {level}</Text>
              </View>
              <View style={styles.streakContainer}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakText}>{healthStreak} days</Text>
              </View>
            </View>
            
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>XP: {xp}</Text>
              <View style={styles.xpBar}>
                <View style={[styles.xpProgress, { width: `${(xp % 1000) / 10}%` }]} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSymptomChecker}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Symptom Check</Text>
            <Text style={styles.actionXP}>+10 XP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Log Event</Text>
            <Text style={styles.actionXP}>+5 XP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Schedule</Text>
            <Text style={styles.actionXP}>+8 XP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📹</Text>
            <Text style={styles.actionText}>Vet Chat</Text>
            <Text style={styles.actionXP}>+15 XP</Text>
          </TouchableOpacity>
        </View>

        {/* Health Overview */}
        <View style={styles.healthOverview}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.healthMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{currentDog.weight} kg</Text>
              <Text style={styles.metricLabel}>Weight</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>3.2 km</Text>
              <Text style={styles.metricLabel}>Today's Walk</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>2/3</Text>
              <Text style={styles.metricLabel}>Meals</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>14h</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
            </View>
          </View>
        </View>

        {/* Recent Health Events */}
        <View style={styles.recentEvents}>
          <Text style={styles.sectionTitle}>Recent Health Events</Text>
          {healthEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventIcon}>
                <Text style={styles.eventIconText}>
                  {event.type === 'walk' ? '🚶' :
                   event.type === 'meal' ? '🍽️' :
                   event.type === 'medication' ? '💊' :
                   event.type === 'symptom' ? '⚠️' :
                   event.type === 'vet_visit' ? '🏥' :
                   '💉'}
                </Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
                <Text style={styles.eventTime}>
                  {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {event.severity && (
                <View style={[styles.severityBadge, { 
                  backgroundColor: event.severity === 'critical' ? '#F44336' :
                                 event.severity === 'high' ? '#FF9800' :
                                 event.severity === 'medium' ? '#FFC107' : '#4CAF50'
                }]}>
                  <Text style={styles.severityText}>{event.severity.toUpperCase()}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* AI Insights */}
        <View style={styles.aiInsights}>
          <Text style={styles.sectionTitle}>🤖 AI Health Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Great job with Buddy's care!</Text>
              <Text style={styles.insightDescription}>
                His pulse score of 87 indicates excellent health. Keep up the regular walks and balanced diet.
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyMode}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyText}>Emergency Mode</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dogInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dogIcon: {
    fontSize: 32,
  },
  dogDetails: {
    marginLeft: 12,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dogBreed: {
    fontSize: 16,
    color: '#E8F5E8',
    marginTop: 2,
  },
  pulseScoreContainer: {
    alignItems: 'center',
  },
  pulseScoreLabel: {
    fontSize: 14,
    color: '#E8F5E8',
    marginBottom: 4,
  },
  pulseScore: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  healthStatusIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  healthOverview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recentEvents: {
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventIconText: {
    fontSize: 24,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  aiInsights: {
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    fontSize: 80,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
  },
  // Gamification Styles
  gamificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    width: '100%',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpContainer: {
    marginTop: 8,
    width: '100%',
  },
  xpText: {
    color: '#E8F5E8',
    fontSize: 12,
    marginBottom: 4,
  },
  xpBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  actionXP: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
});