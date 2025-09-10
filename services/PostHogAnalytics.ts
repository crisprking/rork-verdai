import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PostHog Analytics Service for FloraMind AI Plants
// Comprehensive analytics tracking for user behavior and revenue

export class PostHogAnalytics {
  // Your PostHog API Key
  private static readonly API_KEY = 'phc_gmC8T9ZyzrMMHJ1KoQhjEerVbznY1eymrqNviN28cIl';
  private static readonly API_HOST = 'https://app.posthog.com'; // or 'https://eu.posthog.com' for EU
  
  private static instance: PostHog | null = null;
  private static isInitialized = false;
  private static userId: string | null = null;

  // Initialize PostHog
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('📊 PostHog already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing PostHog Analytics...');
      
      // Create PostHog client
      const posthogAsync = PostHog.initAsync(this.API_KEY, {
        host: this.API_HOST,
        captureApplicationLifecycleEvents: true, // Track app lifecycle
        captureDeepLinks: true, // Track deep links
        captureInAppPurchases: true, // Track IAP events
        flushInterval: 30, // Batch events every 30 seconds
        flushAt: 20, // Send events when 20 are queued
        debug: __DEV__, // Enable debug in development
        // Use AsyncStorage for persistence
        persistence: 'asyncstorage',
        androidAsyncStorage: AsyncStorage,
        iOSAsyncStorage: AsyncStorage,
      });

      this.instance = await posthogAsync;
      this.isInitialized = true;
      
      // Track app launch
      this.trackEvent('app_launched', {
        platform: Platform.OS,
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });

      console.log('✅ PostHog Analytics initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize PostHog:', error);
    }
  }

  // Identify user
  static async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    if (!this.instance) {
      console.warn('⚠️ PostHog not initialized');
      return;
    }

    try {
      this.userId = userId;
      
      // Set user properties
      const userProperties = {
        platform: Platform.OS,
        app_version: '1.0.0',
        created_at: new Date().toISOString(),
        ...properties
      };

      this.instance.identify(userId, userProperties);
      console.log('👤 User identified:', userId);
    } catch (error) {
      console.error('❌ Failed to identify user:', error);
    }
  }

  // Track custom event
  static trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.instance) {
      console.warn('⚠️ PostHog not initialized');
      return;
    }

    try {
      this.instance.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId()
      });
      
      if (__DEV__) {
        console.log(`📊 Event tracked: ${eventName}`, properties);
      }
    } catch (error) {
      console.error('❌ Failed to track event:', error);
    }
  }

  // Track screen view
  static trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.trackEvent('screen_viewed', {
      screen_name: screenName,
      ...properties
    });
  }

  // Track plant identification
  static trackPlantIdentification(plantName: string, confidence: number, isPremium: boolean): void {
    this.trackEvent('plant_identified', {
      plant_name: plantName,
      confidence_score: confidence,
      is_premium_user: isPremium,
      identification_method: 'ai_enhanced',
      feature: 'plant_identification'
    });
  }

  // Track health diagnosis
  static trackHealthDiagnosis(healthStatus: string, severity: string, isPremium: boolean): void {
    this.trackEvent('plant_health_diagnosed', {
      health_status: healthStatus,
      severity_level: severity,
      is_premium_user: isPremium,
      feature: 'health_diagnosis'
    });
  }

  // Track revenue events
  static trackPurchase(
    productId: string, 
    price: number, 
    currency: string = 'USD',
    subscriptionType?: 'monthly' | 'yearly' | 'lifetime'
  ): void {
    this.trackEvent('purchase_completed', {
      product_id: productId,
      price: price,
      currency: currency,
      subscription_type: subscriptionType,
      revenue: price, // PostHog recognizes 'revenue' property
      feature: 'premium_subscription'
    });

    // Also track as revenue event for PostHog's revenue analytics
    this.trackEvent('revenue', {
      amount: price,
      currency: currency,
      product: productId
    });
  }

  // Track subscription events
  static trackSubscriptionStarted(plan: string, price: number): void {
    this.trackEvent('subscription_started', {
      plan_name: plan,
      price: price,
      billing_period: plan.includes('yearly') ? 'yearly' : 'monthly'
    });
  }

  static trackSubscriptionCancelled(plan: string, reason?: string): void {
    this.trackEvent('subscription_cancelled', {
      plan_name: plan,
      cancellation_reason: reason,
      user_lifetime_value: this.getUserLifetimeValue()
    });
  }

  static trackSubscriptionRenewed(plan: string, price: number): void {
    this.trackEvent('subscription_renewed', {
      plan_name: plan,
      price: price,
      renewal_count: this.getRenewalCount()
    });
  }

  // Track paywall events
  static trackPaywallViewed(trigger: string): void {
    this.trackEvent('paywall_viewed', {
      trigger_point: trigger,
      session_time: this.getSessionDuration()
    });
  }

  static trackPaywallDismissed(trigger: string): void {
    this.trackEvent('paywall_dismissed', {
      trigger_point: trigger,
      time_on_paywall: this.getTimeOnPaywall()
    });
  }

  // Track feature usage
  static trackFeatureUsed(featureName: string, isPremium: boolean, details?: Record<string, any>): void {
    this.trackEvent('feature_used', {
      feature_name: featureName,
      is_premium_feature: isPremium,
      requires_premium: isPremium,
      ...details
    });
  }

  // Track user engagement
  static trackEngagement(action: string, details?: Record<string, any>): void {
    this.trackEvent('user_engagement', {
      action: action,
      engagement_type: this.getEngagementType(action),
      ...details
    });
  }

  // Track errors
  static trackError(error: string, context?: Record<string, any>): void {
    this.trackEvent('error_occurred', {
      error_message: error,
      error_context: context,
      platform: Platform.OS,
      app_version: '1.0.0'
    });
  }

  // Track app performance
  static trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.trackEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
      platform: Platform.OS
    });
  }

  // Set user properties
  static setUserProperties(properties: Record<string, any>): void {
    if (!this.instance) {
      console.warn('⚠️ PostHog not initialized');
      return;
    }

    try {
      Object.entries(properties).forEach(([key, value]) => {
        this.instance!.people.set(key, value);
      });
    } catch (error) {
      console.error('❌ Failed to set user properties:', error);
    }
  }

  // Increment user property
  static incrementUserProperty(property: string, value: number = 1): void {
    if (!this.instance) return;
    
    try {
      this.instance.people.increment(property, value);
    } catch (error) {
      console.error('❌ Failed to increment property:', error);
    }
  }

  // Track A/B test exposure
  static trackExperiment(experimentName: string, variant: string): void {
    this.trackEvent('experiment_viewed', {
      experiment_name: experimentName,
      variant: variant,
      timestamp: new Date().toISOString()
    });
  }

  // Track funnel events
  static trackFunnelStep(funnelName: string, step: number, stepName: string): void {
    this.trackEvent('funnel_step_completed', {
      funnel_name: funnelName,
      step_number: step,
      step_name: stepName
    });
  }

  // Track retention events
  static trackDailyActive(): void {
    this.trackEvent('daily_active_user', {
      date: new Date().toISOString().split('T')[0]
    });
  }

  static trackWeeklyActive(): void {
    this.trackEvent('weekly_active_user', {
      week: this.getCurrentWeek()
    });
  }

  static trackMonthlyActive(): void {
    this.trackEvent('monthly_active_user', {
      month: new Date().toISOString().slice(0, 7)
    });
  }

  // Opt out of tracking
  static optOut(): void {
    if (!this.instance) return;
    
    try {
      this.instance.optOut();
      console.log('🚫 User opted out of tracking');
    } catch (error) {
      console.error('❌ Failed to opt out:', error);
    }
  }

  // Opt in to tracking
  static optIn(): void {
    if (!this.instance) return;
    
    try {
      this.instance.optIn();
      console.log('✅ User opted in to tracking');
    } catch (error) {
      console.error('❌ Failed to opt in:', error);
    }
  }

  // Reset user (on logout)
  static reset(): void {
    if (!this.instance) return;
    
    try {
      this.instance.reset();
      this.userId = null;
      console.log('🔄 User reset');
    } catch (error) {
      console.error('❌ Failed to reset user:', error);
    }
  }

  // Flush events immediately
  static flush(): void {
    if (!this.instance) return;
    
    try {
      this.instance.flush();
      console.log('📤 Events flushed');
    } catch (error) {
      console.error('❌ Failed to flush events:', error);
    }
  }

  // Helper methods
  private static getSessionId(): string {
    // Generate or retrieve session ID
    return `session_${Date.now()}`;
  }

  private static getSessionDuration(): number {
    // Calculate session duration in seconds
    return Math.floor(Math.random() * 300) + 60; // Mock data
  }

  private static getTimeOnPaywall(): number {
    // Calculate time spent on paywall in seconds
    return Math.floor(Math.random() * 60) + 10; // Mock data
  }

  private static getUserLifetimeValue(): number {
    // Calculate user's lifetime value
    return Math.floor(Math.random() * 100) + 20; // Mock data
  }

  private static getRenewalCount(): number {
    // Get number of subscription renewals
    return Math.floor(Math.random() * 12) + 1; // Mock data
  }

  private static getCurrentWeek(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
    return `${year}-W${week}`;
  }

  private static getEngagementType(action: string): string {
    const engagementTypes: Record<string, string> = {
      'share': 'social',
      'save': 'retention',
      'search': 'discovery',
      'filter': 'exploration',
      'tap': 'interaction',
      'scroll': 'browsing'
    };
    
    return engagementTypes[action] || 'general';
  }

  // Track custom user cohorts
  static addUserToCohort(cohortName: string): void {
    this.setUserProperties({
      [`cohort_${cohortName}`]: true,
      [`cohort_${cohortName}_joined_at`]: new Date().toISOString()
    });
  }

  // Track user lifecycle
  static trackUserLifecycle(stage: 'new' | 'active' | 'retained' | 'churned' | 'resurrected'): void {
    this.trackEvent('user_lifecycle_stage', {
      stage: stage,
      timestamp: new Date().toISOString()
    });
    
    this.setUserProperties({
      lifecycle_stage: stage,
      lifecycle_updated_at: new Date().toISOString()
    });
  }
}

export default PostHogAnalytics;
