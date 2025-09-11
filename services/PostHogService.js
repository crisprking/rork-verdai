import PostHog from 'posthog-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// PostHog Configuration
const POSTHOG_API_KEY = 'phc_gmC8T9ZyzrMMHJ1KoQhjEerVbznY1eymrqNviN28cIl';
const POSTHOG_HOST = 'https://app.posthog.com';

// Event Names Constants
const EVENTS = {
  // App Lifecycle
  APP_LAUNCHED: 'App Launched',
  APP_BACKGROUNDED: 'App Backgrounded',
  APP_FOREGROUNDED: 'App Foregrounded',
  
  // Onboarding
  ONBOARDING_STARTED: 'Onboarding Started',
  ONBOARDING_COMPLETED: 'Onboarding Completed',
  ONBOARDING_SKIPPED: 'Onboarding Skipped',
  
  // Plant Identification
  PLANT_SCAN_INITIATED: 'Plant Scan Initiated',
  PLANT_IDENTIFIED: 'Plant Identified',
  PLANT_IDENTIFICATION_FAILED: 'Plant Identification Failed',
  PLANT_SAVED: 'Plant Saved',
  
  // Plant Health
  HEALTH_CHECK_INITIATED: 'Health Check Initiated',
  HEALTH_DIAGNOSIS_COMPLETED: 'Health Diagnosis Completed',
  HEALTH_ISSUE_DETECTED: 'Health Issue Detected',
  
  // Plant Care
  CARE_REMINDER_SET: 'Care Reminder Set',
  CARE_TASK_COMPLETED: 'Care Task Completed',
  WATERING_LOGGED: 'Watering Logged',
  FERTILIZING_LOGGED: 'Fertilizing Logged',
  
  // Premium/Monetization
  PAYWALL_VIEWED: 'Paywall Viewed',
  SUBSCRIPTION_STARTED: 'Subscription Started',
  SUBSCRIPTION_CANCELLED: 'Subscription Cancelled',
  SUBSCRIPTION_RENEWED: 'Subscription Renewed',
  PURCHASE_COMPLETED: 'Purchase Completed',
  RESTORE_INITIATED: 'Restore Initiated',
  
  // User Engagement
  FEATURE_USED: 'Feature Used',
  SCREEN_VIEWED: 'Screen Viewed',
  BUTTON_CLICKED: 'Button Clicked',
  SEARCH_PERFORMED: 'Search Performed',
  SHARE_INITIATED: 'Share Initiated',
  
  // Errors
  ERROR_OCCURRED: 'Error Occurred',
  CRASH_REPORTED: 'Crash Reported',
  API_ERROR: 'API Error'
};

// User Properties
const USER_PROPERTIES = {
  PLANT_COUNT: '$plant_count',
  SUBSCRIPTION_STATUS: '$subscription_status',
  USER_LEVEL: '$user_level',
  APP_VERSION: '$app_version',
  LAST_ACTIVE: '$last_active',
  TOTAL_SCANS: '$total_scans',
  PREMIUM_USER: '$premium_user',
  NOTIFICATION_ENABLED: '$notification_enabled'
};

class PostHogService {
  constructor() {
    this.posthog = null;
    this.isInitialized = false;
    this.userId = null;
    this.sessionId = null;
    this.sessionStartTime = null;
  }

  /**
   * Initialize PostHog Analytics
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('PostHog already initialized');
        return true;
      }

      // Initialize PostHog client
      this.posthog = new PostHog(POSTHOG_API_KEY, {
        host: POSTHOG_HOST,
        captureApplicationLifecycleEvents: true,
        captureDeepLinks: true,
        recordScreenViews: true,
        flushInterval: 30, // Flush events every 30 seconds
        flushAt: 20, // Flush when 20 events are queued
        debug: __DEV__
      });

      // Get or create user ID
      let userId = await AsyncStorage.getItem('posthogUserId');
      if (!userId) {
        userId = this.generateUserId();
        await AsyncStorage.setItem('posthogUserId', userId);
      }
      this.userId = userId;

      // Identify user
      await this.identify(userId);

      // Start new session
      this.startSession();

      // Set super properties
      await this.setSuperProperties();

      this.isInitialized = true;
      console.log('PostHog initialized successfully');
      
      // Track app launch
      this.trackAppLaunch();
      
      return true;

    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
      return false;
    }
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `user_${timestamp}_${random}`;
  }

  /**
   * Start new session
   */
  startSession() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.sessionStartTime = Date.now();
    console.log(`Session started: ${this.sessionId}`);
  }

  /**
   * Set super properties (sent with every event)
   */
  async setSuperProperties() {
    try {
      const properties = {
        platform: Platform.OS,
        platform_version: Platform.Version,
        app_version: '1.0.0', // Get from app.json
        device_type: Platform.isPad ? 'tablet' : 'phone',
        session_id: this.sessionId
      };

      if (this.posthog) {
        this.posthog.register(properties);
      }

    } catch (error) {
      console.error('Error setting super properties:', error);
    }
  }

  /**
   * Identify user with properties
   */
  async identify(userId, properties = {}) {
    try {
      if (!this.posthog) return;

      this.userId = userId;
      
      // Get stored user properties
      const storedProps = await this.getUserProperties();
      
      const userProperties = {
        ...storedProps,
        ...properties,
        last_seen: new Date().toISOString()
      };

      this.posthog.identify(userId, userProperties);
      console.log(`User identified: ${userId}`);

    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  /**
   * Track custom event
   */
  track(eventName, properties = {}) {
    try {
      if (!this.posthog) {
        console.warn('PostHog not initialized');
        return;
      }

      const eventProperties = {
        ...properties,
        session_id: this.sessionId,
        session_duration: this.sessionStartTime ? 
          Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0,
        timestamp: new Date().toISOString()
      };

      this.posthog.capture(eventName, eventProperties);
      console.log(`Event tracked: ${eventName}`, eventProperties);

    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName, properties = {}) {
    this.track(EVENTS.SCREEN_VIEWED, {
      screen_name: screenName,
      ...properties
    });
  }

  /**
   * Track app launch
   */
  trackAppLaunch() {
    this.track(EVENTS.APP_LAUNCHED, {
      launch_time: new Date().toISOString(),
      is_first_launch: false // Check if first launch
    });
  }

  /**
   * Track plant identification
   */
  trackPlantIdentification(plantName, confidence, source = 'camera') {
    this.track(EVENTS.PLANT_IDENTIFIED, {
      plant_name: plantName,
      confidence_score: confidence,
      identification_source: source,
      success: true
    });

    // Increment total scans
    this.incrementUserProperty('total_scans');
  }

  /**
   * Track health diagnosis
   */
  trackHealthDiagnosis(plantId, issues, healthScore) {
    this.track(EVENTS.HEALTH_DIAGNOSIS_COMPLETED, {
      plant_id: plantId,
      issues_count: issues.length,
      health_score: healthScore,
      issue_types: issues.map(i => i.type)
    });

    if (issues.length > 0) {
      this.track(EVENTS.HEALTH_ISSUE_DETECTED, {
        plant_id: plantId,
        issues: issues
      });
    }
  }

  /**
   * Track paywall interaction
   */
  trackPaywallViewed(source, planShown) {
    this.track(EVENTS.PAYWALL_VIEWED, {
      source: source,
      plan_shown: planShown,
      trigger_point: source
    });
  }

  /**
   * Track purchase
   */
  trackPurchase(productId, price, currency = 'USD') {
    this.track(EVENTS.PURCHASE_COMPLETED, {
      product_id: productId,
      price: price,
      currency: currency,
      success: true
    });

    // Update user property
    this.setUserProperty(USER_PROPERTIES.PREMIUM_USER, true);
    this.setUserProperty(USER_PROPERTIES.SUBSCRIPTION_STATUS, 'active');
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, metadata = {}) {
    this.track(EVENTS.FEATURE_USED, {
      feature_name: featureName,
      ...metadata
    });
  }

  /**
   * Track error
   */
  trackError(errorType, errorMessage, metadata = {}) {
    this.track(EVENTS.ERROR_OCCURRED, {
      error_type: errorType,
      error_message: errorMessage,
      ...metadata
    });
  }

  /**
   * Set user property
   */
  setUserProperty(property, value) {
    try {
      if (!this.posthog) return;

      this.posthog.people.set({ [property]: value });
      
      // Store locally
      AsyncStorage.setItem(`posthog_prop_${property}`, JSON.stringify(value));

    } catch (error) {
      console.error(`Error setting user property ${property}:`, error);
    }
  }

  /**
   * Increment user property
   */
  incrementUserProperty(property, incrementBy = 1) {
    try {
      if (!this.posthog) return;

      this.posthog.people.increment(property, incrementBy);

    } catch (error) {
      console.error(`Error incrementing property ${property}:`, error);
    }
  }

  /**
   * Get stored user properties
   */
  async getUserProperties() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const propKeys = keys.filter(k => k.startsWith('posthog_prop_'));
      
      const properties = {};
      for (const key of propKeys) {
        const propName = key.replace('posthog_prop_', '');
        const value = await AsyncStorage.getItem(key);
        properties[propName] = JSON.parse(value);
      }
      
      return properties;

    } catch (error) {
      console.error('Error getting user properties:', error);
      return {};
    }
  }

  /**
   * Track timing (performance monitoring)
   */
  trackTiming(category, variable, time) {
    this.track('Performance Timing', {
      category: category,
      variable: variable,
      time_ms: time
    });
  }

  /**
   * Start timing
   */
  startTiming(label) {
    const startTime = Date.now();
    AsyncStorage.setItem(`timing_${label}`, startTime.toString());
    return startTime;
  }

  /**
   * End timing and track
   */
  async endTiming(label, category) {
    try {
      const startTimeStr = await AsyncStorage.getItem(`timing_${label}`);
      if (startTimeStr) {
        const startTime = parseInt(startTimeStr);
        const duration = Date.now() - startTime;
        
        this.trackTiming(category, label, duration);
        
        // Clean up
        await AsyncStorage.removeItem(`timing_${label}`);
        
        return duration;
      }
    } catch (error) {
      console.error(`Error ending timing for ${label}:`, error);
    }
    return null;
  }

  /**
   * Track A/B test exposure
   */
  trackExperiment(experimentName, variant) {
    this.track('Experiment Viewed', {
      experiment_name: experimentName,
      variant: variant
    });
  }

  /**
   * Reset user (on logout)
   */
  async reset() {
    try {
      if (this.posthog) {
        this.posthog.reset();
      }
      
      // Clear stored user ID
      await AsyncStorage.removeItem('posthogUserId');
      
      // Clear user properties
      const keys = await AsyncStorage.getAllKeys();
      const propKeys = keys.filter(k => k.startsWith('posthog_prop_'));
      await AsyncStorage.multiRemove(propKeys);
      
      this.userId = null;
      console.log('PostHog reset completed');

    } catch (error) {
      console.error('Error resetting PostHog:', error);
    }
  }

  /**
   * Flush events immediately
   */
  flush() {
    if (this.posthog) {
      this.posthog.flush();
    }
  }

  /**
   * Opt out of tracking
   */
  optOut() {
    if (this.posthog) {
      this.posthog.optOut();
    }
  }

  /**
   * Opt in to tracking
   */
  optIn() {
    if (this.posthog) {
      this.posthog.optIn();
    }
  }

  /**
   * Get distinct ID
   */
  getDistinctId() {
    return this.userId;
  }

  /**
   * Track app state change
   */
  trackAppStateChange(state) {
    if (state === 'active') {
      this.track(EVENTS.APP_FOREGROUNDED);
    } else if (state === 'background') {
      this.track(EVENTS.APP_BACKGROUNDED);
      this.flush(); // Flush events when app goes to background
    }
  }
}

// Export singleton instance
export default new PostHogService();
export { EVENTS, USER_PROPERTIES };
