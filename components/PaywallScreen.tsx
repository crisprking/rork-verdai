import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Leaf, 
  Shield,
  Zap,
  Star,
  X
} from 'lucide-react-native';
import RevenueCatService, { SubscriptionTier } from '../services/RevenueCatService';
import { PurchasesPackage } from 'react-native-purchases';

const { width: screenWidth } = Dimensions.get('window');

interface PaywallScreenProps {
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export default function PaywallScreen({ onClose, onPurchaseSuccess }: PaywallScreenProps) {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [restoringPurchases, setRestoringPurchases] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setLoading(true);
    try {
      // Initialize RevenueCat if not already done
      await RevenueCatService.initialize();
      
      // Get offerings
      const offerings = await RevenueCatService.getOfferings();
      if (offerings) {
        setPackages(offerings.availablePackages);
        // Select yearly by default (usually best value)
        const yearlyPackage = offerings.availablePackages.find(
          pkg => pkg.packageType === 'ANNUAL'
        );
        setSelectedPackage(yearlyPackage || offerings.availablePackages[0]);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    setLoading(true);
    try {
      const result = await RevenueCatService.purchasePackage(selectedPackage);
      
      if (result.success) {
        Alert.alert(
          '🎉 Welcome to Premium!',
          'You now have unlimited access to all FloraMind AI features!',
          [{ text: 'Awesome!', onPress: onPurchaseSuccess }]
        );
      } else if (result.error) {
        if (result.error !== 'Purchase cancelled') {
          Alert.alert('Purchase Failed', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoringPurchases(true);
    try {
      const result = await RevenueCatService.restorePurchases();
      
      if (result.success && result.customerInfo) {
        const hasActiveSubscription = Object.keys(result.customerInfo.entitlements.active).length > 0;
        
        if (hasActiveSubscription) {
          Alert.alert(
            '✅ Purchases Restored!',
            'Your premium access has been restored.',
            [{ text: 'Great!', onPress: onPurchaseSuccess }]
          );
        } else {
          Alert.alert(
            'No Purchases Found',
            'No previous purchases were found for this account.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setRestoringPurchases(false);
    }
  };

  const features = [
    { icon: Leaf, text: 'Identify 10,000+ plant species instantly' },
    { icon: Shield, text: 'Advanced health diagnosis & treatment' },
    { icon: Sparkles, text: 'Personalized care recommendations' },
    { icon: Zap, text: 'Unlimited plant scans & consultations' },
    { icon: Star, text: 'Access to rare & exotic plant database' },
    { icon: Crown, text: 'Priority expert support' }
  ];

  const plans = RevenueCatService.getSubscriptionPlans();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#065f46', '#047857', '#059669']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <X color="#ffffff" size={24} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Crown color="#fbbf24" size={48} />
          </View>
          <Text style={styles.title}>Unlock FloraMind Premium</Text>
          <Text style={styles.subtitle}>
            Become a plant expert with AI-powered insights
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <feature.icon color="#10b981" size={20} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
          ) : (
            plans.map((plan, index) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPackage?.identifier === plan.id && styles.planCardSelected,
                  plan.isPopular && styles.planCardPopular
                ]}
                onPress={() => {
                  const pkg = packages.find(p => p.identifier === plan.id);
                  if (pkg) setSelectedPackage(pkg);
                }}
                activeOpacity={0.8}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                </View>
                
                <View style={styles.planFeatures}>
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <View key={idx} style={styles.planFeatureRow}>
                      <Check color="#10b981" size={16} />
                      <Text style={styles.planFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                
                {selectedPackage?.identifier === plan.id && (
                  <View style={styles.selectedIndicator}>
                    <Check color="#ffffff" size={20} />
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={loading || !selectedPackage}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#fbbf24', '#f59e0b', '#d97706']}
            style={styles.purchaseButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.purchaseButtonText}>Start Free Trial</Text>
                <Text style={styles.purchaseButtonSubtext}>Then {selectedPackage?.product.priceString || '$9.99'}/month</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoringPurchases}
        >
          {restoringPurchases ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Cancel anytime. Recurring billing. Terms apply.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#065f46',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 80 : 60,
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
  },
  plansContainer: {
    marginBottom: 30,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 40,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  planCardPopular: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#065f46',
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  planFeatures: {
    marginTop: 8,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButton: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  purchaseButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  terms: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
});
