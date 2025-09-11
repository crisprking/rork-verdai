import Purchases from 'react-native-purchases';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat Configuration
const REVENUECAT_API_KEY_IOS = 'appl_kNzYwXvEUfbKmPQKvqLzGmHxVnA'; // Replace with your actual iOS key
const REVENUECAT_API_KEY_ANDROID = 'goog_YourAndroidKeyHere'; // Replace with your actual Android key

// Product IDs - Must match App Store Connect
const PRODUCT_IDS = {
  monthly: 'app.rork.verdai.premium.monthly',
  yearly: 'app.rork.verdai.premium.yearly',
  lifetime: 'app.rork.verdai.premium.lifetime'
};

// Entitlement IDs
const ENTITLEMENTS = {
  premium: 'premium',
  pro: 'pro'
};

class RevenueCatService {
  constructor() {
    this.isInitialized = false;
    this.currentOfferings = null;
    this.purchaserInfo = null;
  }

  /**
   * Initialize RevenueCat SDK
   * Must be called on app launch
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('RevenueCat already initialized');
        return true;
      }

      // Configure based on platform
      const apiKey = Platform.OS === 'ios' 
        ? REVENUECAT_API_KEY_IOS 
        : REVENUECAT_API_KEY_ANDROID;

      if (!apiKey || apiKey.includes('Your')) {
        console.warn('RevenueCat API key not configured');
        return false;
      }

      // Initialize Purchases SDK
      await Purchases.configure({ apiKey });
      
      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      // Set app user ID if available
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        await Purchases.logIn(userId);
      }

      // Get initial purchaser info
      await this.updatePurchaserInfo();
      
      // Fetch offerings
      await this.fetchOfferings();

      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      return false;
    }
  }

  /**
   * Fetch available offerings from RevenueCat
   */
  async fetchOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null) {
        this.currentOfferings = offerings.current;
        console.log('Offerings fetched:', offerings.current.identifier);
        return offerings.current;
      }
      
      console.warn('No offerings available');
      return null;

    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  /**
   * Get current offerings
   */
  getOfferings() {
    return this.currentOfferings;
  }

  /**
   * Update purchaser info
   */
  async updatePurchaserInfo() {
    try {
      const purchaserInfo = await Purchases.getCustomerInfo();
      this.purchaserInfo = purchaserInfo;
      
      // Cache premium status
      const isPremium = this.checkPremiumStatus(purchaserInfo);
      await AsyncStorage.setItem('isPremium', isPremium.toString());
      
      return purchaserInfo;

    } catch (error) {
      console.error('Error updating purchaser info:', error);
      return null;
    }
  }

  /**
   * Check if user has premium access
   */
  checkPremiumStatus(purchaserInfo = null) {
    const info = purchaserInfo || this.purchaserInfo;
    
    if (!info) {
      return false;
    }

    // Check for premium entitlement
    const premiumEntitlement = info.entitlements.active[ENTITLEMENTS.premium];
    const proEntitlement = info.entitlements.active[ENTITLEMENTS.pro];
    
    return !!(premiumEntitlement || proEntitlement);
  }

  /**
   * Check if user has active subscription
   */
  async isPremiumUser() {
    try {
      // First check cached value for quick response
      const cachedStatus = await AsyncStorage.getItem('isPremium');
      if (cachedStatus !== null) {
        // Update in background
        this.updatePurchaserInfo();
        return cachedStatus === 'true';
      }

      // Fetch fresh data
      const purchaserInfo = await this.updatePurchaserInfo();
      return this.checkPremiumStatus(purchaserInfo);

    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId) {
    try {
      console.log(`Attempting to purchase: ${productId}`);
      
      // Find the package
      if (!this.currentOfferings) {
        await this.fetchOfferings();
      }

      let packageToPurchase = null;

      // Find package by product ID
      if (this.currentOfferings && this.currentOfferings.availablePackages) {
        packageToPurchase = this.currentOfferings.availablePackages.find(
          pkg => pkg.product.identifier === productId
        );
      }

      if (!packageToPurchase) {
        throw new Error(`Product ${productId} not found`);
      }

      // Make purchase
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log(`Purchase successful: ${productIdentifier}`);
      
      // Update purchaser info
      this.purchaserInfo = customerInfo;
      
      // Update cached premium status
      const isPremium = this.checkPremiumStatus(customerInfo);
      await AsyncStorage.setItem('isPremium', isPremium.toString());

      // Track purchase event
      await this.trackPurchase(productIdentifier, packageToPurchase.product.price);

      return {
        success: true,
        customerInfo,
        productIdentifier
      };

    } catch (error) {
      console.error('Purchase failed:', error);
      
      // Handle specific error cases
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return {
          success: false,
          cancelled: true,
          error: 'Purchase cancelled'
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases() {
    try {
      console.log('Restoring purchases...');
      
      const restoredInfo = await Purchases.restorePurchases();
      
      this.purchaserInfo = restoredInfo;
      
      // Check if any purchases were restored
      const isPremium = this.checkPremiumStatus(restoredInfo);
      await AsyncStorage.setItem('isPremium', isPremium.toString());

      if (isPremium) {
        console.log('Purchases restored successfully');
        Alert.alert(
          'Restored Successfully',
          'Your premium access has been restored!',
          [{ text: 'OK' }]
        );
        return { success: true, isPremium: true };
      } else {
        console.log('No purchases to restore');
        Alert.alert(
          'Nothing to Restore',
          'No previous purchases found for this account.',
          [{ text: 'OK' }]
        );
        return { success: true, isPremium: false };
      }

    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again later.',
        [{ text: 'OK' }]
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Get product details
   */
  async getProducts() {
    try {
      if (!this.currentOfferings) {
        await this.fetchOfferings();
      }

      if (!this.currentOfferings || !this.currentOfferings.availablePackages) {
        return [];
      }

      return this.currentOfferings.availablePackages.map(pkg => ({
        identifier: pkg.product.identifier,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
        currencyCode: pkg.product.currencyCode,
        title: pkg.product.title,
        description: pkg.product.description,
        packageType: pkg.packageType
      }));

    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  /**
   * Track purchase for analytics
   */
  async trackPurchase(productId, price) {
    try {
      // This will be integrated with PostHog
      console.log(`Purchase tracked: ${productId} - ${price}`);
      
      // Store purchase history
      const purchases = await AsyncStorage.getItem('purchaseHistory');
      const history = purchases ? JSON.parse(purchases) : [];
      
      history.push({
        productId,
        price,
        timestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem('purchaseHistory', JSON.stringify(history));

    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  }

  /**
   * Get subscription status details
   */
  async getSubscriptionDetails() {
    try {
      const info = this.purchaserInfo || await this.updatePurchaserInfo();
      
      if (!info) {
        return null;
      }

      const activeSubscriptions = Object.values(info.entitlements.active);
      
      if (activeSubscriptions.length === 0) {
        return {
          isActive: false,
          expirationDate: null,
          willRenew: false,
          productIdentifier: null
        };
      }

      const subscription = activeSubscriptions[0];
      
      return {
        isActive: true,
        expirationDate: subscription.expirationDate,
        willRenew: subscription.willRenew,
        productIdentifier: subscription.productIdentifier,
        periodType: subscription.periodType,
        isSandbox: subscription.isSandbox
      };

    } catch (error) {
      console.error('Error getting subscription details:', error);
      return null;
    }
  }

  /**
   * Handle app becoming active (iOS specific)
   */
  async handleAppActive() {
    if (Platform.OS === 'ios') {
      // Refresh purchaser info when app becomes active
      await this.updatePurchaserInfo();
    }
  }

  /**
   * Set user attributes for targeting
   */
  async setUserAttributes(attributes) {
    try {
      if (attributes.email) {
        await Purchases.setEmail(attributes.email);
      }
      
      if (attributes.displayName) {
        await Purchases.setDisplayName(attributes.displayName);
      }
      
      // Set custom attributes
      if (attributes.plantCount !== undefined) {
        await Purchases.setAttributes({ 
          plant_count: attributes.plantCount.toString() 
        });
      }
      
      if (attributes.userLevel) {
        await Purchases.setAttributes({ 
          user_level: attributes.userLevel 
        });
      }

      console.log('User attributes set successfully');

    } catch (error) {
      console.error('Error setting user attributes:', error);
    }
  }

  /**
   * Get promotional offer (iOS only)
   */
  async getPromotionalOffer(productId) {
    if (Platform.OS !== 'ios') {
      return null;
    }

    try {
      // This would integrate with your backend to generate promotional offers
      console.log(`Checking promotional offers for ${productId}`);
      return null;

    } catch (error) {
      console.error('Error getting promotional offer:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new RevenueCatService();
export { PRODUCT_IDS, ENTITLEMENTS };
