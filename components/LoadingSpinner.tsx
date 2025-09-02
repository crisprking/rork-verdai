import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Sparkles } from 'lucide-react-native';
import { LuxuryColors, ThemeConfig } from '@/constants/colors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
  botanical?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large',
  overlay = false,
  botanical = false,
}) => {
  const containerStyle = overlay ? styles.overlayContainer : styles.container;
  const spinnerSize = size === 'large' ? 'large' : 'small';
  const iconSize = size === 'large' ? 32 : 24;

  if (botanical) {
    return (
      <View style={containerStyle}>
        <LinearGradient
          colors={[LuxuryColors.PRIMARY, LuxuryColors.SECONDARY]}
          style={styles.botanicalBackground}
        >
          <View style={styles.botanicalContent}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Leaf color={LuxuryColors.GOLD} size={iconSize} strokeWidth={2} />
              </View>
              <View style={styles.sparkleIcon}>
                <Sparkles color={LuxuryColors.GOLD} size={16} />
              </View>
            </View>
            <ActivityIndicator 
              size={spinnerSize} 
              color={LuxuryColors.CARD} 
              style={styles.spinner}
            />
            <Text style={styles.botanicalMessage}>{message}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <ActivityIndicator 
        size={spinnerSize} 
        color={LuxuryColors.PRIMARY} 
        style={styles.spinner}
      />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ThemeConfig.spacing.xl,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  botanicalBackground: {
    borderRadius: ThemeConfig.borderRadius.xlarge,
    padding: ThemeConfig.spacing.xxxl,
    alignItems: 'center',
    minWidth: 200,
    ...ThemeConfig.shadows.large,
  },
  botanicalContent: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: ThemeConfig.spacing.xl,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: ThemeConfig.spacing.md,
  },
  message: {
    fontSize: ThemeConfig.typography.fontSizes.md,
    color: LuxuryColors.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: ThemeConfig.spacing.sm,
    fontWeight: ThemeConfig.typography.fontWeights.medium as any,
  },
  botanicalMessage: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    color: LuxuryColors.CARD,
    textAlign: 'center',
    fontWeight: ThemeConfig.typography.fontWeights.medium as any,
    letterSpacing: 0.3,
  },
});

export default LoadingSpinner;