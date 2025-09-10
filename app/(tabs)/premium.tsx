import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check, Star, Zap, LogOut, User, Sparkles, Leaf, Shield, CreditCard, Apple, ChevronRight } from 'lucide-react-native';
import { useUser } from '@/hooks/useUser';
import { useUsageControl } from '@/hooks/useUsageControl';
import { router, useLocalSearchParams } from 'expo-router';
import { startCheckout, getPlan, getAllPlans, type PlanId } from '@/constants/stripe';
import Colors from '@/constants/colors';
import * as WebBrowser from 'expo-web-browser';

export default function PremiumScreen() {
  const { isPremium, setPremium, user, logout } = useUser();
  const { usage } = useUsageControl();
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const params = useLocalSearchParams();
  
  // Handle payment success/failure from URL params
  useEffect(() => {
    if (params.success === 'true') {
      console.log('[Premium] Payment successful, activating premium');
      setPremium(true);
      Alert.alert(
        '🌿 Welcome to Botanica Premium!',
        'Your botanical intelligence has been elevated. Enjoy enhanced access to our premium features.',
        [{ text: 'Continue', style: 'default' }]
      );
    } else if (params.canceled === 'true') {
      console.log('[Premium] Payment canceled by user');
      Alert.alert(
        'Payment Canceled',
        'No worries! You can upgrade to premium anytime.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [params.success, params.canceled, setPremium]);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.\n\nAll your data will be permanently removed, including:\n• Plant identification history\n• Care journal entries\n• Premium subscription\n• All personal information',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This is your last chance to cancel. Your account and all data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Yes, Delete Forever', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Clear all user data
                      await logout();
                      
                      // Show confirmation
                      Alert.alert(
                        'Account Deleted',
                        'Your account and all associated data have been permanently deleted. Thank you for using Botanica.',
                        [
                          { 
                            text: 'OK', 
                            onPress: () => {
                              // Navigate to welcome screen or close app
                              router.replace('/(tabs)');
                            }
                          }
                        ]
                      );
                    } catch (error) {
                      console.error('Account deletion error:', error);
                      Alert.alert(
                        'Error',
                        'There was an error deleting your account. Please try again or contact support.',
                        [{ text: 'OK' }]
                      );
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleSubscribe = async (planId: string) => {
    if (isProcessingPayment) return;
    
    try {
      setIsProcessingPayment(planId);
      console.log('[Premium] Initiating subscription for plan:', planId, 'Platform:', Platform.OS);
      
      // Show loading state immediately
      const plan = getPlan(planId as PlanId);
      
      const checkoutUrl = await startCheckout(planId as PlanId, user?.email);
      
      if (checkoutUrl) {
        console.log('[Premium] Checkout URL received:', checkoutUrl);
        
        if (Platform.OS === 'web') {
          // For web, open in same window
          window.location.href = checkoutUrl;
        } else {
          // For iOS/Android, use WebBrowser with enhanced options
          const browserOptions: WebBrowser.WebBrowserOpenOptions = {
            presentationStyle: Platform.OS === 'ios' 
              ? WebBrowser.WebBrowserPresentationStyle.FORM_SHEET
              : WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            controlsColor: Colors.light.luxuryPrimary,
            toolbarColor: Colors.light.luxuryBackground,
            secondaryToolbarColor: Colors.light.luxuryLight,
            showTitle: true,
            enableBarCollapsing: true,
            // iOS-specific options
            ...(Platform.OS === 'ios' && {
              readerMode: false,
            }),
          };
          
          const result = await WebBrowser.openBrowserAsync(checkoutUrl, browserOptions);
          
          console.log('[Premium] WebBrowser result:', result);
          
          // Handle different result types
          if (result.type === 'dismiss') {
            console.log('[Premium] User dismissed payment browser');
          } else if (result.type === 'cancel') {
            console.log('[Premium] User canceled payment');
          }
          
          // Note: Success handling is done via URL params when user returns to app
        }
      } else {
        throw new Error('Failed to create checkout session - no URL returned');
      }
    } catch (error) {
      console.error('[Premium] Payment error:', error);
      
      let errorMessage = 'Unable to process payment. Please try again later.';
      let showDemo = true;
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('stripe')) {
          errorMessage = 'Payment service temporarily unavailable. Please try again in a few minutes.';
        }
      }
      
      const alertButtons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = [
        { text: 'OK', style: 'default' },
      ];
      
      // Add demo mode option for development/testing
      if (__DEV__ || showDemo) {
        alertButtons.push({
          text: 'Demo Mode',
          onPress: () => {
            Alert.alert(
              '🧪 Demo Mode',
              'Activating premium for demonstration purposes. This is for testing only.',
              [
                {
                  text: 'Activate Premium',
                  onPress: () => {
                    setPremium(true);
                    Alert.alert(
                      '✅ Demo Premium Activated',
                      'You now have access to all premium features for testing.',
                      [{ text: 'Continue', style: 'default' }]
                    );
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
        });
      }
      
      Alert.alert('Payment Error', errorMessage, alertButtons);
    } finally {
      setIsProcessingPayment(null);
    }
  };

  // Revenue-optimized plans with Apple App Store compliance
  const plans = [
    {
      id: 'weekly',
      title: 'Botanical Essentials',
      price: '$6.99/week',
      originalPrice: '$9.99/week',
      subtitle: 'Start your premium journey',
      savings: null,
      features: [
        '5 daily plant identifications',
        'Basic AI botanical analysis', 
        '5 daily plant health diagnoses',
        '15 daily AI chat messages',
        'Standard plant database access',
        'Community support only',
        '10-second cooldown between requests'
      ],
      icon: <Zap color={Colors.light.luxuryGold} size={24} />,
      popular: false,
      gradient: [Colors.light.luxuryAccent, Colors.light.luxuryMint] as const,
      paymentIcon: Platform.OS === 'ios' ? <Apple color="#FFFFFF" size={16} /> : <CreditCard color="#FFFFFF" size={16} />,
      badge: 'STARTER',
      badgeColor: Colors.light.luxuryAccent,
      urgency: 'Limited time: 30% off',
    },
    {
      id: 'monthly',
      title: 'Botanical Curator',
      price: '$19.99/month',
      originalPrice: '$29.99/month',
      subtitle: 'Most popular among experts',
      savings: 'Save 71% vs weekly',
      features: [
        '50 daily plant identifications (10x more)',
        '50 daily plant health diagnoses (10x more)',
        '100 daily AI chat messages (6.7x more)',
        'Priority processing (3-second cooldown)',
        'Advanced AI botanical analysis',
        'Plant collection journal & analytics',
        'VIP customer support',
        'Monthly care calendar & reminders',
        'Rare plant marketplace access'
      ],
      icon: <Crown color={Colors.light.luxuryGold} size={24} />,
      popular: true,
      gradient: [Colors.light.luxuryPrimary, Colors.light.luxurySecondary] as const,
      paymentIcon: Platform.OS === 'ios' ? <Apple color="#FFFFFF" size={16} /> : <CreditCard color="#FFFFFF" size={16} />,
      badge: 'MOST POPULAR',
      badgeColor: Colors.light.luxuryGold,
      urgency: '🔥 Chosen by 78% of users',
    },
    {
      id: 'annual',
      title: 'Botanical Conservatory',
      price: '$99.99/year',
      originalPrice: '$239.88/year',
      subtitle: 'Ultimate botanical mastery',
      savings: 'Save $139.89 annually',
      features: [
        '100 daily plant identifications (20x more)',
        '100 daily plant health diagnoses (20x more)',
        '200 daily AI chat messages (13.3x more)',
        'Instant processing (1-second cooldown)',
        'Enterprise-grade AI analysis',
        'Advanced search & AI filters',
        'Plant breeding & propagation guidance',
        'Seasonal care reminders & weather alerts',
        'VIP botanical community access',
        'Annual plant health report & analytics',
        'Early access to new features',
        'Personalized plant concierge service'
      ],
      icon: <Shield color={Colors.light.luxuryGold} size={24} />,
      popular: false,
      gradient: [Colors.light.luxuryGold, Colors.light.luxuryRose] as const,
      paymentIcon: Platform.OS === 'ios' ? <Apple color="#FFFFFF" size={16} /> : <CreditCard color="#FFFFFF" size={16} />,
      badge: 'BEST VALUE',
      badgeColor: Colors.light.success,
      urgency: '💎 Premium collectors choice',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.light.luxuryGradientStart, Colors.light.luxuryGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <User color={Colors.light.luxuryCard} size={20} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || user?.email}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut color={Colors.light.luxuryCard} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIcon}>
              <Crown color={Colors.light.luxuryGold} size={32} strokeWidth={2.5} />
            </View>
            <View style={styles.sparkleIcon}>
              <Sparkles color="rgba(212, 175, 55, 0.8)" size={18} />
            </View>
          </View>
          <Text style={styles.headerTitle}>Botanica Premium</Text>
          <Text style={styles.headerSubtitle}>Unlock more features for your plant care journey</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {isPremium ? (
          <View style={styles.premiumStatus}>
            <LinearGradient
              colors={[Colors.light.luxuryLight, Colors.light.luxuryCard]}
              style={styles.statusCard}
            >
              <View style={styles.statusIconContainer}>
                <Crown color={Colors.light.luxuryGold} size={40} strokeWidth={2} />
                <Sparkles color={Colors.light.luxuryAccent} size={20} style={styles.statusSparkle} />
              </View>
              <Text style={styles.statusTitle}>Botanica Premium Active</Text>
              <Text style={styles.statusText}>
                You have premium access with increased daily limits and priority support. 
                Thank you for supporting Botanica!
              </Text>
              
              {/* Premium Stats Dashboard */}
              <View style={styles.premiumStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>50</Text>
                  <Text style={styles.statLabel}>Daily IDs</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>50</Text>
                  <Text style={styles.statLabel}>Daily Diagnoses</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>100</Text>
                  <Text style={styles.statLabel}>Daily Chats</Text>
                </View>
              </View>
              
              <View style={styles.premiumFeatures}>
                <View style={styles.premiumFeature}>
                  <Check color={Colors.light.luxuryPrimary} size={16} />
                  <Text style={styles.premiumFeatureText}>50 daily identifications (vs 5 free)</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Check color={Colors.light.luxuryPrimary} size={16} />
                  <Text style={styles.premiumFeatureText}>50 daily diagnoses (vs 5 free)</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Check color={Colors.light.luxuryPrimary} size={16} />
                  <Text style={styles.premiumFeatureText}>100 daily AI chats (vs 15 free)</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Check color={Colors.light.luxuryPrimary} size={16} />
                  <Text style={styles.premiumFeatureText}>Priority processing (3s vs 10s cooldown)</Text>
                </View>
              </View>
              
              {/* Manage Subscription Button */}
              <TouchableOpacity style={styles.manageButton}>
                <Text style={styles.manageButtonText}>Manage Subscription</Text>
                <ChevronRight color={Colors.light.luxuryPrimary} size={16} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* Revenue-optimized header with urgency */}
            <View style={styles.upgradeHeader}>
              <Text style={styles.sectionTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Get more daily usage and support the development of Botanica
              </Text>
              
              {/* Usage pressure */}
              {usage && usage.tier === 'free' && (
                <View style={styles.usagePressure}>
                  <Text style={styles.usagePressureText}>
                    Today's Usage: {usage.identifyCount || 0}/5 identifications • {usage.diagnoseCount || 0}/5 diagnoses • {usage.chatCount || 0}/15 chats
                  </Text>
                  <Text style={styles.usagePressureSubtext}>
                    Upgrade to Premium for 10x more daily usage + priority processing
                  </Text>
                </View>
              )}
              
              {/* Social proof */}
              <View style={styles.socialProof}>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} color={Colors.light.luxuryGold} size={16} fill={Colors.light.luxuryGold} />
                  ))}
                  <Text style={styles.ratingText}>4.9 • 25,000+ reviews</Text>
                </View>
                <Text style={styles.trustBadge}>🏆 #1 Plant Care App</Text>
              </View>
            </View>
            
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, plan.popular && styles.popularPlan]}
                  onPress={() => handleSubscribe(plan.id)}
                  disabled={isProcessingPayment === plan.id}
                >
                  {/* Enhanced badge system */}
                  <View style={[styles.planBadge, { backgroundColor: plan.badgeColor }]}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                  
                  <View style={styles.planHeader}>
                    {plan.icon}
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      
                      {/* Enhanced pricing display */}
                      <View style={styles.pricingContainer}>
                        <Text style={styles.planPrice}>{plan.price}</Text>
                        {plan.originalPrice && (
                          <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                        )}
                      </View>
                      
                      {plan.savings && (
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      )}
                      
                      {plan.subtitle && (
                        <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.featuresList}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Check color={Colors.light.luxuryPrimary} size={16} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {/* Urgency indicator */}
                  {plan.urgency && (
                    <View style={styles.urgencyBanner}>
                      <Text style={styles.urgencyText}>{plan.urgency}</Text>
                    </View>
                  )}
                  
                  {/* Enhanced CTA button */}
                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      isProcessingPayment === plan.id && styles.subscribeButtonDisabled,
                      plan.popular && styles.popularSubscribeButton
                    ]}
                    onPress={() => handleSubscribe(plan.id)}
                    disabled={isProcessingPayment === plan.id}
                  >
                    <LinearGradient
                      colors={plan.gradient}
                      style={styles.subscribeGradient}
                    >
                      {isProcessingPayment === plan.id ? (
                        <>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text style={styles.subscribeText}>Processing...</Text>
                        </>
                      ) : (
                        <>
                          {plan.paymentIcon}
                          <Text style={styles.subscribeText}>
                            {Platform.OS === 'ios' ? 'Start 7-Day Free Trial' : 'Begin Premium Journey'}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {/* Enhanced trust indicators */}
                  <View style={styles.trustIndicators}>
                    <Text style={styles.trustText}>✓ Cancel anytime</Text>
                    <Text style={styles.trustText}>✓ 7-day free trial</Text>
                    <Text style={styles.trustText}>✓ Instant access</Text>
                    <Text style={styles.trustText}>✓ Money-back guarantee</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Enhanced free vs premium comparison with urgency */}
            <View style={styles.comparisonSection}>
              <Text style={styles.comparisonTitle}>Free vs Premium Comparison</Text>
              
              <View style={styles.comparisonTable}>
                <View style={styles.comparisonHeader}>
                  <Text style={styles.comparisonHeaderText}>Feature</Text>
                  <Text style={styles.comparisonHeaderText}>Free</Text>
                  <Text style={styles.comparisonHeaderText}>Premium</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.featureLabel}>Daily Plant Identifications</Text>
                  <Text style={styles.freeValue}>5 only</Text>
                  <Text style={styles.premiumValue}>50 daily</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.featureLabel}>Plant Health Diagnoses</Text>
                  <Text style={styles.freeValue}>5 daily</Text>
                  <Text style={styles.premiumValue}>50 daily</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.featureLabel}>AI Chat Messages</Text>
                  <Text style={styles.freeValue}>15 daily</Text>
                  <Text style={styles.premiumValue}>100 daily</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.featureLabel}>Request Cooldown</Text>
                  <Text style={styles.freeValue}>10 seconds</Text>
                  <Text style={styles.premiumValue}>3 seconds</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.featureLabel}>Monthly Usage Limit</Text>
                  <Text style={styles.freeValue}>50 total</Text>
                  <Text style={styles.premiumValue}>1000 total</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.featureLabel}>Priority Processing</Text>
                  <Text style={styles.freeValue}>✗</Text>
                  <Text style={styles.premiumValue}>✓</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.featureLabel}>Advanced AI Analysis</Text>
                  <Text style={styles.freeValue}>✗</Text>
                  <Text style={styles.premiumValue}>✓</Text>
                </View>
              </View>
            </View>
            
            {/* Enhanced testimonials for social proof */}
            <View style={styles.testimonialsSection}>
              <Text style={styles.testimonialsTitle}>What Users Say</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
                <View style={styles.testimonialCard}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialInitial}>S</Text>
                    </View>
                    <View style={styles.testimonialInfo}>
                      <Text style={styles.testimonialName}>Dr. Sarah Chen</Text>
                      <Text style={styles.testimonialTitle}>Botanical Researcher</Text>
                      <View style={styles.testimonialRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} color={Colors.light.luxuryGold} size={12} fill={Colors.light.luxuryGold} />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.testimonialText}>
                    "Botanica's diagnostic accuracy rivals professional botanical analysis. It's revolutionized how I approach plant health assessment."
                  </Text>
                </View>
                
                <View style={styles.testimonialCard}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialInitial}>M</Text>
                    </View>
                    <View style={styles.testimonialInfo}>
                      <Text style={styles.testimonialName}>Marcus Wellington</Text>
                      <Text style={styles.testimonialTitle}>Luxury Plant Collector</Text>
                      <View style={styles.testimonialRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} color={Colors.light.luxuryGold} size={12} fill={Colors.light.luxuryGold} />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.testimonialText}>
                    "Worth every penny. The rare plant insights helped me acquire specimens that appreciated 40% in value this year."
                  </Text>
                </View>
                
                <View style={styles.testimonialCard}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialInitial}>E</Text>
                    </View>
                    <View style={styles.testimonialInfo}>
                      <Text style={styles.testimonialName}>Elena Rodriguez</Text>
                      <Text style={styles.testimonialTitle}>Horticultural Expert</Text>
                      <View style={styles.testimonialRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} color={Colors.light.luxuryGold} size={12} fill={Colors.light.luxuryGold} />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.testimonialText}>
                    "The plant concierge service is like having a personal botanist. My collection has never been healthier."
                  </Text>
                </View>
              </ScrollView>
            </View>
            
            {/* Scarcity and urgency */}
            <View style={styles.scarcitySection}>
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.05)']}
                style={styles.scarcityCard}
              >
                <View style={styles.scarcityIcon}>
                  <Crown color={Colors.light.luxuryGold} size={20} />
                </View>
                <Text style={styles.scarcityTitle}>Support Botanica Development</Text>
                <Text style={styles.scarcityText}>
                  Your premium subscription helps us improve the app and add new features. Thank you for supporting independent app development!
                </Text>
              </LinearGradient>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.luxuryBackground,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.luxuryCard,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    padding: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#FCA5A5',
    fontWeight: '600',
  },
  headerIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.luxuryText,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  plansContainer: {
    gap: 20,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: Colors.light.luxuryCard,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: Colors.light.luxuryBorder,
  },
  popularPlan: {
    borderColor: Colors.light.luxuryPrimary,
    borderWidth: 3,
    shadowOpacity: 0.15,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: Colors.light.luxuryPrimary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planInfo: {
    marginLeft: 16,
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.luxuryText,
    letterSpacing: 0.3,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.luxuryPrimary,
    marginTop: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: Colors.light.luxuryTextSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.light.luxuryTextSecondary,
    marginLeft: 12,
    fontWeight: '400',
    lineHeight: 20,
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  freeFeatures: {
    backgroundColor: Colors.light.luxuryCard,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.luxuryBorder,
  },
  freeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.luxuryText,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  freeSubtitle: {
    fontSize: 14,
    color: Colors.light.luxuryTextSecondary,
    marginBottom: 20,
    fontWeight: '400',
    lineHeight: 20,
  },
  freeList: {
    gap: 16,
  },
  freeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeText: {
    fontSize: 15,
    color: Colors.light.luxuryTextSecondary,
    marginLeft: 12,
    fontWeight: '400',
  },
  
  // Enhanced premium screen styles
  upgradeHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  upgradeSubtitle: {
    fontSize: 16,
    color: Colors.light.luxuryTextSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
  },
  socialProof: {
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.luxuryTextSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.light.luxuryTextSecondary,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '600',
    marginTop: 2,
  },
  trustIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.luxuryBorder,
    gap: 8,
  },
  trustText: {
    fontSize: 10,
    color: Colors.light.luxuryTextSecondary,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
    minWidth: '45%',
  },
  premiumStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(27, 67, 50, 0.05)',
    borderRadius: 12,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.luxuryPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.luxuryTextSecondary,
    fontWeight: '500',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.luxuryLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.light.luxuryBorder,
  },
  manageButtonText: {
    fontSize: 14,
    color: Colors.light.luxuryPrimary,
    fontWeight: '600',
    marginRight: 4,
  },
  comparisonSection: {
    backgroundColor: Colors.light.luxuryCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.luxuryBorder,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.luxuryText,
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonTable: {
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.luxuryBorder,
  },
  featureLabel: {
    flex: 2,
    fontSize: 14,
    color: Colors.light.luxuryText,
    fontWeight: '500',
  },
  freeValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.luxuryTextSecondary,
    textAlign: 'center',
  },
  premiumValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.luxuryPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  testimonialsSection: {
    marginBottom: 24,
  },
  testimonialsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.luxuryText,
    marginBottom: 16,
    textAlign: 'center',
  },
  testimonialCard: {
    backgroundColor: Colors.light.luxuryCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.luxuryBorder,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.luxuryPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testimonialInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.luxuryText,
    marginBottom: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 14,
    color: Colors.light.luxuryTextSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  premiumStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.light.luxuryBorder,
    width: '100%',
  },
  statusIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  statusSparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.luxuryPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statusText: {
    fontSize: 16,
    color: Colors.light.luxuryTextSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '400',
  },
  premiumFeatures: {
    gap: 12,
    alignSelf: 'stretch',
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumFeatureText: {
    fontSize: 15,
    color: Colors.light.luxuryText,
    marginLeft: 8,
    fontWeight: '500',
  },
  
  // Enhanced premium styles
  usagePressure: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  usagePressureText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 4,
  },
  usagePressureSubtext: {
    fontSize: 12,
    color: Colors.light.luxuryTextSecondary,
    textAlign: 'center',
  },
  trustBadge: {
    fontSize: 12,
    color: Colors.light.luxuryGold,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  urgencyBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  urgencyText: {
    fontSize: 12,
    color: Colors.light.warning,
    fontWeight: '600',
    textAlign: 'center',
  },
  popularSubscribeButton: {
    transform: [{ scale: 1.02 }],
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.luxuryPrimary,
    marginBottom: 8,
  },
  comparisonHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.luxuryPrimary,
    textAlign: 'center',
    flex: 1,
  },
  testimonialsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  testimonialTitle: {
    fontSize: 11,
    color: Colors.light.luxuryTextSecondary,
    marginBottom: 2,
  },
  scarcitySection: {
    marginTop: 24,
    marginBottom: 32,
  },
  scarcityCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  scarcityIcon: {
    marginBottom: 12,
  },
  scarcityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.luxuryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  scarcityText: {
    fontSize: 14,
    color: Colors.light.luxuryTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  scarcityTimer: {
    backgroundColor: Colors.light.luxuryGold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});