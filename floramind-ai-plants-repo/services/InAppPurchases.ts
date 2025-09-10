import { Platform } from 'react-native';

// Product IDs matching App Store Connect
export const PRODUCT_IDS = {
  MONTHLY: 'com.floramind.aiplants.premium.monthly',
  YEARLY: 'com.floramind.premium.yearly',
  PACK_10: 'com.floramind.aiplants.pack.10',
  PACK_50: 'com.floramind.aiplants.pack.50',
} as const;

export interface Product {
  productId: string;
  price: string;
  currency: string;
  localizedPrice: string;
  title: string;
  description: string;
  type: 'subscription' | 'consumable';
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}

class InAppPurchaseService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('IAP only supported on iOS');
      return false;
    }

    try {
      // In a real implementation, you would initialize the IAP service here
      // For now, we'll simulate successful initialization
      this.isInitialized = true;
      console.log('IAP Service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize IAP service:', error);
      return false;
    }
  }

  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Mock products for development
    return [
      {
        productId: PRODUCT_IDS.MONTHLY,
        price: '4.99',
        currency: 'USD',
        localizedPrice: '$4.99',
        title: 'FloraMind Premium Monthly',
        description: 'Unlimited plant identifications, advanced AI insights, plant health monitoring, and premium care recommendations',
        type: 'subscription'
      },
      {
        productId: PRODUCT_IDS.YEARLY,
        price: '19.99',
        currency: 'USD',
        localizedPrice: '$19.99',
        title: 'FloraMind Premium Yearly',
        description: 'Best value! Save 67% with annual subscription. All premium features included.',
        type: 'subscription'
      },
      {
        productId: PRODUCT_IDS.PACK_10,
        price: '2.99',
        currency: 'USD',
        localizedPrice: '$2.99',
        title: '10 Plant Identifications',
        description: 'Perfect for occasional plant lovers. No subscription required.',
        type: 'consumable'
      },
      {
        productId: PRODUCT_IDS.PACK_50,
        price: '9.99',
        currency: 'USD',
        localizedPrice: '$9.99',
        title: '50 Plant Identifications',
        description: 'Great for plant enthusiasts. Best value for identification packs.',
        type: 'consumable'
      }
    ];
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // In a real implementation, you would handle the actual purchase here
      // For now, we'll simulate a successful purchase
      console.log(`Simulating purchase of ${productId}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        productId,
        transactionId: `txn_${Date.now()}`,
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // In a real implementation, you would restore previous purchases here
      console.log('Restoring purchases...');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [{
        success: true,
        productId: PRODUCT_IDS.MONTHLY,
        transactionId: `restored_${Date.now()}`,
      }];
    } catch (error) {
      console.error('Restore failed:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      }];
    }
  }

  async validateReceipt(receipt: string): Promise<boolean> {
    // In a real implementation, you would validate the receipt with Apple's servers
    console.log('Validating receipt...');
    return true;
  }
}

export const iapService = new InAppPurchaseService();