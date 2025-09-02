import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Droplets, 
  Sun, 
  Scissors, 
  Flower, 
  Thermometer, 
  Wind,
  ChevronRight,
  Heart,
  Leaf,
  TrendingUp,
  Award,
  BookOpen,
  Globe,
  Clock,
  Star,
  Users,
  Zap
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'research': return '#8B5CF6';
    case 'trends': return '#EC4899';
    case 'expert': return '#3B82F6';
    case 'seasonal': return '#F59E0B';
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

interface ExpertInsight {
  id: string;
  title: string;
  expert: string;
  credentials: string;
  insight: string;
  category: string;
  avatar?: string;
}

export default function CareScreen() {
  const [selectedGuide, setSelectedGuide] = useState<CareGuide | null>(null);

  // Fetch premium plant insights and updates
  const { data: plantUpdates, isLoading: updatesLoading } = useQuery({
    queryKey: ['plant-updates'],
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
          title: "Revolutionary Discovery: Plants Communicate Through Underground Networks",
          content: "New research from Stanford reveals how mycorrhizal networks enable plants to share resources and information across vast distances, fundamentally changing our understanding of plant intelligence.",
          source: "Nature Botanical Journal",
          author: "Dr. Sarah Chen, PhD",
          date: formatDate(1),
          category: 'research' as const,
          readTime: "4 min read",
          featured: true,
          tags: ['Research', 'Mycorrhizae', 'Plant Intelligence']
        },
        {
          id: '2', 
          title: "The $2.3B Indoor Plant Market: What Luxury Collectors Are Buying",
          content: "Rare Monstera varieties and heritage succulents are commanding premium prices as affluent millennials invest in living art for their homes.",
          source: "Botanical Luxury Report",
          author: "Marcus Wellington",
          date: formatDate(2),
          category: 'trends' as const,
          readTime: "6 min read",
          tags: ['Market Trends', 'Luxury Plants', 'Investment']
        },
        {
          id: '3',
          title: "Climate-Adaptive Gardening: Preparing for 2024's Weather Patterns",
          content: "Leading horticulturists share strategies for maintaining thriving gardens amid increasingly unpredictable seasonal changes.",
          source: "International Horticultural Society",
          author: "Prof. Elena Rodriguez",
          date: formatDate(3),
          category: 'seasonal' as const,
          readTime: "5 min read",
          tags: ['Climate', 'Adaptation', 'Seasonal Care']
        },
        {
          id: '4',
          title: "Biophilic Design Revolution: How Plants Are Reshaping Architecture",
          content: "Top architects are integrating living walls and plant-centric designs into luxury developments, creating healthier urban environments.",
          source: "Architectural Digest Botanical",
          author: "James Morrison, FAIA",
          date: formatDate(5),
          category: 'trends' as const,
          readTime: "7 min read",
          tags: ['Architecture', 'Biophilic Design', 'Urban Planning']
        }
      ] as PlantUpdate[];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: expertInsights } = useQuery({
    queryKey: ['expert-insights'],
    queryFn: async () => {
      return [
        {
          id: '1',
          title: "The Secret to Thriving Houseplants",
          expert: "Dr. Isabella Thornfield",
          credentials: "Royal Botanic Gardens, Kew",
          insight: "Most plant failures stem from overwatering, not underwatering. The soil should feel like a wrung-out sponge—moist but not soggy.",
          category: "Watering Wisdom"
        },
        {
          id: '2',
          title: "Luxury Plant Investment Strategy",
          expert: "Charles Pemberton III",
          credentials: "Sotheby's Botanical Specialist",
          insight: "Rare variegated specimens appreciate 15-20% annually. Focus on established cultivars with proven genetics and documented provenance.",
          category: "Market Intelligence"
        },
        {
          id: '3',
          title: "Seasonal Light Management",
          expert: "Prof. Amelia Greenhouse",
          credentials: "Harvard Botanical Institute",
          insight: "Rotate plants weekly and adjust positioning seasonally. South-facing windows provide 6+ hours of direct light—perfect for most tropicals.",
          category: "Light Optimization"
        }
      ] as ExpertInsight[];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const careGuides: CareGuide[] = [
    {
      id: 'watering',
      title: 'Watering Wisely',
      icon: <Droplets color="#3B82F6" size={24} />,
      description: 'Proper watering is essential for plant health. Learn when and how to water your plants effectively.',
      tips: [
        'Check soil moisture before watering - stick your finger 1-2 inches into the soil',
        'Water deeply but infrequently to encourage deep root growth',
        'Water in the early morning to allow plants to absorb moisture before peak heat',
        'Use room temperature water to avoid shocking the roots',
        'Reduce watering frequency in cooler months',
        'Consider drip irrigation for efficient water use',
      ],
      color: '#3B82F6',
    },
    {
      id: 'lighting',
      title: 'Light Management',
      icon: <Sun color="#F59E0B" size={24} />,
      description: 'Understanding light requirements helps your plants thrive. Most plants prefer bright indirect light.',
      tips: [
        'Bright indirect light is ideal for most houseplants',
        'Direct sunlight can scorch delicate leaves - use sheer curtains to filter',
        'Rotate plants weekly to ensure even growth',
        'South-facing windows provide the most light but may need shade cloth',
        'Consider grow lights for low-light areas during shorter days',
        'Watch for signs: leggy growth means more light needed',
      ],
      color: '#F59E0B',
    },
    {
      id: 'pruning',
      title: 'Pruning Techniques',
      icon: <Scissors color="#8B5CF6" size={24} />,
      description: 'Regular pruning keeps plants healthy and encourages new growth. Remove dead or damaged parts promptly.',
      tips: [
        'Remove dead, damaged, or yellowing leaves promptly',
        'Pinch growing tips to encourage bushier growth',
        'Use clean, sharp scissors or pruning shears',
        'Prune during the growing season (spring through early fall)',
        'Cut just above a node or leaf joint',
        'Remove spent flowers to encourage more blooms',
        'Prune frost-damaged growth in early spring',
      ],
      color: '#8B5CF6',
    },
    {
      id: 'fertilizing',
      title: 'Nutrition Balance',
      icon: <Flower color="#EC4899" size={24} />,
      description: 'Proper nutrition helps plants grow strong. Fertilize during growing season with balanced nutrients.',
      tips: [
        'Fertilize during growing season (spring through early fall)',
        'Use diluted liquid fertilizer every 2-4 weeks',
        'Reduce or stop fertilizing in winter when growth slows down',
        'Look for fertilizers formulated for your plant type',
        'Organic options include compost tea and fish emulsion',
        'Never fertilize dry soil - water first',
        'Test soil pH and adjust fertilization accordingly',
      ],
      color: '#EC4899',
    },
    {
      id: 'temperature',
      title: 'Temperature Control',
      icon: <Thermometer color="#EF4444" size={24} />,
      description: 'Maintaining proper temperature ranges keeps plants comfortable. Most prefer 65-75°F (18-24°C).',
      tips: [
        'Most houseplants prefer temperatures between 65-75°F (18-24°C)',
        'Avoid placing plants near heating/cooling vents',
        'Protect from cold drafts and sudden temperature changes',
        'Bring plants indoors during freezes (32°F or below)',
        'Some plants need cooler temperatures in winter to bloom',
        'Use a thermometer to monitor temperature fluctuations',
        'Group plants together to create stable microclimates',
        'Consider frost cloth for outdoor plants during cold snaps',
      ],
      color: '#EF4444',
    },
    {
      id: 'humidity',
      title: 'Humidity Levels',
      icon: <Wind color="#06B6D4" size={24} />,
      description: 'Many plants benefit from increased humidity. Most prefer 40-60% humidity levels.',
      tips: [
        'Most houseplants prefer 40-60% humidity',
        'Use a humidifier or pebble trays to increase humidity',
        'Group plants together to create humid microclimates',
        'Mist plants with soft water (avoid fuzzy-leaved plants)',
        'Place plants in naturally humid areas like bathrooms',
        'Monitor with a hygrometer for accurate readings',
        'Consider humidity trays during dry winter months',
      ],
      color: '#06B6D4',
    },
  ];

  const handleGuideSelect = useCallback((guide: CareGuide) => {
    setSelectedGuide(guide);
  }, []);

  if (selectedGuide) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[selectedGuide.color, selectedGuide.color + 'CC']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedGuide(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              {selectedGuide.icon}
            </View>
            <Text style={styles.headerTitle}>{selectedGuide.title}</Text>
            <Text style={styles.headerSubtitle}>{selectedGuide.description}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Expert Tips</Text>
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#081C15', '#1B4332', '#2D5A27']} // Deep luxury forest gradient
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerBadge}>
            <Award color="#D4AF37" size={16} />
            <Text style={styles.headerBadgeText}>PREMIUM INSIGHTS</Text>
          </View>
          <Text style={styles.headerTitle}>Botanical Intelligence</Text>
          <Text style={styles.headerSubtitle}>Curated insights from leading horticultural experts</Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.3M+</Text>
              <Text style={styles.statLabel}>Plant Enthusiasts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Expert Contributors</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Featured Story */}
        {plantUpdates && plantUpdates.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <TrendingUp color="#1B4332" size={20} />
                <Text style={styles.sectionTitle}>Featured Story</Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight color="#52796F" size={16} />
              </TouchableOpacity>
            </View>
            
            {plantUpdates.filter(update => update.featured).map((update) => (
              <TouchableOpacity key={update.id} style={styles.featuredCard}>
                <LinearGradient
                  colors={['#1B4332', '#2D5A27']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredBadge}>
                    <Star color="#D4AF37" size={12} fill="#D4AF37" />
                    <Text style={styles.featuredBadgeText}>FEATURED</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{update.title}</Text>
                  <Text style={styles.featuredContent}>{update.content}</Text>
                  <View style={styles.featuredMeta}>
                    <View style={styles.featuredAuthor}>
                      <Text style={styles.featuredAuthorName}>{update.author}</Text>
                      <Text style={styles.featuredSource}>{update.source}</Text>
                    </View>
                    <View style={styles.featuredStats}>
                      <Clock color="rgba(255,255,255,0.7)" size={12} />
                      <Text style={styles.featuredReadTime}>{update.readTime}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Expert Insights */}
        {expertInsights && expertInsights.length > 0 && (
          <View style={styles.insightsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Users color="#1B4332" size={20} />
                <Text style={styles.sectionTitle}>Expert Insights</Text>
              </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
              {expertInsights.map((insight) => (
                <TouchableOpacity key={insight.id} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <View style={styles.expertAvatar}>
                      <Text style={styles.expertInitial}>{insight.expert.charAt(0)}</Text>
                    </View>
                    <View style={styles.expertInfo}>
                      <Text style={styles.expertName}>{insight.expert}</Text>
                      <Text style={styles.expertCredentials}>{insight.credentials}</Text>
                    </View>
                  </View>
                  <Text style={styles.insightCategory}>{insight.category}</Text>
                  <Text style={styles.insightText}>"{insight.insight}"</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Latest Intelligence */}
        {plantUpdates && plantUpdates.length > 0 && (
          <View style={styles.updatesSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Globe color="#1B4332" size={20} />
                <Text style={styles.sectionTitle}>Latest Intelligence</Text>
              </View>
            </View>
            
            {plantUpdates.filter(update => !update.featured).map((update) => (
              <TouchableOpacity key={update.id} style={styles.updateCard}>
                <View style={styles.updateHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(update.category) }]}>
                    <Text style={styles.categoryText}>{update.category.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.updateDate}>{update.date}</Text>
                </View>
                <Text style={styles.updateTitle}>{update.title}</Text>
                <Text style={styles.updateContent}>{update.content}</Text>
                <View style={styles.updateFooter}>
                  <View style={styles.updateMeta}>
                    <Text style={styles.updateAuthor}>{update.author}</Text>
                    <Text style={styles.updateSource}>{update.source}</Text>
                  </View>
                  <View style={styles.updateStats}>
                    <Clock color="#9CA3AF" size={12} />
                    <Text style={styles.updateReadTime}>{update.readTime}</Text>
                  </View>
                </View>
                {update.tags && (
                  <View style={styles.tagContainer}>
                    {update.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Premium Care Guides */}
        <View style={styles.guidesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <BookOpen color="#1B4332" size={20} />
              <Text style={styles.sectionTitle}>Masterclass Guides</Text>
            </View>
          </View>
          
          <View style={styles.guidesGrid}>
            {careGuides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                style={styles.guideCard}
                onPress={() => handleGuideSelect(guide)}
              >
                <View style={styles.guideHeader}>
                  <View style={[styles.guideIcon, { backgroundColor: guide.color + '15' }]}>
                    {guide.icon}
                  </View>
                  <View style={styles.guideBadge}>
                    <Zap color="#D4AF37" size={12} />
                  </View>
                </View>
                <Text style={styles.guideTitle}>{guide.title}</Text>
                <Text style={styles.guideDescription}>{guide.description}</Text>
                <View style={styles.guideFooter}>
                  <Text style={styles.guideLevel}>Expert Level</Text>
                  <ChevronRight color="#52796F" size={16} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Rituals */}
        <View style={styles.ritualsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Heart color="#1B4332" size={20} />
              <Text style={styles.sectionTitle}>Daily Rituals</Text>
            </View>
          </View>
          
          <View style={styles.ritualCard}>
            <LinearGradient
              colors={['#F1F8E9', '#FFFFFF']}
              style={styles.ritualGradient}
            >
              <View style={styles.ritualHeader}>
                <View style={styles.ritualIcon}>
                  <Leaf color="#1B4332" size={24} />
                </View>
                <Text style={styles.ritualTitle}>The Morning Botanical Ritual</Text>
              </View>
              
              <View style={styles.ritualSteps}>
                <View style={styles.ritualStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Observe each plant's posture and leaf condition</Text>
                </View>
                
                <View style={styles.ritualStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Test soil moisture with the finger method</Text>
                </View>
                
                <View style={styles.ritualStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Rotate plants for optimal light exposure</Text>
                </View>
                
                <View style={styles.ritualStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>Remove any yellowing or damaged foliage</Text>
                </View>
              </View>
              
              <View style={styles.ritualFooter}>
                <Text style={styles.ritualTime}>⏱ 5-10 minutes daily</Text>
                <Text style={styles.ritualBenefit}>Prevents 90% of common plant issues</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9', // Premium luxury light botanical background
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  updatesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B4332',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4332',
    marginBottom: 8,
  },
  updateContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  updateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateSource: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  updateDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  guidesGrid: {
    gap: 16,
    marginBottom: 32,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4332',
    marginBottom: 8,
  },
  guideDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4332',
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tipText: {
    fontSize: 14,
    color: '#1B4332',
    lineHeight: 20,
    flex: 1,
  },
  quickTipsSection: {
    marginTop: 16,
  },
  quickTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickTipContent: {
    marginLeft: 12,
    flex: 1,
  },
  quickTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4332',
    marginBottom: 4,
  },
  quickTipText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  
  // New luxury styles
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  
  // Section styles
  featuredSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#52796F',
    fontWeight: '500',
    marginRight: 4,
  },
  
  // Featured card styles
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  featuredGradient: {
    padding: 20,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  featuredContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredAuthor: {
    flex: 1,
  },
  featuredAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featuredSource: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredReadTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  
  // Expert insights styles
  insightsSection: {
    marginBottom: 32,
  },
  insightsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expertAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B4332',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expertInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4332',
    marginBottom: 2,
  },
  expertCredentials: {
    fontSize: 11,
    color: '#6B7280',
  },
  insightCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52796F',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: 13,
    color: '#1B4332',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  
  // Update card enhancements
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  updateAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B4332',
    marginBottom: 2,
  },
  updateStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateReadTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  tagText: {
    fontSize: 10,
    color: '#52796F',
    fontWeight: '500',
  },
  
  // Guide enhancements
  guidesSection: {
    marginBottom: 32,
  },
  guideBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F8E9',
  },
  guideLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52796F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Ritual styles
  ritualsSection: {
    marginBottom: 32,
  },
  ritualCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ritualGradient: {
    padding: 20,
  },
  ritualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ritualIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(27, 67, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ritualTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4332',
    flex: 1,
  },
  ritualSteps: {
    marginBottom: 20,
  },
  ritualStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1B4332',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#1B4332',
    lineHeight: 20,
    flex: 1,
  },
  ritualFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 67, 50, 0.1)',
  },
  ritualTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52796F',
  },
  ritualBenefit: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});