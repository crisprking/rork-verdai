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
import { Droplets, Sun, Scissors, Flower, Thermometer, Wind, ChevronRight, BookOpen, Users, Globe, X } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'research': return '#1B4332';
    case 'trends': return '#2D5A27';
    case 'expert': return '#52796F';
    case 'seasonal': return '#2D5A27';
    default: return '#6B7280';
  }
};

interface CareGuide {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  tips: string[];
  color: string;
}

interface PlantUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  date: string;
  category: 'research' | 'trends' | 'expert' | 'seasonal';
  readTime: string;
  featured?: boolean;
  author?: string;
  tags?: string[];
}

export default function CareScreen() {
  const [selectedGuide, setSelectedGuide] = useState<CareGuide | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<PlantUpdate | null>(null);
  const [showAllUpdates, setShowAllUpdates] = useState<boolean>(false);

  const { data: plantUpdates } = useQuery({
    queryKey: ['plant-updates:v2'],
    queryFn: async () => {
      const today = new Date();
      const formatDate = (daysAgo: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };
      return [
        {
          id: '1',
          title: 'Simple soil check that prevents overwatering',
          content: 'Before watering, press your finger 1-2 inches into the soil. If it feels cool and slightly damp, wait a day. If dry, water evenly until a little drains out the bottom.',
          source: 'Everyday Plant Care',
          author: 'Flora Team',
          date: formatDate(0),
          category: 'expert' as const,
          readTime: '1 min',
          featured: true,
          tags: ['Watering', 'Basics']
        },
        {
          id: '2',
          title: 'Bright indirect light, demystified',
          content: 'Near a bright window with sheer curtains or a spot where you can read a book without turning on a lamp in daytime. Avoid harsh midday sun that leaves sharp shadows.',
          source: 'Light Made Easy',
          author: 'Flora Team',
          date: formatDate(1),
          category: 'expert' as const,
          readTime: '2 min',
          tags: ['Light', 'Placement']
        },
        {
          id: '3',
          title: 'Winter care: less water, more observation',
          content: 'Most houseplants slow growth in cooler months. Water less often, keep away from vents, and rotate weekly to balance limited light.',
          source: 'Seasonal Notes',
          author: 'Flora Team',
          date: formatDate(7),
          category: 'seasonal' as const,
          readTime: '2 min',
          tags: ['Seasonal', 'Winter']
        },
      ] as PlantUpdate[];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const careGuides: CareGuide[] = useMemo(() => ([
    {
      id: 'watering',
      title: 'Watering basics',
      icon: <Droplets color="#1B4332" size={22} />,
      description: 'How to water just right — not too much, not too little.',
      tips: [
        'Check soil with the finger test before watering',
        'Water thoroughly; let excess drain out',
        'Empty saucers so roots don’t sit in water',
        'In winter, reduce frequency for most plants'
      ],
      color: '#1B4332',
    },
    {
      id: 'lighting',
      title: 'Finding the right light',
      icon: <Sun color="#F59E0B" size={22} />,
      description: 'Place plants where light fits their needs and season.',
      tips: [
        'Most plants prefer bright, indirect light',
        'Rotate weekly to avoid leaning',
        'Use sheer curtains to soften harsh sun',
        'Add a simple grow bulb for dark corners'
      ],
      color: '#F59E0B',
    },
    {
      id: 'pruning',
      title: 'Pruning made easy',
      icon: <Scissors color="#6D28D9" size={22} />,
      description: 'Trim to keep plants tidy and encourage fresh growth.',
      tips: [
        'Remove yellow, damaged, or leggy growth',
        'Use clean, sharp scissors',
        'Pinch tips to encourage fullness',
        'Best time: active growth seasons'
      ],
      color: '#6D28D9',
    },
    {
      id: 'nutrition',
      title: 'Feeding and soil',
      icon: <Flower color="#EC4899" size={22} />,
      description: 'Light, consistent feeding supports steady growth.',
      tips: [
        'Fertilize lightly during spring–summer',
        'Water first, then feed to avoid burn',
        'Use a balanced fertilizer at half strength',
        'Refresh soil yearly for potted plants'
      ],
      color: '#EC4899',
    },
    {
      id: 'temperature',
      title: 'Comfortable temperatures',
      icon: <Thermometer color="#EF4444" size={22} />,
      description: 'Most houseplants like 65–75°F (18–24°C).',
      tips: [
        'Keep away from hot/cold drafts',
        'Avoid direct blasts from vents',
        'Protect from sudden swings in temperature'
      ],
      color: '#EF4444',
    },
    {
      id: 'humidity',
      title: 'Humidity help',
      icon: <Wind color="#06B6D4" size={22} />,
      description: 'Aim for 40–60% for tropical plants.',
      tips: [
        'Group plants to create a humid microclimate',
        'Use a tray with pebbles + water under pots',
        'A small room humidifier works wonders'
      ],
      color: '#06B6D4',
    },
  ]), []);

  const handleGuideSelect = useCallback((guide: CareGuide) => {
    setSelectedGuide(guide);
  }, []);

  if (selectedGuide) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="care-screen-details">
        <LinearGradient colors={[selectedGuide.color, selectedGuide.color + 'CC']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedGuide(null)} testID="care-back">
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>{selectedGuide.icon}</View>
            <Text style={styles.headerTitle}>{selectedGuide.title}</Text>
            <Text style={styles.headerSubtitle}>{selectedGuide.description}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Tips</Text>
            {selectedGuide.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={[styles.tipNumber, { backgroundColor: selectedGuide.color }]}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="care-screen">
      <LinearGradient colors={['#081C15', '#1B4332']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSubtitle}>Clear, actionable plant care guidance</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Expert Insights */}
        {plantUpdates && plantUpdates.length > 0 ? (
          <View style={styles.insightsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Users color="#1B4332" size={18} />
                <Text style={styles.sectionTitle}>Quick reads</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAllUpdates((s) => !s)}
                testID="toggle-updates"
              >
                <Text style={styles.viewAllText}>{showAllUpdates ? 'Show featured' : 'View all'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
              {(showAllUpdates ? plantUpdates : plantUpdates.filter(u => u.featured)).map((update) => (
                <TouchableOpacity
                  key={update.id}
                  style={styles.insightCard}
                  onPress={() => setSelectedUpdate(update)}
                  testID={`update-${update.id}`}
                >
                  <View style={styles.updateHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(update.category) }]}>
                      <Text style={styles.categoryText}>{update.category.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.updateDate}>{update.date}</Text>
                  </View>
                  <Text style={styles.updateTitle}>{update.title}</Text>
                  <Text style={styles.updateContent} numberOfLines={3}>{update.content}</Text>
                  <View style={styles.updateFooter}>
                    <Text style={styles.updateSource}>{update.source}</Text>
                    <Text style={styles.updateReadTime}>{update.readTime}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Care Guides */}
        <View style={styles.guidesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <BookOpen color="#1B4332" size={18} />
              <Text style={styles.sectionTitle}>Care guides</Text>
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

      {/* Update detail modal */}
      <Modal
        visible={!!selectedUpdate}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUpdate(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedUpdate?.title ?? ''}</Text>
              <TouchableOpacity onPress={() => setSelectedUpdate(null)} accessibilityRole="button" testID="close-update">
                <X color="#1B4332" size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalContent}>{selectedUpdate?.content ?? ''}</Text>
              <View style={styles.modalMeta}>
                <Text style={styles.modalMetaText}>{selectedUpdate?.source ?? ''}</Text>
                <Text style={styles.modalMetaText}>{selectedUpdate?.date ?? ''} • {selectedUpdate?.readTime ?? ''}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, letterSpacing: 0.4 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  content: { padding: 20 },

  // Insights
  insightsSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1B4332' },
  viewAllText: { fontSize: 14, color: '#52796F', fontWeight: '600' },
  insightsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  insightCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginRight: 12, width: width * 0.78, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: '#E8F5E8' },
  updateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  updateDate: { fontSize: 12, color: '#9CA3AF' },
  updateTitle: { fontSize: 16, fontWeight: '700', color: '#1B4332', marginBottom: 6 },
  updateContent: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  updateFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  updateSource: { fontSize: 12, color: '#9CA3AF' },
  updateReadTime: { fontSize: 12, color: '#9CA3AF' },

  // Guides
  guidesSection: { marginTop: 8, marginBottom: 24 },
  guidesGrid: { gap: 12 },
  guideCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#E8F5E8' },
  guideHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guideIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  guideTitle: { fontSize: 16, fontWeight: '700', color: '#1B4332', marginTop: 12 },
  guideDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginTop: 4 },

  // Guide details
  backButton: { alignSelf: 'flex-start', marginBottom: 12 },
  backButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  tipsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#E8F5E8' },
  tipsTitle: { fontSize: 18, fontWeight: '700', color: '#1B4332', marginBottom: 12 },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  tipNumber: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 },
  tipNumberText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  tipText: { fontSize: 14, color: '#1B4332', lineHeight: 20, flex: 1 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 12, borderWidth: 1, borderColor: '#E8F5E8' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1B4332', flex: 1, paddingRight: 12 },
  modalBody: { paddingHorizontal: 16, paddingTop: 8 },
  modalContent: { fontSize: 14, color: '#1B4332', lineHeight: 20 },
  modalMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 },
  modalMetaText: { fontSize: 12, color: '#6B7280' },
});
