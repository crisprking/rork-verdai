# 💰 RevenueCat Setup Guide for FloraMind AI Plants

## 🚀 Complete RevenueCat Integration Guide

### **Step 1: RevenueCat Dashboard Setup**

1. **Create RevenueCat Account**
   - Go to [RevenueCat.com](https://www.revenuecat.com)
   - Sign up for free account
   - Create new project: "FloraMind AI Plants"

2. **Add Your App**
   - Click "Add App" in RevenueCat dashboard
   - **App Name**: FloraMind AI Plants
   - **Bundle ID**: `app.rork.verdai`
   - **Platform**: iOS (add Android later if needed)

3. **Get Your API Keys**
   - Go to Project Settings → API Keys
   - Copy your **iOS API Key** (starts with `appl_`)
   - Save it securely

### **Step 2: App Store Connect Configuration**

1. **Create In-App Purchases in App Store Connect**
   ```
   Required Products:
   - floramind_premium_monthly ($9.99/month)
   - floramind_premium_yearly ($59.99/year)
   - floramind_lifetime ($149.99)
   - plant_identifications_10 ($4.99)
   - plant_identifications_50 ($19.99)
   ```

2. **Generate App Store Connect API Key**
   - Go to App Store Connect → Users and Access → Keys
   - Click "+" to create new key
   - **Name**: RevenueCat Integration
   - **Access**: App Manager
   - Download the `.p8` file
   - Note the **Key ID** and **Issuer ID**

3. **Configure in RevenueCat**
   - Go to RevenueCat → App Settings → App Store Connect
   - Upload the `.p8` file
   - Enter Key ID and Issuer ID
   - Click "Save"

### **Step 3: Configure Products in RevenueCat**

1. **Create Entitlements**
   - Go to Entitlements in RevenueCat
   - Create "premium" entitlement
   - Add all subscription products to this entitlement

2. **Create Offerings**
   - Go to Offerings
   - Create "default" offering
   - Add packages:
     - Monthly → floramind_premium_monthly
     - Annual → floramind_premium_yearly
     - Lifetime → floramind_lifetime

### **Step 4: Update Your Code**

1. **Add RevenueCat API Key**
   ```typescript
   // In services/RevenueCatService.ts
   private static readonly API_KEY_IOS = 'appl_YOUR_ACTUAL_KEY_HERE';
   ```

2. **Initialize in App.tsx**
   ```typescript
   import RevenueCatService from './services/RevenueCatService';
   
   useEffect(() => {
     // Initialize RevenueCat on app launch
     RevenueCatService.initialize();
   }, []);
   ```

3. **Show Paywall**
   ```typescript
   import PaywallScreen from './components/PaywallScreen';
   
   // Show when user hits premium feature
   const [showPaywall, setShowPaywall] = useState(false);
   
   const handlePremiumFeature = async () => {
     const isPremium = await RevenueCatService.isPremium();
     if (!isPremium) {
       setShowPaywall(true);
     }
   };
   ```

### **Step 5: Testing**

1. **Sandbox Testing**
   - Add sandbox tester in App Store Connect
   - Sign in with sandbox account on device
   - Test purchases (they won't charge real money)

2. **Verify Integration**
   - Check RevenueCat dashboard for events
   - Verify purchases appear in dashboard
   - Test restore purchases functionality

### **Step 6: Production Checklist**

- [ ] Real API keys configured
- [ ] All products created in App Store Connect
- [ ] Products approved by Apple
- [ ] RevenueCat webhook configured (optional)
- [ ] Analytics events tracking
- [ ] Error handling for failed purchases
- [ ] Restore purchases button working
- [ ] Subscription management link

## 📊 **Revenue Optimization Tips**

1. **Pricing Strategy**
   - Monthly: $9.99 (standard)
   - Yearly: $59.99 (50% discount)
   - Lifetime: $149.99 (best for power users)

2. **Conversion Tactics**
   - Show paywall after 3 free identifications
   - Highlight yearly savings
   - Add "Most Popular" badge to yearly
   - Include free trial for subscriptions

3. **Retention Features**
   - Send care reminders to premium users
   - Exclusive plant database access
   - Priority support channel
   - Early access to new features

## 🎯 **Expected Revenue**

With proper implementation:
- **Conversion Rate**: 3-5% of users
- **Average Revenue Per User**: $15-25/month
- **Projected Monthly Revenue**: $10K-50K (with 10K+ users)

## 🚨 **Important Notes**

1. **StoreKit 2 Configuration**
   - RevenueCat supports StoreKit 2
   - Enable in RevenueCat dashboard if needed
   - Better receipt validation

2. **Privacy Compliance**
   - Update privacy policy with subscription terms
   - Include auto-renewal disclosure
   - Add restore purchases option

3. **App Review**
   - Provide test account to Apple
   - Include demo video of purchase flow
   - Explain subscription benefits clearly

## ✅ **You're Ready!**

With RevenueCat integrated, your FloraMind AI Plants app will have:
- Professional paywall system
- Reliable subscription management
- Revenue analytics
- Cross-platform support
- Automatic receipt validation

**Your plant AI app is now ready to generate serious revenue! 💰🌱**
