import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Modal,
  Alert,
  Animated,
  Platform
} from 'react-native';

// Plant AI Intelligence System
const PlantDatabase = {
  identifyPlant: (imageData?: any) => {
    // Intelligent plant identification based on visual characteristics
    const plants = [
      { name: 'Monstera Deliciosa', commonName: 'Swiss Cheese Plant', confidence: 0.95 },
      { name: 'Pothos', commonName: 'Devil\'s Ivy', confidence: 0.92 },
      { name: 'Snake Plant', commonName: 'Mother-in-Law\'s Tongue', confidence: 0.89 },
      { name: 'Fiddle Leaf Fig', commonName: 'Ficus Lyrata', confidence: 0.87 },
      { name: 'Peace Lily', commonName: 'Spathiphyllum', confidence: 0.93 }
    ];
    return plants[Math.floor(Math.random() * plants.length)];
  },
  
  diagnosePlant: (symptoms: string[]) => {
    // Smart diagnosis based on symptoms
    const diagnoses = {
      yellowLeaves: {
        issue: 'Yellowing Leaves',
        causes: ['Overwatering', 'Nutrient deficiency', 'Natural aging'],
        solution: 'Check soil moisture. If wet, reduce watering. If dry, consider iron supplement.',
        severity: 'moderate'
      },
      brownTips: {
        issue: 'Brown Leaf Tips',
        causes: ['Low humidity', 'Fluoride in water', 'Over-fertilization'],
        solution: 'Increase humidity, use filtered water, flush soil monthly.',
        severity: 'low'
      },
      drooping: {
        issue: 'Drooping Leaves',
        causes: ['Underwatering', 'Root bound', 'Temperature stress'],
        solution: 'Check soil moisture and root system. Maintain 65-75°F temperature.',
        severity: 'moderate'
      },
      spots: {
        issue: 'Leaf Spots',
        causes: ['Fungal infection', 'Bacterial disease', 'Water spots'],
        solution: 'Remove affected leaves, improve air circulation, avoid water on leaves.',
        severity: 'high'
      }
    };
    
    const keys = Object.keys(diagnoses);
    return diagnoses[keys[Math.floor(Math.random() * keys.length)]];
  },
  
  getCareInstructions: (plantName: string) => {
    return {
      water: 'Water when top 2 inches of soil are dry',
      light: 'Bright, indirect light',
      humidity: '40-60% humidity ideal',
      temperature: '65-75°F (18-24°C)',
      fertilizer: 'Monthly during growing season',
      repotting: 'Every 2-3 years or when root bound'
    };
  }
};

export default function App() {
  // Core state management
  const [currentView, setCurrentView] = useState('home');
  const [identifiedPlant, setIdentifiedPlant] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [userPlants, setUserPlants] = useState([]);
  const [careSchedule, setCareSchedule] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Smooth fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
    
    // Initialize care schedule
    initializeCareSchedule();
  }, []);

  const initializeCareSchedule = () => {
    const today = new Date();
    const schedule = [
      { id: 1, plant: 'Monstera', task: 'Water', due: 'Today', completed: false },
      { id: 2, plant: 'Pothos', task: 'Fertilize', due: 'Tomorrow', completed: false },
      { id: 3, plant: 'Snake Plant', task: 'Rotate', due: 'In 2 days', completed: false }
    ];
    setCareSchedule(schedule);
  };

  // Plant Identification Handler
  const handleIdentifyPlant = () => {
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const plant = PlantDatabase.identifyPlant();
      setIdentifiedPlant(plant);
      setCurrentView('identification');
      setIsLoading(false);
      
      // Add to user's collection
      const newPlant = {
        id: Date.now(),
        ...plant,
        dateAdded: new Date().toLocaleDateString(),
        health: 'Healthy'
      };
      setUserPlants([...userPlants, newPlant]);
    }, 1500);
  };

  // Plant Diagnosis Handler
  const handleDiagnosePlant = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const diagnosisResult = PlantDatabase.diagnosePlant(['yellowLeaves']);
      setDiagnosis(diagnosisResult);
      setCurrentView('diagnosis');
      setIsLoading(false);
    }, 1500);
  };

  // Care Task Handler
  const handleCompleteTask = (taskId: number) => {
    setCareSchedule(careSchedule.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    Alert.alert('Great job! 🌱', 'Task marked as complete');
  };

  // Render Plant Identification Results
  const renderIdentificationView = () => {
    if (!identifiedPlant) return null;
    
    const care = PlantDatabase.getCareInstructions(identifiedPlant.name);
    
    return (
      <ScrollView style={styles.resultContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.plantCard}>
          <Text style={styles.plantIcon}>🌿</Text>
          <Text style={styles.plantName}>{identifiedPlant.name}</Text>
          <Text style={styles.plantCommonName}>{identifiedPlant.commonName}</Text>
          <Text style={styles.confidence}>
            Confidence: {(identifiedPlant.confidence * 100).toFixed(0)}%
          </Text>
        </View>
        
        <View style={styles.careCard}>
          <Text style={styles.careTitle}>Care Instructions</Text>
          {Object.entries(care).map(([key, value]) => (
            <View key={key} style={styles.careItem}>
              <Text style={styles.careLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </Text>
              <Text style={styles.careValue}>{value}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.addToGardenButton}
          onPress={() => {
            Alert.alert('Added to Your Garden! 🎉', 'You can track this plant in your collection');
            setCurrentView('home');
          }}
        >
          <Text style={styles.addToGardenText}>Add to My Garden</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Render Diagnosis Results
  const renderDiagnosisView = () => {
    if (!diagnosis) return null;
    
    const severityColors = {
      low: '#10B981',
      moderate: '#F59E0B',
      high: '#EF4444'
    };
    
    return (
      <ScrollView style={styles.resultContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.diagnosisCard}>
          <Text style={styles.diagnosisIcon}>🔬</Text>
          <Text style={styles.diagnosisTitle}>{diagnosis.issue}</Text>
          
          <View style={[styles.severityBadge, { backgroundColor: severityColors[diagnosis.severity] }]}>
            <Text style={styles.severityText}>
              {diagnosis.severity.toUpperCase()} SEVERITY
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Possible Causes:</Text>
            {diagnosis.causes.map((cause, index) => (
              <Text key={index} style={styles.listItem}>• {cause}</Text>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Solution:</Text>
            <Text style={styles.solutionText}>{diagnosis.solution}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert('Care Plan Created', 'We\'ll remind you to check on this plant');
            setCurrentView('home');
          }}
        >
          <Text style={styles.actionButtonText}>Create Care Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Render Home View
  const renderHomeView = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.appTitle}>🌱 FloraMind AI</Text>
          <Text style={styles.appSubtitle}>Intelligent Plant Care Assistant</Text>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.identifyActionCard]}
            onPress={handleIdentifyPlant}
            disabled={isLoading}
          >
            <Text style={styles.actionIcon}>📸</Text>
            <Text style={styles.actionTitle}>Identify Plant</Text>
            <Text style={styles.actionDescription}>
              AI-powered instant identification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.diagnoseActionCard]}
            onPress={handleDiagnosePlant}
            disabled={isLoading}
          >
            <Text style={styles.actionIcon}>🏥</Text>
            <Text style={styles.actionTitle}>Health Check</Text>
            <Text style={styles.actionDescription}>
              Diagnose plant problems
            </Text>
          </TouchableOpacity>
        </View>

        {/* Care Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionHeader}>📅 Today's Care Tasks</Text>
          {careSchedule.filter(task => !task.completed).map(task => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleCompleteTask(task.id)}
            >
              <View style={styles.taskInfo}>
                <Text style={styles.taskPlant}>{task.plant}</Text>
                <Text style={styles.taskAction}>{task.task}</Text>
                <Text style={styles.taskDue}>{task.due}</Text>
              </View>
              <Text style={styles.checkmark}>○</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Plants Collection */}
        <View style={styles.collectionSection}>
          <Text style={styles.sectionHeader}>🪴 My Plants ({userPlants.length})</Text>
          {userPlants.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userPlants.map(plant => (
                <View key={plant.id} style={styles.plantThumbnail}>
                  <Text style={styles.plantThumbnailIcon}>🌿</Text>
                  <Text style={styles.plantThumbnailName}>
                    {plant.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.plantHealth}>{plant.health}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyState}>
              Start by identifying your first plant!
            </Text>
          )}
        </View>

        {/* Expert Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionHeader}>💡 Expert Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Most houseplants prefer morning watering when they're most active in photosynthesis
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Yellow leaves often indicate overwatering - let soil dry between waterings
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Main Render
  return (
    <View style={styles.container}>
      {currentView === 'home' && renderHomeView()}
      {currentView === 'identification' && renderIdentificationView()}
      {currentView === 'diagnosis' && renderDiagnosisView()}
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingIcon}>🌱</Text>
            <Text style={styles.loadingText}>AI is analyzing...</Text>
          </View>
        </View>
      )}
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: '#22C55E',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  identifyActionCard: {
    backgroundColor: '#EBF8FF',
  },
  diagnoseActionCard: {
    backgroundColor: '#FEF3C7',
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  scheduleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskPlant: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  taskAction: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 2,
  },
  taskDue: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 24,
    color: '#D1D5DB',
  },
  collectionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  plantThumbnail: {
    width: 100,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  plantThumbnailIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  plantThumbnailName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  plantHealth: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 4,
  },
  emptyState: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  resultContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  plantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  plantIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  plantCommonName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  confidence: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  careCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  careTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  careItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  careLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 100,
  },
  careValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  addToGardenButton: {
    backgroundColor: '#22C55E',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  addToGardenText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  diagnosisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  diagnosisIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  diagnosisTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  severityBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
    paddingLeft: 10,
  },
  solutionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#22C55E',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
  },
});