import Purchases, { 
  CustomerInfo, 
  PurchasesOffering, 
  PurchasesPackage,
  PURCHASES_ERROR_CODE 
} from 'react-native-purchases';

// Product identifiers - using your bundle ID
const PRODUCTS = {
  PREMIUM_MONTHLY: 'app.rork.verdai.premium.monthly',
  PREMIUM_YEARLY: 'app.rork.verdai.premium.yearly',
  PREMIUM_LIFETIME: 'app.rork.verdai.premium.lifetime',
};

const ENTITLEMENTS = {
  PREMIUM: 'premium',
};

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Replace with your actual RevenueCat API keys
      const apiKey = __DEV__ 
        ? 'appl_your_sandbox_key_here' 
        : 'appl_your_production_key_here';

      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      this.isInitialized = true;
      console.log('✅ RevenueCat initialized successfully');

      // Set up listener for customer info updates
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        console.log('📊 Customer info updated:', customerInfo);
      });

    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
    }
  }

  async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.all ? Object.values(offerings.all) : [];
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      return [];
    }
  }

  async getCurrentOffering(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('❌ Failed to get current offering:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: any;
  }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('✅ Purchase successful:', customerInfo);
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED) {
        return { success: false, error: 'Purchase cancelled by user' };
      }
      
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: any;
  }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('✅ Purchases restored:', customerInfo);
      return { success: true, customerInfo };
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      return { success: false, error };
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to get customer info:', error);
      return null;
    }
  }

  async isPremiumUser(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return false;

      return customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;
    } catch (error) {
      console.error('❌ Failed to check premium status:', error);
      return false;
    }
  }

  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('✅ User identified in RevenueCat:', userId);
    } catch (error) {
      console.error('❌ Failed to identify user:', error);
    }
  }

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('✅ User logged out from RevenueCat');
    } catch (error) {
      console.error('❌ Failed to log out:', error);
    }
  }

  // Helper methods for specific products
  async purchaseMonthlyPremium(): Promise<{ success: boolean; error?: string }> {
    const offering = await this.getCurrentOffering();
    if (!offering) {
      return { success: false, error: 'No offerings available' };
    }

    const monthlyPackage = offering.monthly;
    if (!monthlyPackage) {
      return { success: false, error: 'Monthly package not available' };
    }

    const result = await this.purchasePackage(monthlyPackage);
    return { success: result.success, error: result.error };
  }

  async purchaseYearlyPremium(): Promise<{ success: boolean; error?: string }> {
    const offering = await this.getCurrentOffering();
    if (!offering) {
      return { success: false, error: 'No offerings available' };
    }

    const yearlyPackage = offering.annual;
    if (!yearlyPackage) {
      return { success: false, error: 'Yearly package not available' };
    }

    const result = await this.purchasePackage(yearlyPackage);
    return { success: result.success, error: result.error };
  }
}

export default RevenueCatService;
export { PRODUCTS, ENTITLEMENTS };