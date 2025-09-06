// FloraMind In-App Purchase Configuration
// Unique product IDs that won't conflict with other apps

export const IAP_PRODUCTS = {
  // Monthly Premium Subscription
  PREMIUM_MONTHLY: {
    id: 'com.floramind.premium.monthly',
    name: 'FloraMind Premium Monthly',
    description: 'Unlimited AI features, advanced analytics, and premium plant intelligence',
    price: 9.99,
    currency: 'USD',
    type: 'subscription',
    interval: 'month',
    groupId: 'floramind_premium_group',
  },
  
  // Annual Premium Subscription (Best Value)
  PREMIUM_ANNUAL: {
    id: 'com.floramind.premium.annual',
    name: 'FloraMind Premium Annual',
    description: 'Unlimited AI features, advanced analytics, and premium plant intelligence (Save 40%)',
    price: 59.99,
    currency: 'USD',
    type: 'subscription',
    interval: 'year',
    groupId: 'floramind_premium_group',
  },
  
  // AI Identification Pack (One-time purchase)
  AI_IDENTIFICATION_PACK: {
    id: 'com.floramind.ai.identification.pack',
    name: 'AI Identification Pack',
    description: '50 additional AI plant identifications (one-time purchase)',
    price: 4.99,
    currency: 'USD',
    type: 'consumable',
  },
  
  // Advanced Analytics Pack
  ADVANCED_ANALYTICS: {
    id: 'com.floramind.advanced.analytics',
    name: 'Advanced Analytics Pack',
    description: 'Unlock detailed growth analytics and environmental insights',
    price: 2.99,
    currency: 'USD',
    type: 'consumable',
  },
  
  // Carbon Tracking Pro
  CARBON_TRACKING_PRO: {
    id: 'com.floramind.carbon.tracking.pro',
    name: 'Carbon Tracking Pro',
    description: 'Advanced carbon footprint tracking and environmental impact analysis',
    price: 1.99,
    currency: 'USD',
    type: 'consumable',
  },
  
  // Community Insights Pack
  COMMUNITY_INSIGHTS: {
    id: 'com.floramind.community.insights',
    name: 'Community Insights Pack',
    description: 'Access to global plant care community data and AI insights',
    price: 3.99,
    currency: 'USD',
    type: 'consumable',
  },
} as const;

export const SUBSCRIPTION_PRODUCTS = [
  IAP_PRODUCTS.PREMIUM_MONTHLY.id,
  IAP_PRODUCTS.PREMIUM_ANNUAL.id,
];

export const CONSUMABLE_PRODUCTS = [
  IAP_PRODUCTS.AI_IDENTIFICATION_PACK.id,
  IAP_PRODUCTS.ADVANCED_ANALYTICS.id,
  IAP_PRODUCTS.CARBON_TRACKING_PRO.id,
  IAP_PRODUCTS.COMMUNITY_INSIGHTS.id,
];

export const PREMIUM_FEATURES = [
  'unlimited_ai_identifications',
  'advanced_growth_analytics',
  'pest_detection_ai',
  'environmental_optimization',
  'community_insights',
  'carbon_footprint_tracking',
  'weather_integration',
  'export_data',
  'priority_support',
] as const;

export const FREE_TIER_LIMITS = {
  daily_identifications: 5,
  daily_health_checks: 3,
  daily_carbon_tracking: 10,
  plant_collection_size: 10,
  ai_chat_messages: 20,
  growth_predictions: 0,
  advanced_analytics: false,
  community_insights: false,
} as const;
