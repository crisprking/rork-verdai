// FloraMind AI Features - Unique capabilities that differentiate from other plant apps

export const AI_FEATURES = {
  // Core AI Capabilities
  PLANT_IDENTIFICATION: {
    id: 'plant_id',
    name: 'AI Plant Identification',
    description: 'Advanced machine learning to identify plant species from photos',
    icon: '🔍',
    premium: false,
    dailyLimit: 5,
  },
  HEALTH_DIAGNOSIS: {
    id: 'health_diagnosis',
    name: 'AI Health Diagnosis',
    description: 'Computer vision analysis of plant health issues and diseases',
    icon: '🏥',
    premium: false,
    dailyLimit: 3,
  },
  GROWTH_PREDICTION: {
    id: 'growth_prediction',
    name: 'Growth Pattern Prediction',
    description: 'AI-powered predictions of plant growth and development',
    icon: '📈',
    premium: true,
    dailyLimit: 10,
  },
  CARE_OPTIMIZATION: {
    id: 'care_optimization',
    name: 'Smart Care Optimization',
    description: 'AI-optimized watering, fertilizing, and care schedules',
    icon: '⚡',
    premium: true,
    dailyLimit: 20,
  },
  PEST_DETECTION: {
    id: 'pest_detection',
    name: 'Pest & Disease Detection',
    description: 'Early detection of pests and diseases using AI vision',
    icon: '🐛',
    premium: true,
    dailyLimit: 5,
  },
  ENVIRONMENTAL_ANALYSIS: {
    id: 'environmental_analysis',
    name: 'Environmental Analysis',
    description: 'AI analysis of light, humidity, and temperature conditions',
    icon: '🌡️',
    premium: true,
    dailyLimit: 15,
  },
  CARBON_FOOTPRINT: {
    id: 'carbon_footprint',
    name: 'Carbon Footprint Tracking',
    description: 'Track your plants\' environmental impact and carbon absorption',
    icon: '🌱',
    premium: false,
    dailyLimit: 10,
  },
  COMMUNITY_INSIGHTS: {
    id: 'community_insights',
    name: 'Community AI Insights',
    description: 'AI-powered insights from global plant care community data',
    icon: '🌍',
    premium: true,
    dailyLimit: 25,
  },
} as const;

export const PREMIUM_FEATURES = [
  'growth_prediction',
  'care_optimization',
  'pest_detection',
  'environmental_analysis',
  'community_insights',
];

export const FREE_FEATURES = [
  'plant_id',
  'health_diagnosis',
  'carbon_footprint',
];

export const AI_INSIGHTS_TYPES = [
  'species_identification',
  'health_assessment',
  'growth_forecast',
  'care_recommendation',
  'environmental_optimization',
  'pest_warning',
  'carbon_impact',
  'community_trend',
] as const;

export const UNIQUE_SELLING_POINTS = [
  'Advanced AI plant intelligence using machine learning',
  'Carbon footprint tracking for environmental consciousness',
  'Community-driven AI insights from global plant data',
  'Predictive growth modeling and care optimization',
  'Real-time environmental analysis and recommendations',
  'Early pest and disease detection using computer vision',
  'Personalized care schedules based on AI analysis',
  'Integration with weather data for optimal plant care',
] as const;
