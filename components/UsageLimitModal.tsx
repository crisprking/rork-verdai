import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  Zap, 
  Shield, 
  Sparkles, 
  X,
  Clock,
  TrendingUp
} from 'lucide-react-native';
import { LuxuryColors, ThemeConfig } from '@/constants/colors';

interface UsageLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title?: string;
  message?: string;
  remainingTime?: string;
  currentUsage?: {
    count: number;
    limit: number;
    tier: string;
  };
}



export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  title = "Usage Limit Reached",
  message = "You've reached your daily limit for plant analysis.",
  remainingTime,
  currentUsage,
}) => {
  const premiumFeatures = [
    { icon: Zap, text: "25 daily plant identifications (12.5x more than free)", color: LuxuryColors.GOLD },
    { icon: Shield, text: "25 daily plant diagnoses (12.5x more than free)", color: LuxuryColors.GOLD },
    { icon: Crown, text: "50 daily AI chat messages (10x more than free)", color: LuxuryColors.GOLD },
    { icon: Sparkles, text: "Priority processing (3s vs 10s cooldown)", color: LuxuryColors.GOLD },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={[LuxuryColors.PRIMARY, LuxuryColors.SECONDARY]}
            style={styles.gradient}
          >
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X color={LuxuryColors.CARD} size={24} strokeWidth={2} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Crown color={LuxuryColors.GOLD} size={32} strokeWidth={2} />
                <View style={styles.sparkleAccent}>
                  <Sparkles color={LuxuryColors.GOLD} size={16} />
                </View>
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{message}</Text>
            </View>

            {/* Usage Stats */}
            {currentUsage && (
              <View style={styles.usageStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {currentUsage.count}/{currentUsage.limit}
                  </Text>
                  <Text style={styles.statLabel}>Daily Scans Used</Text>
                </View>
                
                {remainingTime && (
                  <View style={styles.statCard}>
                    <Clock color={LuxuryColors.GOLD} size={20} />
                    <Text style={styles.statLabel}>{remainingTime}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Premium Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Unlock Premium Features</Text>
              
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <feature.icon color={feature.color} size={20} strokeWidth={2} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Pricing Highlight */}
            <View style={styles.pricingContainer}>
              <View style={styles.pricingBadge}>
                <TrendingUp color={LuxuryColors.GOLD} size={16} />
                <Text style={styles.pricingText}>Starting at $19.99/month</Text>
              </View>
              <Text style={styles.pricingSubtext}>
                12.5x more daily usage • Priority processing • Cancel anytime
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={onUpgrade}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[LuxuryColors.GOLD, '#B8860B']}
                  style={styles.upgradeGradient}
                >
                  <Crown color={LuxuryColors.PRIMARY} size={20} strokeWidth={2} />
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.laterButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.laterButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: ThemeConfig.borderRadius.xlarge,
    overflow: 'hidden',
    ...ThemeConfig.shadows.large,
  },
  gradient: {
    padding: ThemeConfig.spacing.xxxl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: ThemeConfig.spacing.lg,
    right: ThemeConfig.spacing.lg,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: ThemeConfig.borderRadius.round,
    padding: ThemeConfig.spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xxxl,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: ThemeConfig.spacing.lg,
  },
  sparkleAccent: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: ThemeConfig.borderRadius.round,
    padding: 4,
  },
  title: {
    fontSize: ThemeConfig.typography.fontSizes.xxxl,
    fontWeight: ThemeConfig.typography.fontWeights.bold as any,
    color: LuxuryColors.CARD,
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  usageStats: {
    flexDirection: 'row',
    gap: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.xxxl,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.lg,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  statNumber: {
    fontSize: ThemeConfig.typography.fontSizes.xxl,
    fontWeight: ThemeConfig.typography.fontWeights.bold as any,
    color: LuxuryColors.GOLD,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: ThemeConfig.typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: ThemeConfig.spacing.xxxl,
  },
  featuresTitle: {
    fontSize: ThemeConfig.typography.fontSizes.xl,
    fontWeight: ThemeConfig.typography.fontWeights.semibold as any,
    color: LuxuryColors.CARD,
    textAlign: 'center',
    marginBottom: ThemeConfig.spacing.lg,
    letterSpacing: 0.3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.md,
    paddingHorizontal: ThemeConfig.spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ThemeConfig.spacing.md,
  },
  featureText: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: ThemeConfig.typography.fontWeights.medium as any,
    flex: 1,
  },
  pricingContainer: {
    alignItems: 'center',
    marginBottom: ThemeConfig.spacing.xxxl,
  },
  pricingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: ThemeConfig.spacing.lg,
    paddingVertical: ThemeConfig.spacing.sm,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.sm,
    gap: ThemeConfig.spacing.sm,
  },
  pricingText: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    fontWeight: ThemeConfig.typography.fontWeights.semibold as any,
    color: LuxuryColors.GOLD,
  },
  pricingSubtext: {
    fontSize: ThemeConfig.typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: ThemeConfig.spacing.md,
  },
  upgradeButton: {
    borderRadius: ThemeConfig.borderRadius.large,
    overflow: 'hidden',
    ...ThemeConfig.shadows.medium,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ThemeConfig.spacing.lg,
    paddingHorizontal: ThemeConfig.spacing.xxxl,
    gap: ThemeConfig.spacing.sm,
  },
  upgradeButtonText: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    fontWeight: ThemeConfig.typography.fontWeights.bold as any,
    color: LuxuryColors.PRIMARY,
    letterSpacing: 0.5,
  },
  laterButton: {
    paddingVertical: ThemeConfig.spacing.md,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: ThemeConfig.typography.fontWeights.medium as any,
  },
});