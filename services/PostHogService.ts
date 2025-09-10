import PostHog from 'posthog-react-native';

class PostHogService {
  private static instance: PostHogService;
  private isInitialized = false;

  static getInstance(): PostHogService {
    if (!PostHogService.instance) {
      PostHogService.instance = new PostHogService();
    }
    return PostHogService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await PostHog.setup('phc_gmC8T9ZyzrMMHJ1KoQhjEerVbznY1eymrqNviN28cIl', {
        host: 'https://us.i.posthog.com',
        enableSessionReplay: true,
        sessionReplayConfig: {
          maskAllInputs: false,
          maskAllText: false,
          captureLog: true,
        },
      });

      this.isInitialized = true;
      console.log('✅ PostHog initialized successfully');
    } catch (error) {
      console.error('❌ PostHog initialization failed:', error);
    }
  }

  // Track user identification
  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return;
    
    PostHog.identify(userId, {
      ...properties,
      app_version: '1.0.0',
      platform: 'mobile',
    });
  }

  // Track events
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return;
    
    PostHog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  // Track screen views
  screen(screenName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return;
    
    PostHog.screen(screenName, properties);
  }

  // Track plant identification events
  trackPlantIdentification(success: boolean, plantName?: string, confidence?: number): void {
    this.track('plant_identified', {
      success,
      plant_name: plantName,
      confidence_score: confidence,
      feature: 'plant_identification',
    });
  }

  // Track health diagnosis events
  trackHealthDiagnosis(success: boolean, diagnosis?: string, severity?: string): void {
    this.track('health_diagnosed', {
      success,
      diagnosis,
      severity,
      feature: 'health_diagnosis',
    });
  }

  // Track premium upgrade events
  trackPremiumUpgrade(action: 'viewed' | 'started' | 'completed' | 'cancelled'): void {
    this.track('premium_upgrade', {
      action,
      feature: 'monetization',
    });
  }

  // Track app engagement
  trackAppLaunch(): void {
    this.track('app_launched', {
      session_start: true,
    });
  }

  trackFeatureUsage(feature: string, action: string): void {
    this.track('feature_used', {
      feature,
      action,
    });
  }
}

export default PostHogService;
