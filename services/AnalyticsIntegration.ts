import PostHogAnalytics from './PostHogAnalytics';
import RevenueCatService from './RevenueCatService';
import { CustomerInfo } from 'react-native-purchases';

// Unified Analytics Integration for FloraMind AI Plants
// Combines PostHog analytics with RevenueCat revenue tracking

export class AnalyticsIntegration {
  private static isInitialized = false;
  private static userId: string | null = null;

  // Initialize all analytics services
  static async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Analytics already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing analytics services...');
      
      // Initialize PostHog
      await PostHogAnalytics.initialize();
      
      // Initialize RevenueCat
      await RevenueCatService.initialize(userId);
      
      // Set user ID if provided
      if (userId) {
        this.userId = userId;
        await this.identifyUser(userId);
      }
      
      // Track initialization
      PostHogAnalytics.trackEvent('analytics_initialized', {
        services: ['posthog', 'revenuecat'],
        user_id: userId || 'anonymous'
      });
      
      this.isInitialized = true;
      console.log('✅ All analytics services initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize analytics:', error);
      PostHogAnalytics.trackError('analytics_initialization_failed', {
        error: String(error)
      });
    }
  }

  // Identify user across all services
  static async identifyUser(userId: string, properties?: Record<string, any>): Promise<void> {
    this.userId = userId;
    
    // Identify in PostHog
    await PostHogAnalytics.identify(userId, properties);
    
    // Set user ID in RevenueCat
    await RevenueCatService.setUserId(userId);
    
    // Track user identification
    PostHogAnalytics.trackEvent('user_identified', {
      user_id: userId,
      ...properties
    });
  }

  // Track app launch with user status
  static async trackAppLaunch(): Promise<void> {
    const isPremium = await RevenueCatService.isPremium();
    const customerInfo = await RevenueCatService.getCustomerInfo();
    
    PostHogAnalytics.trackEvent('app_launched', {
      is_premium: isPremium,
      has_active_subscription: customerInfo?.activeSubscriptions.length > 0,
      subscription_count: customerInfo?.activeSubscriptions.length || 0
    });
    
    // Track daily active user
    PostHogAnalytics.trackDailyActive();
  }

  // Track plant identification with premium status
  static async trackPlantIdentification(
    plantName: string,
    confidence: number,
    source: 'camera' | 'gallery'
  ): Promise<void> {
    const isPremium = await RevenueCatService.isPremium();
    
    PostHogAnalytics.trackPlantIdentification(plantName, confidence, isPremium);
    
    // Additional tracking
    PostHogAnalytics.trackEvent('feature_usage', {
      feature: 'plant_identification',
      plant_name: plantName,
      confidence_score: confidence,
      image_source: source,
      is_premium_user: isPremium
    });
    
    // Increment user property
    PostHogAnalytics.incrementUserProperty('total_plants_identified');
  }

  // Track health diagnosis
  static async trackHealthDiagnosis(
    healthStatus: string,
    severity: string,
    issues: string[]
  ): Promise<void> {
    const isPremium = await RevenueCatService.isPremium();
    
    PostHogAnalytics.trackHealthDiagnosis(healthStatus, severity, isPremium);
    
    // Additional tracking
    PostHogAnalytics.trackEvent('health_diagnosis_completed', {
      health_status: healthStatus,
      severity: severity,
      issue_count: issues.length,
      issues: issues,
      is_premium_user: isPremium
    });
    
    // Increment user property
    PostHogAnalytics.incrementUserProperty('total_diagnoses_performed');
  }

  // Track paywall events with context
  static async trackPaywallViewed(trigger: string, context?: Record<string, any>): Promise<void> {
    const customerInfo = await RevenueCatService.getCustomerInfo();
    
    PostHogAnalytics.trackPaywallViewed(trigger);
    
    PostHogAnalytics.trackEvent('paywall_impression', {
      trigger: trigger,
      has_previous_purchases: customerInfo?.allPurchasedProductIdentifiers.length > 0,
      context: context
    });
  }

  // Track purchase with comprehensive data
  static async trackPurchase(
    productId: string,
    price: number,
    customerInfo: CustomerInfo
  ): Promise<void> {
    const subscriptionType = productId.includes('yearly') ? 'yearly' : 
                           productId.includes('monthly') ? 'monthly' : 
                           productId.includes('lifetime') ? 'lifetime' : 'one-time';
    
    // Track in PostHog
    PostHogAnalytics.trackPurchase(productId, price, 'USD', subscriptionType);
    
    // Track subscription started if applicable
    if (subscriptionType !== 'one-time') {
      PostHogAnalytics.trackSubscriptionStarted(productId, price);
    }
    
    // Update user properties
    PostHogAnalytics.setUserProperties({
      is_premium: true,
      subscription_type: subscriptionType,
      last_purchase_date: new Date().toISOString(),
      total_revenue: customerInfo.nonSubscriptionTransactions.reduce((sum, t) => sum + (t.price || 0), 0),
      active_subscriptions: customerInfo.activeSubscriptions
    });
    
    // Track funnel completion
    PostHogAnalytics.trackFunnelStep('purchase_funnel', 4, 'purchase_completed');
    
    // Add to premium cohort
    PostHogAnalytics.addUserToCohort('premium_users');
  }

  // Track subscription cancellation
  static async trackSubscriptionCancelled(productId: string, reason?: string): Promise<void> {
    const price = this.getProductPrice(productId);
    
    PostHogAnalytics.trackSubscriptionCancelled(productId, reason);
    
    PostHogAnalytics.trackEvent('churn_event', {
      product_id: productId,
      cancellation_reason: reason,
      subscription_duration_days: this.getSubscriptionDuration(),
      total_revenue_generated: price
    });
    
    // Update user properties
    PostHogAnalytics.setUserProperties({
      is_premium: false,
      churned_at: new Date().toISOString(),
      churn_reason: reason
    });
    
    // Track lifecycle change
    PostHogAnalytics.trackUserLifecycle('churned');
  }

  // Track feature usage with limits
  static async trackFeatureUsage(
    featureName: string,
    requiresPremium: boolean,
    wasBlocked: boolean = false
  ): Promise<void> {
    const isPremium = await RevenueCatService.isPremium();
    
    PostHogAnalytics.trackFeatureUsed(featureName, requiresPremium, {
      was_blocked: wasBlocked,
      user_has_premium: isPremium
    });
    
    // If blocked, track as conversion opportunity
    if (wasBlocked && !isPremium) {
      PostHogAnalytics.trackEvent('premium_feature_blocked', {
        feature: featureName,
        could_convert: true
      });
    }
  }

  // Track onboarding progress
  static trackOnboardingStep(step: number, stepName: string, completed: boolean): void {
    PostHogAnalytics.trackFunnelStep('onboarding_funnel', step, stepName);
    
    PostHogAnalytics.trackEvent('onboarding_progress', {
      step: step,
      step_name: stepName,
      completed: completed
    });
    
    if (completed && step === 5) { // Assuming 5 steps
      PostHogAnalytics.trackEvent('onboarding_completed', {
        duration_seconds: this.getOnboardingDuration()
      });
      
      PostHogAnalytics.addUserToCohort('onboarded_users');
    }
  }

  // Track user engagement score
  static async calculateAndTrackEngagementScore(): Promise<number> {
    const isPremium = await RevenueCatService.isPremium();
    
    // Calculate engagement score based on various factors
    const factors = {
      is_premium: isPremium ? 20 : 0,
      daily_active: 10,
      plants_identified: 15,
      diagnoses_performed: 15,
      features_used: 20,
      session_length: 10,
      days_retained: 10
    };
    
    const score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    
    PostHogAnalytics.trackEvent('engagement_score_calculated', {
      score: score,
      factors: factors
    });
    
    PostHogAnalytics.setUserProperties({
      engagement_score: score,
      engagement_tier: score > 80 ? 'high' : score > 50 ? 'medium' : 'low'
    });
    
    return score;
  }

  // Track A/B test variants
  static trackExperiment(experimentName: string, variant: string): void {
    PostHogAnalytics.trackExperiment(experimentName, variant);
    
    // Set as user property for segmentation
    PostHogAnalytics.setUserProperties({
      [`experiment_${experimentName}`]: variant
    });
  }

  // Track app performance metrics
  static trackPerformanceMetrics(metrics: {
    screenLoadTime?: number;
    apiResponseTime?: number;
    imageProcessingTime?: number;
  }): void {
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value !== undefined) {
        PostHogAnalytics.trackPerformance(metric, value);
      }
    });
  }

  // Track user feedback
  static trackUserFeedback(rating: number, feedback?: string, feature?: string): void {
    PostHogAnalytics.trackEvent('user_feedback_submitted', {
      rating: rating,
      feedback: feedback,
      feature: feature,
      is_positive: rating >= 4
    });
    
    // Update user properties
    PostHogAnalytics.setUserProperties({
      last_feedback_rating: rating,
      last_feedback_date: new Date().toISOString()
    });
    
    // Track NPS if applicable
    if (rating) {
      const npsCategory = rating >= 9 ? 'promoter' : rating >= 7 ? 'passive' : 'detractor';
      PostHogAnalytics.trackEvent('nps_score', {
        score: rating,
        category: npsCategory
      });
    }
  }

  // Helper methods
  private static getProductPrice(productId: string): number {
    const prices: Record<string, number> = {
      'floramind_premium_monthly': 9.99,
      'floramind_premium_yearly': 59.99,
      'floramind_lifetime': 149.99,
      'plant_identifications_10': 4.99,
      'plant_identifications_50': 19.99
    };
    return prices[productId] || 0;
  }

  private static getSubscriptionDuration(): number {
    // Calculate subscription duration in days (mock)
    return Math.floor(Math.random() * 365) + 30;
  }

  private static getOnboardingDuration(): number {
    // Calculate onboarding duration in seconds (mock)
    return Math.floor(Math.random() * 300) + 60;
  }

  // Reset analytics on logout
  static async reset(): Promise<void> {
    PostHogAnalytics.reset();
    await RevenueCatService.logOut();
    this.userId = null;
    console.log('🔄 Analytics reset');
  }

  // Opt out of tracking
  static optOut(): void {
    PostHogAnalytics.optOut();
    console.log('🚫 User opted out of analytics');
  }

  // Opt in to tracking
  static optIn(): void {
    PostHogAnalytics.optIn();
    console.log('✅ User opted in to analytics');
  }
}

export default AnalyticsIntegration;
