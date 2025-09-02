import { Platform } from 'react-native';

export type PlanId = 'weekly' | 'monthly' | 'annual';

export interface PlanMeta {
  id: PlanId;
  label: string;
  price: string;
  stripePriceId: string;
  popular?: boolean;
  savings?: string;
  description?: string;
}

// Revenue-optimized plan configuration with iOS App Store compliance
const plans: Record<PlanId, PlanMeta> = {
  weekly: {
    id: 'weekly',
    label: 'Botanical Essentials',
    price: '$6.99/week',
    stripePriceId: 'price_1QBotanicalWeeklyEssentials', // Higher price point for better LTV
    description: 'Start your premium botanical journey',
  },
  monthly: {
    id: 'monthly',
    label: 'Botanical Curator',
    price: '$19.99/month',
    stripePriceId: 'price_1QBotanicalMonthlyCurator', // Premium pricing for serious users
    popular: true,
    savings: 'Save 71% vs weekly',
    description: 'Most popular among plant experts and collectors',
  },
  annual: {
    id: 'annual',
    label: 'Botanical Conservatory',
    price: '$99.99/year',
    stripePriceId: 'price_1QBotanicalAnnualConservatory', // High-value annual plan
    savings: 'Save $139.89 annually',
    description: 'Ultimate botanical mastery for serious collectors',
  },
};

// iOS App Store pricing tiers compliance - Updated for revenue optimization
const IOS_PRICING_TIERS = {
  tier_1: '$0.99',
  tier_2: '$1.99',
  tier_3: '$2.99',
  tier_4: '$3.99',
  tier_5: '$4.99',
  tier_7: '$6.99', // Weekly plan - optimized pricing
  tier_20: '$19.99', // Monthly plan - premium positioning
  tier_100: '$99.99', // Annual plan - high-value positioning
} as const;

export function getPlan(id: PlanId): PlanMeta { 
  const plan = plans[id];
  if (!plan) {
    console.error('[stripe] Invalid plan ID:', id, 'Available plans:', Object.keys(plans));
    return plans.monthly; // fallback to monthly
  }
  return plan;
}

export function getAllPlans(): PlanMeta[] {
  return Object.values(plans);
}

export function getPopularPlan(): PlanMeta {
  return getAllPlans().find(plan => plan.popular) || plans.monthly;
}

export function formatPrice(planId: PlanId): string {
  const plan = getPlan(planId);
  return plan.price;
}

// iOS App Store compliance helper
export function isIOSPricingCompliant(planId: PlanId): boolean {
  const plan = getPlan(planId);
  const iosPrices = Object.values(IOS_PRICING_TIERS);
  return iosPrices.includes(plan.price.split('/')[0] as any);
}

export async function startCheckout(plan: PlanId, email?: string): Promise<string | null> {
  try {
    console.log('[stripe] Starting checkout for plan:', plan, 'email:', email, 'platform:', Platform.OS);
    const planMeta = getPlan(plan);
    const priceId = planMeta.stripePriceId;
    
    // Enhanced URL scheme handling for iOS App Store compliance
    const getBaseUrl = () => {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? window.location.origin : 'https://plantcoach.app';
      }
      // For iOS, use universal links for better App Store compliance
      return Platform.select({
        ios: 'https://plantcoach.app', // Universal links for iOS
        android: 'https://plantcoach.app', // Deep links for Android
        default: 'https://plantcoach.app'
      });
    };
    
    const baseUrl = getBaseUrl();
    
    // Enhanced payload with iOS App Store compliance features
    const payload = {
      priceId,
      mode: 'subscription' as const,
      customerEmail: email,
      planId: plan,
      planLabel: planMeta.label,
      
      // iOS App Store compliant success/cancel URLs
      successUrl: `${baseUrl}/(tabs)/premium?success=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/(tabs)/premium?canceled=true&reason=user_canceled`,
      
      // Enhanced metadata for App Store review compliance and revenue tracking
      metadata: {
        platform: Platform.OS,
        app_version: '1.0.0',
        plan_type: plan,
        user_email: email || 'anonymous',
        checkout_timestamp: new Date().toISOString(),
        app_bundle_id: Platform.select({
          ios: 'com.plantcoach.premium',
          android: 'com.plantcoach.premium',
          default: 'com.plantcoach.premium'
        }),
        revenue_optimization: 'v2',
        pricing_strategy: 'premium_positioning',
        user_acquisition_source: 'organic',
        conversion_funnel: 'usage_limit_modal',
      },
      
      // iOS-specific Stripe configuration
      ...(Platform.OS === 'ios' && {
        payment_method_types: ['card', 'apple_pay'],
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        customer_creation: 'always',
        tax_id_collection: {
          enabled: false // Disable for simplicity in v1
        },
        automatic_tax: {
          enabled: false // Can be enabled later for international compliance
        }
      }),
      
      // Android-specific configuration
      ...(Platform.OS === 'android' && {
        payment_method_types: ['card', 'google_pay'],
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        customer_creation: 'always'
      })
    };
    
    console.log('[stripe] Enhanced checkout payload created');
    
    // Robust API endpoint resolution
    const getApiUrl = () => {
      if (Platform.OS === 'web') {
        return '/api/payments/checkout';
      }
      
      // For mobile, use the production API endpoint
      // In production, replace with your actual domain
      const productionDomain = 'https://plantcoach.app';
      return `${productionDomain}/api/payments/checkout`;
    };
    
    const apiUrl = getApiUrl();
    console.log('[stripe] Using API URL:', apiUrl);
    
    // Enhanced request with retry logic and better headers
    const makeRequest = async (attempt: number = 1): Promise<Response> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'PlantCoach-Mobile',
        'User-Agent': Platform.select({
          ios: `PlantCoach-iOS/1.0.0 (${Platform.Version})`,
          android: `PlantCoach-Android/1.0.0 (API ${Platform.Version})`,
          web: 'PlantCoach-Web/1.0.0',
          default: 'PlantCoach/1.0.0'
        }) || 'PlantCoach/1.0.0',
      };
      
      // Add iOS-specific headers for App Store compliance
      if (Platform.OS === 'ios') {
        headers['X-iOS-Bundle-Identifier'] = 'com.plantcoach.premium';
        headers['X-iOS-Version'] = Platform.Version.toString();
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        // Add timeout for mobile networks
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
      
      // Retry logic for network issues
      if (!response.ok && attempt < 3 && (response.status >= 500 || response.status === 0)) {
        console.log(`[stripe] Request failed (attempt ${attempt}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        return makeRequest(attempt + 1);
      }
      
      return response;
    };
    
    const res = await makeRequest();
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[stripe] HTTP error:', res.status, res.statusText, errorText);
      
      // Enhanced error handling with user-friendly messages
      const errorMessages: Record<number, string> = {
        400: 'Invalid payment configuration. Please try again.',
        401: 'Payment service authentication failed. Please contact support.',
        403: 'Payment service access denied. Please contact support.',
        404: 'Payment service not found. Please try again later.',
        429: 'Too many payment requests. Please wait a moment and try again.',
        500: 'Payment service temporarily unavailable. Please try again.',
        502: 'Payment gateway error. Please try again.',
        503: 'Payment service maintenance. Please try again later.',
      };
      
      const userMessage = errorMessages[res.status] || 'Payment service error. Please try again.';
      console.error('[stripe] User-facing error:', userMessage);
      
      return null;
    }
    
    const data = (await res.json()) as { 
      url?: string; 
      error?: string; 
      sessionId?: string;
      client_secret?: string;
    };
    
    if (data?.url) {
      console.log('[stripe] Checkout URL created successfully');
      
      // Enhanced URL validation for iOS App Store compliance
      if (Platform.OS === 'ios') {
        if (!data.url.startsWith('https://')) {
          console.error('[stripe] iOS requires HTTPS URLs for Stripe checkout');
          return null;
        }
        
        // Validate that the URL is a proper Stripe checkout URL
        if (!data.url.includes('checkout.stripe.com') && !data.url.includes('js.stripe.com')) {
          console.warn('[stripe] URL may not be a valid Stripe checkout URL');
        }
      }
      
      return data.url;
    }
    
    if (data?.error) {
      console.error('[stripe] Checkout creation error:', data.error);
    } else {
      console.error('[stripe] Unknown checkout error - no URL or error returned');
    }
    
    return null;
  } catch (e) {
    console.error('[stripe] Checkout failed with exception:', e);
    
    // Enhanced error logging for debugging
    if (e instanceof Error) {
      const errorDetails = {
        message: e.message,
        stack: e.stack,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
        plan,
        email: email ? 'provided' : 'not_provided'
      };
      
      console.error('[stripe] Detailed error information:', errorDetails);
      
      // Log specific error types for better debugging
      if (e.name === 'AbortError') {
        console.error('[stripe] Request timeout - network may be slow');
      } else if (e.name === 'TypeError' && e.message.includes('fetch')) {
        console.error('[stripe] Network error - check internet connection');
      } else if (e.name === 'SyntaxError') {
        console.error('[stripe] JSON parsing error - invalid response from server');
      }
    }
    
    return null;
  }
}

// Enhanced validation function for Stripe configuration
export function validateStripeConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate plan configuration
  const allPlans = getAllPlans();
  if (allPlans.length === 0) {
    errors.push('No payment plans configured');
  }
  
  // Validate price IDs format
  allPlans.forEach(plan => {
    if (!plan.stripePriceId || !plan.stripePriceId.startsWith('price_')) {
      errors.push(`Invalid Stripe price ID for plan ${plan.id}: ${plan.stripePriceId}`);
    }
  });
  
  // Platform-specific validations
  if (Platform.OS === 'ios') {
    // iOS App Store specific validations
    const bundleId = 'com.plantcoach.premium';
    if (!bundleId.includes('plantcoach')) {
      errors.push('Bundle ID should contain app identifier for App Store compliance');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to format prices for display
export function getFormattedPrice(planId: PlanId): string {
  const plan = getPlan(planId);
  return plan.price;
}

// Enhanced plan benefits for revenue optimization
export function getPlanBenefits(planId: PlanId): string[] {
  const benefits: Record<PlanId, string[]> = {
    weekly: [
      '50 daily plant identifications',
      'Advanced AI botanical analysis',
      'Disease & pest diagnosis',
      'Personalized care schedules',
      'Premium plant database access',
      'Weekly expert insights',
      'Priority customer support'
    ],
    monthly: [
      'Everything in Essentials',
      'Unlimited plant identifications',
      'Expert consultation access (5 sessions)',
      'Offline identification mode',
      'Plant collection journal & analytics',
      'VIP customer support',
      'Monthly care calendar & reminders',
      'Rare plant marketplace access',
      'Advanced plant health monitoring'
    ],
    annual: [
      'Everything in Curator',
      'Unlimited expert consultations',
      'Exclusive rare plant insights & alerts',
      'Advanced search & AI filters',
      'Plant breeding & propagation guidance',
      'Seasonal care reminders & weather alerts',
      'VIP botanical community access',
      'Annual plant health report & analytics',
      'Early access to new features',
      'Personalized plant concierge service',
      'White-glove plant care consultation',
      'Exclusive botanical events access'
    ]
  };
  
  return benefits[planId] || [];
}

// Revenue analytics helper
export function calculatePlanValue(planId: PlanId): { 
  monthlyValue: number; 
  annualValue: number; 
  savings: number; 
} {
  const values: Record<PlanId, { monthlyValue: number; annualValue: number; savings: number }> = {
    weekly: {
      monthlyValue: 6.99 * 4.33, // ~$30.27/month
      annualValue: 6.99 * 52, // $363.48/year
      savings: 0
    },
    monthly: {
      monthlyValue: 19.99,
      annualValue: 19.99 * 12, // $239.88/year
      savings: (6.99 * 4.33) - 19.99 // Save ~$10.28/month vs weekly
    },
    annual: {
      monthlyValue: 99.99 / 12, // ~$8.33/month
      annualValue: 99.99,
      savings: (19.99 * 12) - 99.99 // Save $139.89/year vs monthly
    }
  };
  
  return values[planId];
}
