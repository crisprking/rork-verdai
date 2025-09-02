import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, Sun, Scissors, Flower, Thermometer, Wind, ChevronRight, BookOpen, X, Leaf, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface CareGuide {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  tips: string[];
  color: string;
}

export default function CareScreen() {
  const [selectedGuide, setSelectedGuide] = useState<CareGuide | null>(null);

  const careGuides: CareGuide[] = useMemo(() => ([
    {
      id: 'watering',
      title: 'Watering',
      icon: <Droplets color="#1B4332" size={22} />,
      description: 'Learn when and how to water your plants properly.',
      tips: [
        'Check soil moisture with your finger before watering',
        'Water thoroughly until water drains from the bottom',
        'Empty saucers after 30 minutes to prevent root rot',
        'Water less frequently in winter when growth slows',
        'Use room temperature water when possible'
      ],
      color: '#1B4332',
    },
    {
      id: 'lighting',
      title: 'Light Requirements',
      icon: <Sun color="#F59E0B" size={22} />,
      description: 'Find the perfect spot for your plants to thrive.',
      tips: [
        'Most houseplants prefer bright, indirect light',
        'Rotate plants weekly to ensure even growth',
        'Use sheer curtains to filter harsh direct sunlight',
        'Consider grow lights for dark corners',
        'Watch for signs: stretching means more light needed'
      ],
      color: '#F59E0B',
    },
    {
      id: 'pruning',
      title: 'Pruning & Maintenance',
      icon: <Scissors color="#6D28D9" size={22} />,
      description: 'Keep your plants healthy with proper pruning.',
      tips: [
        'Remove yellow, dead, or damaged leaves promptly',
        'Use clean, sharp scissors or pruning shears',
        'Pinch growing tips to encourage bushy growth',
        'Best time to prune is during active growing season',
        'Cut just above a leaf node or junction'
      ],
      color: '#6D28D9',
    },
    {
      id: 'nutrition',
      title: 'Feeding & Soil',
      icon: <Flower color="#EC4899" size={22} />,
      description: 'Provide the right nutrients for healthy growth.',
      tips: [
        'Fertilize during spring and summer growing season',
        'Water plants before applying fertilizer',
        'Use balanced fertilizer at half the recommended strength',
        'Refresh potting soil annually for container plants',
        'Look for slow-release fertilizers for convenience'
      ],
      color: '#EC4899',
    },
    {
      id: 'temperature',
      title: 'Temperature',
      icon: <Thermometer color="#EF4444" size={22} />,
      description: 'Maintain comfortable temperatures for your plants.',
      tips: [
        'Most houseplants prefer 65-75°F (18-24°C)',
        'Keep plants away from heating and cooling vents',
        'Avoid placing plants near drafty windows',
        'Protect from sudden temperature changes',
        'Some plants need cooler winter temperatures'
      ],
      color: '#EF4444',
    },
    {
      id: 'humidity',
      title: 'Humidity',
      icon: <Wind color="#06B6D4" size={22} />,
      description: 'Create the right moisture levels in the air.',
      tips: [
        'Most tropical plants prefer 40-60% humidity',
        'Group plants together to create humid microclimates',
        'Use pebble trays filled with water under pots',
        'Consider a room humidifier for multiple plants',
        'Mist plants sparingly and only in the morning'
      ],
      color: '#06B6D4',
    },
  ]), []);

  const handleGuideSelect = useCallback((guide: CareGuide) => {
    setSelectedGuide(guide);
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.light.luxuryGradientStart, Colors.light.luxuryGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIcon}>
              <Leaf color={Colors.light.luxuryGold} size={28} strokeWidth={2.5} />
            </View>
            <View style={styles.sparkleIcon}>
              <Sparkles color="rgba(212, 175, 55, 0.8)" size={16} />
            </View>
          </View>
          <Text style={styles.headerTitle}>Plant Care</Text>
          <Text style={styles.headerSubtitle}>Essential guides for healthy plants</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.guidesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <BookOpen color="#1B4332" size={18} />
              <Text style={styles.sectionTitle}>Care Guides</Text>
            </View>
          </View>

          <View style={styles.guidesGrid}>
            {careGuides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                style={styles.guideCard}
                onPress={() => handleGuideSelect(guide)}
                testID={`guide-${guide.id}`}
              >
                <View style={styles.guideHeader}>
                  <View style={[styles.guideIcon, { backgroundColor: guide.color + '15' }]}>
                    {guide.icon}
                  </View>
                  <ChevronRight color="#52796F" size={16} />
                </View>
                <Text style={styles.guideTitle}>{guide.title}</Text>
                <Text style={styles.guideDescription}>{guide.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Guide detail modal */}
      <Modal
        visible={!!selectedGuide}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedGuide(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalIcon, { backgroundColor: selectedGuide?.color + '15' }]}>
                  {selectedGuide?.icon}
                </View>
                <Text style={styles.modalTitle}>{selectedGuide?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedGuide(null)} testID="close-guide">
                <X color="#1B4332" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>{selectedGuide?.description}</Text>
              
              <Text style={styles.tipsTitle}>Tips & Best Practices</Text>
              {selectedGuide?.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={[styles.tipNumber, { backgroundColor: selectedGuide.color }]}>
                    <Text style={styles.tipNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.light.luxuryBackground 
  },
  header: { 
    paddingTop: 60, 
    paddingBottom: 32, 
    paddingHorizontal: 20 
  },
  headerContent: { 
    alignItems: 'center' 
  },
  headerIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 8, 
    letterSpacing: 0.5 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.85)', 
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  content: { 
    padding: 20 
  },

  // Guides
  guidesSection: { 
    marginBottom: 24 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  sectionTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1B4332',
    letterSpacing: 0.3,
  },
  guidesGrid: { 
    gap: 16 
  },
  guideCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4, 
    borderWidth: 1, 
    borderColor: '#E8F5E8' 
  },
  guideHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  guideIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  guideTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1B4332', 
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  guideDescription: { 
    fontSize: 15, 
    color: '#6B7280', 
    lineHeight: 22, 
    fontWeight: '400' 
  },

  // Modal
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalCard: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    maxHeight: '85%', 
    paddingBottom: 20,
    borderWidth: 1, 
    borderColor: '#E8F5E8' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E8',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1B4332', 
    flex: 1,
    letterSpacing: 0.3,
  },
  modalBody: { 
    paddingHorizontal: 20, 
    paddingTop: 16 
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '400',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4332',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tipText: {
    fontSize: 15,
    color: '#1B4332',
    lineHeight: 22,
    flex: 1,
    fontWeight: '400',
  },
});