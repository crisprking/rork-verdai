import Purchases, { 
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PurchasesEntitlementInfo,
  LOG_LEVEL
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat Service for FloraMind AI Plants
// Professional paywall and subscription management

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export class RevenueCatService {
  // RevenueCat API Keys - MUST be configured in RevenueCat dashboard
  private static readonly API_KEY_IOS = 'appl_YOUR_IOS_API_KEY_HERE';
  private static readonly API_KEY_ANDROID = 'goog_YOUR_ANDROID_API_KEY_HERE';
  
  // Entitlement IDs (configure in RevenueCat dashboard)
  public static readonly ENTITLEMENTS = {
    PREMIUM: 'premium',
    PRO: 'pro',
    UNLIMITED: 'unlimited'
  };

  // Product IDs (must match App Store Connect)
  public static readonly PRODUCTS = {
    MONTHLY: 'app.rork.verdai.premium.monthly',
    YEARLY: 'app.rork.verdai.premium.yearly',
    LIFETIME: 'app.rork.verdai.premium.lifetime',
    PLANT_PACK_10: 'app.rork.verdai.pack.10',
    PLANT_PACK_50: 'app.rork.verdai.pack.50'
  };

  private static isInitialized = false;
  private static currentUserId: string | null = null;

  // Initialize RevenueCat
  static async initialize(userId?: string): Promise<boolean> {
    if (this.isInitialized) {
      console.log('🎯 RevenueCat already initialized');
      return true;
    }

    try {
      console.log('🚀 Initializing RevenueCat for FloraMind AI Plants...');
      
      // Configure with appropriate API key
      const apiKey = Platform.OS === 'ios' ? this.API_KEY_IOS : this.API_KEY_ANDROID;
      
      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey,
        appUserID: userId || null, // Optional user ID for tracking
        observerMode: false, // Set to true if you're using StoreKit 2
        useAmazon: false
      });

      // Set user attributes for better analytics
      if (userId) {
        this.currentUserId = userId;
        await Purchases.setAttributes({
          'app_version': '1.0.0',
          'platform': Platform.OS,
          'user_type': 'plant_enthusiast'
        });
      }

      this.isInitialized = true;
      console.log('✅ RevenueCat initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      return false;
    }
  }

  // Get available offerings (packages/products)
  static async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null) {
        console.log('💰 Current offering:', offerings.current.identifier);
        console.log('📦 Available packages:', offerings.current.availablePackages.length);
        return offerings.current;
      }
      
      console.warn('⚠️ No current offering available');
      return null;
      
    } catch (error) {
      console.error('❌ Error fetching offerings:', error);
      return null;
    }
  }

  // Purchase a package
  static async purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      console.log('🛒 Attempting purchase:', packageToPurchase.identifier);
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('✅ Purchase successful');
      console.log('🎯 Active entitlements:', Object.keys(customerInfo.entitlements.active));
      
      return {
        success: true,
        customerInfo
      };
      
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      // Handle different error types
      if (error.userCancelled) {
        return {
          success: false,
          error: 'Purchase cancelled'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  // Purchase by product ID
  static async purchaseProduct(productId: string): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      console.log('🛒 Purchasing product:', productId);
      
      const { customerInfo } = await Purchases.purchaseStoreProduct(productId);
      
      return {
        success: true,
        customerInfo
      };
      
    } catch (error: any) {
      console.error('❌ Product purchase failed:', error);
      
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  // Restore purchases
  static async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      console.log('🔄 Restoring purchases...');
      
      const customerInfo = await Purchases.restorePurchases();
      
      console.log('✅ Purchases restored');
      console.log('🎯 Active entitlements:', Object.keys(customerInfo.entitlements.active));
      
      return {
        success: true,
        customerInfo
      };
      
    } catch (error: any) {
      console.error('❌ Restore failed:', error);
      
      return {
        success: false,
        error: error.message || 'Restore failed'
      };
    }
  }

  // Check if user has premium access
  static async isPremium(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Check for any active premium entitlement
      const hasPremium = 
        this.ENTITLEMENTS.PREMIUM in customerInfo.entitlements.active ||
        this.ENTITLEMENTS.PRO in customerInfo.entitlements.active ||
        this.ENTITLEMENTS.UNLIMITED in customerInfo.entitlements.active;
      
      console.log('👤 Premium status:', hasPremium);
      return hasPremium;
      
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
      return false;
    }
  }

  // Get customer info
  static async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('❌ Error getting customer info:', error);
      return null;
    }
  }

  // Check specific entitlement
  static async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return entitlementId in customerInfo.entitlements.active;
    } catch (error) {
      console.error('❌ Error checking entitlement:', error);
      return false;
    }
  }

  // Get active subscriptions
  static async getActiveSubscriptions(): Promise<string[]> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.activeSubscriptions;
    } catch (error) {
      console.error('❌ Error getting active subscriptions:', error);
      return [];
    }
  }

  // Cancel subscription (opens management page)
  static async manageSubscriptions(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Purchases.showManageSubscriptions();
      } else {
        // For Android, you might want to open the Play Store subscriptions page
        console.log('📱 Opening subscription management...');
      }
    } catch (error) {
      console.error('❌ Error opening subscription management:', error);
    }
  }

  // Set user ID (for tracking across devices)
  static async setUserId(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      this.currentUserId = userId;
      console.log('👤 User ID set:', userId);
    } catch (error) {
      console.error('❌ Error setting user ID:', error);
    }
  }

  // Log out (anonymous user)
  static async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      this.currentUserId = null;
      console.log('👋 User logged out');
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
  }

  // Get subscription plans for display
  static getSubscriptionPlans(): SubscriptionTier[] {
    return [
      {
        id: this.PRODUCTS.MONTHLY,
        name: 'Premium Monthly',
        price: '$9.99/month',
        features: [
          'Unlimited plant identifications',
          'Advanced health diagnosis',
          'Personalized care reminders',
          'Access to rare plant database',
          'Priority support'
        ],
        isPopular: false
      },
      {
        id: this.PRODUCTS.YEARLY,
        name: 'Premium Yearly',
        price: '$59.99/year',
        features: [
          'Everything in Monthly',
          'Save 50% compared to monthly',
          'Seasonal care guides',
          'Plant journal & tracking',
          'Early access to new features'
        ],
        isPopular: true
      },
      {
        id: this.PRODUCTS.LIFETIME,
        name: 'Lifetime Access',
        price: '$149.99',
        features: [
          'All premium features forever',
          'No recurring payments',
          'Lifetime updates',
          'VIP plant expert consultations',
          'Commercial use license'
        ],
        isPopular: false
      }
    ];
  }

  // Track revenue events
  static async trackPurchaseEvent(productId: string, price: number): Promise<void> {
    try {
      // You can integrate with analytics here
      console.log('💰 Purchase tracked:', productId, price);
    } catch (error) {
      console.error('❌ Error tracking purchase:', error);
    }
  }
}

export default RevenueCatService;
