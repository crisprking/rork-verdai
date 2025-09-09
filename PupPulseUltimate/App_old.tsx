import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions, Animated, Vibration, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

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
  energyLevel: number;
  mood: 'happy' | 'calm' | 'anxious' | 'excited' | 'tired';
  lastMeal: Date;
  lastWalk: Date;
  vaccinationStatus: 'up_to_date' | 'due_soon' | 'overdue';
  nextVetAppointment?: Date;
  medicalConditions: string[];
  medications: string[];
  allergies: string[];
}

interface HealthEvent {
  id: string;
  type: 'walk' | 'meal' | 'medication' | 'symptom' | 'vet_visit' | 'vaccination' | 'grooming' | 'play' | 'training' | 'socialization' | 'sleep' | 'bathroom';
  title: string;
  description: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  duration?: number; // in minutes
  location?: string;
  notes?: string;
  photos?: string[];
}

interface AIInsight {
  id: string;
  type: 'health' | 'behavior' | 'nutrition' | 'exercise' | 'warning' | 'achievement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  actionable: boolean;
  actionText?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  category: 'health' | 'care' | 'exercise' | 'social' | 'learning';
}

export default function App() {
  const [currentDog, setCurrentDog] = useState<Dog | null>(null);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showVetChat, setShowVetChat] = useState(false);
  const [showHealthReport, setShowHealthReport] = useState(false);
  const [pulseScore, setPulseScore] = useState(87);
  const [healthStreak, setHealthStreak] = useState(5);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(1250);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [streakAnimation] = useState(new Animated.Value(1));
  const [heartbeatAnimation] = useState(new Animated.Value(1));
  const [notificationCount, setNotificationCount] = useState(3);
  const [isPremium, setIsPremium] = useState(true);
  const [dailyGoal, setDailyGoal] = useState({ walks: 2, meals: 3, play: 30, completed: 0 });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadAppData();
    startHeartbeatAnimation();
  }, [startHeartbeatAnimation]);

  const loadAppData = () => {
    // Create comprehensive sample dog data
    const sampleDog: Dog = {
      id: '1',
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      weight: 28.5,
      pulseScore: 87,
      lastCheck: new Date(),
      healthStatus: 'excellent',
      energyLevel: 8,
      mood: 'happy',
      lastMeal: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastWalk: new Date(Date.now() - 4 * 60 * 60 * 1000),
      vaccinationStatus: 'up_to_date',
      nextVetAppointment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      medicalConditions: [],
      medications: ['Heartworm prevention'],
      allergies: ['Chicken']
    };

    // Create comprehensive sample events
    const sampleEvents: HealthEvent[] = [
      {
        id: '1',
        type: 'walk',
        title: 'Morning Walk',
        description: '30 minutes, good energy',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'low',
        duration: 30,
        location: 'Central Park',
        notes: 'Perfect weather, Buddy was very energetic'
      },
      {
        id: '2',
        type: 'meal',
        title: 'Breakfast',
        description: '1 cup premium kibble + supplements',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: 'low',
        duration: 15
      },
      {
        id: '3',
        type: 'play',
        title: 'Fetch Session',
        description: '15 minutes of active play',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        severity: 'low',
        duration: 15,
        location: 'Backyard'
      },
      {
        id: '4',
        type: 'training',
        title: 'Obedience Training',
        description: 'Sit, stay, come commands practice',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        severity: 'low',
        duration: 20
      },
      {
        id: '5',
        type: 'grooming',
        title: 'Weekly Grooming',
        description: 'Brushing and nail trimming',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        severity: 'low',
        duration: 45
      }
    ];

    // Create AI insights
    const sampleInsights: AIInsight[] = [
      {
        id: '1',
        type: 'health',
        title: '🌟 Excellent Health Score!',
        description: 'Buddy is in perfect health! Keep up the great care routine.',
        priority: 'low',
        timestamp: new Date(),
        actionable: false
      },
      {
        id: '2',
        type: 'exercise',
        title: '🚶 Exercise Recommendation',
        description: 'Consider adding a 15-minute evening walk to reach daily exercise goals.',
        priority: 'medium',
        timestamp: new Date(),
        actionable: true,
        actionText: 'Schedule Evening Walk'
      },
      {
        id: '3',
        type: 'nutrition',
        title: '🍎 Nutrition Tip',
        description: 'Buddy\'s weight is perfect! Continue the current feeding schedule.',
        priority: 'low',
        timestamp: new Date(),
        actionable: false
      }
    ];

    // Create achievements
    const sampleAchievements: Achievement[] = [
      {
        id: '1',
        title: 'Week Warrior',
        description: 'Maintained health streak for 7 days',
        icon: 'local-fire-department',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        xpReward: 100,
        category: 'health'
      },
      {
        id: '2',
        title: 'Walking Champion',
        description: 'Completed 10 walks this week',
        icon: 'directions-walk',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        xpReward: 75,
        category: 'exercise'
      },
      {
        id: '3',
        title: 'Health Monitor',
        description: 'Logged health data for 30 days',
        icon: 'monitor-heart',
        unlocked: false,
        xpReward: 200,
        category: 'care'
      }
    ];

    setCurrentDog(sampleDog);
    setHealthEvents(sampleEvents);
    setAiInsights(sampleInsights);
    setAchievements(sampleAchievements);
  };

  // 🎮 Enhanced Gamification Functions
  const addXP = useCallback((amount: number) => {
    setXp(prev => {
      const newXP = prev + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setShowAchievement(`🎉 Level Up! Level ${newLevel}`);
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate([0, 200, 100, 200]);
        }
        setTimeout(() => setShowAchievement(null), 3000);
      }
      return newXP;
    });
  }, [level]);

  const addHealthStreak = useCallback(() => {
    setHealthStreak(prev => {
      const newStreak = prev + 1;
      if (newStreak % 7 === 0) {
        setShowAchievement('🔥 Week Warrior! 7-day streak!');
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate([0, 200, 100, 200]);
        }
        setTimeout(() => setShowAchievement(null), 3000);
      }
      return newStreak;
    });
  }, []);

  // Heartbeat animation for pulse score
  const startHeartbeatAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatAnimation, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnimation, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    ).start();
  }, [heartbeatAnimation]);

  const pulseAnimationEffect = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnimation]);

  const streakAnimationEffect = useCallback(() => {
    Animated.sequence([
      Animated.timing(streakAnimation, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(streakAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [streakAnimation]);

  const getPulseScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#8BC34A';
    if (score >= 60) return '#FFC107';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return 'sentiment-very-satisfied';
      case 'good': return 'sentiment-satisfied';
      case 'fair': return 'sentiment-neutral';
      case 'poor': return 'sentiment-dissatisfied';
      case 'critical': return 'warning';
      default: return 'pets';
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
    setIsEmergencyMode(true);
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Vibration.vibrate([0, 500, 200, 500]);
    }
    Alert.alert(
      '🚨 Emergency Mode Activated',
      'Your dog needs immediate veterinary attention. We\'re here to help you through this.',
      [
        { 
          text: 'Call Nearest Vet', 
          onPress: () => {
            Linking.openURL('tel:+1234567890');
            addXP(50);
          }
        },
        { 
          text: 'Export Health Report', 
          onPress: () => {
            console.log('Exporting health report...');
            addXP(25);
          }
        },
        { 
          text: 'Find Emergency Clinic', 
          onPress: () => {
            Linking.openURL('https://maps.google.com/?q=emergency+vet+clinic');
            addXP(25);
          }
        }
      ]
    );
  };

  const handleSymptomChecker = () => {
    setShowSymptomChecker(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      '🔍 AI Symptom Checker',
      'Describe your dog\'s symptoms and we\'ll provide immediate triage guidance.',
      [
        { 
          text: 'Start Symptom Check', 
          onPress: () => {
            console.log('Starting AI symptom check...');
            addXP(20);
            pulseAnimationEffect();
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleLogEvent = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      '📝 Log Health Event',
      'What would you like to log?',
      [
        { 
          text: '🚶 Walk', 
          onPress: () => { 
            addXP(10); 
            addHealthStreak(); 
            pulseAnimationEffect();
            setDailyGoal(prev => ({ ...prev, completed: prev.completed + 1 }));
          }
        },
        { 
          text: '🍽️ Meal', 
          onPress: () => { 
            addXP(5); 
            pulseAnimationEffect();
            setDailyGoal(prev => ({ ...prev, completed: prev.completed + 1 }));
          }
        },
        { 
          text: '🎾 Play', 
          onPress: () => { 
            addXP(15); 
            pulseAnimationEffect();
            setDailyGoal(prev => ({ ...prev, completed: prev.completed + 1 }));
          }
        },
        { 
          text: '✂️ Grooming', 
          onPress: () => { 
            addXP(8); 
            pulseAnimationEffect();
            setDailyGoal(prev => ({ ...prev, completed: prev.completed + 1 }));
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSchedule = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      '📅 Schedule Management',
      'Manage your dog\'s health schedule',
      [
        { 
          text: '⏰ Set Reminders', 
          onPress: () => { 
            addXP(8); 
            pulseAnimationEffect();
            console.log('Setting up health reminders...');
          }
        },
        { 
          text: '📅 View Calendar', 
          onPress: () => { 
            addXP(5); 
            pulseAnimationEffect();
            console.log('Opening health calendar...');
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleVetChat = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      '📹 Vet Consultation',
      'Connect with veterinary professionals',
      [
        { 
          text: '📞 Start Video Call', 
          onPress: () => { 
            addXP(15); 
            pulseAnimationEffect();
            setShowVetChat(true);
            console.log('Starting video consultation...');
          }
        },
        { 
          text: '💬 Send Message', 
          onPress: () => { 
            addXP(10); 
            pulseAnimationEffect();
            console.log('Opening chat with vet...');
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleHealthReport = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowHealthReport(true);
    addXP(20);
    pulseAnimationEffect();
  };

  const handlePremiumFeatures = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    Alert.alert(
      '⭐ Premium Features',
      'Unlock advanced AI insights, unlimited vet consultations, and priority support!',
      [
        { text: 'Upgrade Now', onPress: () => console.log('Opening premium upgrade...') },
        { text: 'Learn More', onPress: () => console.log('Showing premium features...') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (!currentDog) {
    return (
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="pets" size={80} color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading PupPulse...</Text>
        </View>
        <StatusBar style="light" />
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.dogInfo}>
            <Animated.View style={{ transform: [{ scale: heartbeatAnimation }] }}>
              <MaterialIcons name="pets" size={32} color="#FFFFFF" />
            </Animated.View>
            <View style={styles.dogDetails}>
              <View style={styles.dogNameRow}>
                <Text style={styles.dogName}>{currentDog.name}</Text>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.premiumText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.dogBreed}>{currentDog.breed} • {currentDog.age} years</Text>
              <View style={styles.moodContainer}>
                <MaterialIcons 
                  name={currentDog.mood === 'happy' ? 'sentiment-very-satisfied' : 
                        currentDog.mood === 'calm' ? 'sentiment-satisfied' :
                        currentDog.mood === 'anxious' ? 'sentiment-dissatisfied' :
                        currentDog.mood === 'excited' ? 'sentiment-very-satisfied' : 'sentiment-neutral'} 
                  size={16} 
                  color="#FFFFFF" 
                />
                <Text style={styles.moodText}>{currentDog.mood.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.pulseScoreContainer}>
            <Text style={styles.pulseScoreLabel}>Pulse Score</Text>
            <Animated.Text 
              style={[
                styles.pulseScore, 
                { 
                  color: getPulseScoreColor(pulseScore),
                  transform: [{ scale: pulseAnimation }]
                }
              ]}
            >
              {pulseScore}
            </Animated.Text>
            <View style={styles.healthStatus}>
              <MaterialIcons 
                name={getHealthStatusIcon(currentDog.healthStatus)} 
                size={20} 
                color={getHealthStatusColor(currentDog.healthStatus)} 
              />
              <Text style={[styles.healthStatusText, { color: getHealthStatusColor(currentDog.healthStatus) }]}>
                {currentDog.healthStatus.toUpperCase()}
              </Text>
            </View>
            
            {/* Energy Level Indicator */}
            <View style={styles.energyContainer}>
              <MaterialIcons name="battery-full" size={16} color="#FFFFFF" />
              <View style={styles.energyBar}>
                <View style={[styles.energyFill, { width: `${(currentDog.energyLevel / 10) * 100}%` }]} />
              </View>
              <Text style={styles.energyText}>{currentDog.energyLevel}/10</Text>
            </View>
            
            {/* Gamification Elements */}
            <View style={styles.gamificationRow}>
              <View style={styles.levelContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.levelText}>Level {level}</Text>
              </View>
              <View style={styles.streakContainer}>
                <Animated.View style={{ transform: [{ scale: streakAnimation }] }}>
                  <MaterialIcons name="local-fire-department" size={16} color="#FF6B35" />
                </Animated.View>
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
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Achievement Notification */}
        {showAchievement && (
          <View style={styles.achievementNotification}>
            <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
            <Text style={styles.achievementText}>{showAchievement}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.premiumAction]} 
            onPress={() => {
              handleSymptomChecker();
              addXP(10);
              pulseAnimationEffect();
            }}
          >
            <MaterialIcons name="medical-services" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>AI Check</Text>
            <Text style={styles.actionXP}>+10 XP</Text>
            {isPremium && <View style={styles.premiumDot} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLogEvent}
          >
            <MaterialIcons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Log Event</Text>
            <Text style={styles.actionXP}>+5 XP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSchedule}
          >
            <MaterialIcons name="schedule" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Schedule</Text>
            <Text style={styles.actionXP}>+8 XP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.premiumAction]}
            onPress={handleVetChat}
          >
            <MaterialIcons name="videocam" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Vet Chat</Text>
            <Text style={styles.actionXP}>+15 XP</Text>
            {isPremium && <View style={styles.premiumDot} />}
          </TouchableOpacity>
        </View>

        {/* Additional Premium Actions */}
        <View style={styles.premiumActions}>
          <TouchableOpacity 
            style={[styles.premiumButton, styles.healthReportButton]}
            onPress={handleHealthReport}
          >
            <MaterialIcons name="assessment" size={20} color="#FFFFFF" />
            <Text style={styles.premiumButtonText}>Health Report</Text>
            <Text style={styles.premiumButtonXP}>+20 XP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.premiumButton, styles.premiumFeaturesButton]}
            onPress={handlePremiumFeatures}
          >
            <MaterialIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.premiumButtonText}>Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Health Overview */}
        <View style={styles.healthOverview}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Overview</Text>
            <TouchableOpacity onPress={() => setNotificationCount(0)}>
              <View style={styles.notificationBadge}>
                <MaterialIcons name="notifications" size={20} color="#4CAF50" />
                {notificationCount > 0 && (
                  <View style={styles.notificationCount}>
                    <Text style={styles.notificationCountText}>{notificationCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.healthMetrics}>
            <View style={styles.metric}>
              <MaterialIcons name="monitor-weight" size={24} color="#4CAF50" />
              <Text style={styles.metricValue}>{currentDog.weight} kg</Text>
              <Text style={styles.metricLabel}>Weight</Text>
            </View>
            <View style={styles.metric}>
              <MaterialIcons name="directions-walk" size={24} color="#4CAF50" />
              <Text style={styles.metricValue}>3.2 km</Text>
              <Text style={styles.metricLabel}>Today's Walk</Text>
            </View>
            <View style={styles.metric}>
              <MaterialIcons name="restaurant" size={24} color="#4CAF50" />
              <Text style={styles.metricValue}>2/3</Text>
              <Text style={styles.metricLabel}>Meals</Text>
            </View>
            <View style={styles.metric}>
              <MaterialIcons name="bedtime" size={24} color="#4CAF50" />
              <Text style={styles.metricValue}>14h</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
            </View>
          </View>
          
          {/* Daily Goals Progress */}
          <View style={styles.dailyGoalsContainer}>
            <Text style={styles.dailyGoalsTitle}>Daily Goals</Text>
            <View style={styles.goalProgress}>
              <View style={styles.goalItem}>
                <Text style={styles.goalText}>Walks: {dailyGoal.completed}/{dailyGoal.walks}</Text>
                <View style={styles.goalBar}>
                  <View style={[styles.goalFill, { width: `${(dailyGoal.completed / dailyGoal.walks) * 100}%` }]} />
                </View>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalText}>Meals: {dailyGoal.completed}/{dailyGoal.meals}</Text>
                <View style={styles.goalBar}>
                  <View style={[styles.goalFill, { width: `${(dailyGoal.completed / dailyGoal.meals) * 100}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Health Events */}
        <View style={styles.recentEvents}>
          <Text style={styles.sectionTitle}>Recent Health Events</Text>
          {healthEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventIcon}>
                <MaterialIcons 
                  name={
                    event.type === 'walk' ? 'directions-walk' :
                    event.type === 'meal' ? 'restaurant' :
                    event.type === 'medication' ? 'medication' :
                    event.type === 'symptom' ? 'warning' :
                    event.type === 'vet_visit' ? 'local-hospital' :
                    event.type === 'vaccination' ? 'vaccines' :
                    event.type === 'grooming' ? 'content-cut' :
                    'sports'
                  } 
                  size={24} 
                  color="#4CAF50" 
                />
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
          {aiInsights.map((insight) => (
            <View key={insight.id} style={[styles.insightCard, styles[`insight${insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}`]]}>
              <MaterialIcons 
                name={
                  insight.type === 'health' ? 'favorite' :
                  insight.type === 'behavior' ? 'psychology' :
                  insight.type === 'nutrition' ? 'restaurant' :
                  insight.type === 'exercise' ? 'fitness-center' :
                  insight.type === 'warning' ? 'warning' :
                  'emoji-events'
                } 
                size={24} 
                color={
                  insight.priority === 'urgent' ? '#F44336' :
                  insight.priority === 'high' ? '#FF9800' :
                  insight.priority === 'medium' ? '#FFC107' : '#4CAF50'
                } 
              />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                {insight.actionable && (
                  <TouchableOpacity style={styles.insightAction}>
                    <Text style={styles.insightActionText}>{insight.actionText}</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
    </View>

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyMode}>
          <MaterialIcons name="emergency" size={24} color="#FFFFFF" />
          <Text style={styles.emergencyText}>Emergency Mode</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusBar style="light" />
    </SafeAreaView>
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
  healthStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
    marginBottom: 8,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
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
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
  achievementNotification: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  achievementText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionXP: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  // Enhanced Premium Styles
  dogNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  moodText: {
    color: '#E8F5E8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  energyBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  energyText: {
    color: '#E8F5E8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumAction: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  premiumActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  healthReportButton: {
    backgroundColor: '#2196F3',
  },
  premiumFeaturesButton: {
    backgroundColor: '#FFD700',
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  premiumButtonXP: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationBadge: {
    position: 'relative',
  },
  notificationCount: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  dailyGoalsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  dailyGoalsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  goalProgress: {
    gap: 12,
  },
  goalItem: {
    gap: 4,
  },
  goalText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  goalBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  insightLow: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  insightMedium: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  insightHigh: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  insightUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  insightActionText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});