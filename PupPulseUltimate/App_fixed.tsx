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
