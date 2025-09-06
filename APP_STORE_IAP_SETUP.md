# FloraMind: App Store In-App Purchase Setup Guide

## 📱 **App Store Connect Configuration**

### **1. Subscription Groups**
Create **ONE** subscription group:

**Group Name:** `FloraMind Premium`  
**Group ID:** `floramind_premium_group`  
**Description:** Premium AI plant intelligence features

### **2. Subscription Products (within the group)**

#### **Monthly Subscription:**
- **Product ID:** `com.floramind.premium.monthly`
- **Reference Name:** FloraMind Premium Monthly
- **Display Name:** FloraMind Premium Monthly
- **Description:** Unlimited AI features, advanced analytics, and premium plant intelligence
- **Price:** $9.99 USD
- **Subscription Duration:** 1 Month
- **Subscription Group:** FloraMind Premium

#### **Annual Subscription:**
- **Product ID:** `com.floramind.premium.annual`
- **Reference Name:** FloraMind Premium Annual
- **Display Name:** FloraMind Premium Annual
- **Description:** Unlimited AI features, advanced analytics, and premium plant intelligence (Save 40%)
- **Price:** $59.99 USD
- **Subscription Duration:** 1 Year
- **Subscription Group:** FloraMind Premium

### **3. Consumable Products (separate from subscriptions)**

#### **AI Identification Pack:**
- **Product ID:** `com.floramind.ai.identification.pack`
- **Reference Name:** AI Identification Pack
- **Display Name:** AI Identification Pack
- **Description:** 50 additional AI plant identifications (one-time purchase)
- **Price:** $4.99 USD
- **Type:** Consumable

#### **Advanced Analytics:**
- **Product ID:** `com.floramind.advanced.analytics`
- **Reference Name:** Advanced Analytics Pack
- **Display Name:** Advanced Analytics Pack
- **Description:** Unlock detailed growth analytics and environmental insights
- **Price:** $2.99 USD
- **Type:** Consumable

#### **Carbon Tracking Pro:**
- **Product ID:** `com.floramind.carbon.tracking.pro`
- **Reference Name:** Carbon Tracking Pro
- **Display Name:** Carbon Tracking Pro
- **Description:** Advanced carbon footprint tracking and environmental impact analysis
- **Price:** $1.99 USD
- **Type:** Consumable

#### **Community Insights:**
- **Product ID:** `com.floramind.community.insights`
- **Reference Name:** Community Insights Pack
- **Display Name:** Community Insights Pack
- **Description:** Access to global plant care community data and AI insights
- **Price:** $3.99 USD
- **Type:** Consumable

## 🎯 **Pricing Strategy Rationale**

### **Subscription Pricing:**
- **Monthly ($9.99):** Competitive with other AI apps
- **Annual ($59.99):** 40% savings encourages annual commitment
- **Value Proposition:** Unlimited AI features vs limited free tier

### **Consumable Pricing:**
- **AI Pack ($4.99):** High-value feature, premium pricing
- **Analytics ($2.99):** Mid-tier feature, moderate pricing
- **Carbon Tracking ($1.99):** Unique feature, accessible pricing
- **Community ($3.99):** Social feature, premium pricing

## 📊 **Free Tier Limits (to encourage upgrades)**

- **Daily AI Identifications:** 5 (vs unlimited for premium)
- **Daily Health Checks:** 3 (vs unlimited for premium)
- **Plant Collection:** 10 plants (vs unlimited for premium)
- **AI Chat Messages:** 20 per day (vs unlimited for premium)
- **Growth Predictions:** 0 (premium only)
- **Advanced Analytics:** Disabled (premium only)
- **Community Insights:** Disabled (premium only)
- **Carbon Tracking:** Basic only (premium gets advanced)

## 🔧 **Technical Implementation**

### **Product IDs in app.json:**
```json
"inAppPurchases": [
  "com.floramind.premium.monthly",
  "com.floramind.premium.annual",
  "com.floramind.ai.identification.pack",
  "com.floramind.advanced.analytics",
  "com.floramind.carbon.tracking.pro",
  "com.floramind.community.insights"
]
```

### **Subscription Group Configuration:**
- Only ONE subscription group to avoid confusion
- Clear upgrade path from monthly to annual
- Annual subscription offers significant savings

## 🎨 **App Store Marketing**

### **Subscription Benefits:**
- "Unlimited AI Plant Intelligence"
- "Advanced Growth Analytics"
- "Premium Community Insights"
- "Priority AI Support"
- "Export & Share Data"

### **Consumable Benefits:**
- "50 Additional AI Identifications"
- "Detailed Growth Analytics"
- "Advanced Carbon Tracking"
- "Global Community Data"

## 📈 **Revenue Optimization**

### **Conversion Strategy:**
1. **Free Trial:** 7-day free trial for annual subscription
2. **Paywall Timing:** Show after user engages with AI features
3. **Value Demonstration:** Let users experience AI before paywall
4. **Consumable Upsells:** Offer packs when users hit limits

### **Retention Strategy:**
1. **Usage Tracking:** Monitor feature usage to improve value
2. **Personalization:** AI learns user preferences
3. **Community Features:** Social aspects increase retention
4. **Regular Updates:** New AI features keep users engaged

## 🚀 **Launch Strategy**

### **Phase 1: Core Subscriptions**
- Launch with monthly and annual subscriptions
- Focus on AI identification and health diagnosis

### **Phase 2: Consumable Features**
- Add AI identification packs
- Introduce advanced analytics

### **Phase 3: Premium Features**
- Carbon tracking and community insights
- Advanced AI capabilities

## ✅ **App Store Review Checklist**

- [ ] All product IDs match exactly
- [ ] Subscription group properly configured
- [ ] Prices set in USD
- [ ] Descriptions are clear and accurate
- [ ] Free trial configured (if desired)
- [ ] Restore purchases implemented
- [ ] Privacy policy updated for IAP
- [ ] Terms of service updated

---

**This configuration maximizes revenue while providing clear value to users and avoiding Apple's spam detection.**
