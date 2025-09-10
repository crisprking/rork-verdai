// ULTRA-RESPONSIVE UI COMPONENTS - MAXIMUM PERFORMANCE & BEAUTY
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Vibration,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';
const isTablet = SCREEN_WIDTH > 768;

// PERFORMANCE-OPTIMIZED COLORS
export const UltraColors = {
  // Primary Plant Theme
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#4ADE80',
  
  // Sophisticated Gradients
  gradients: {
    primary: ['#22C55E', '#16A34A'],
    success: ['#10B981', '#059669'],
    premium: ['#F59E0B', '#D97706'],
    danger: ['#EF4444', '#DC2626'],
    info: ['#3B82F6', '#2563EB'],
    cosmic: ['#8B5CF6', '#7C3AED'],
  },
  
  // Neutral Palette
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#F8FAFC',
  border: '#E2E8F0',
  
  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Glass Morphism
  glass: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(0, 0, 0, 0.1)',
} as const;

// ULTRA-RESPONSIVE DIMENSIONS
export const UltraDimensions = {
  // Responsive spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Responsive typography
  fontSize: {
    xs: isTablet ? 12 : 10,
    sm: isTablet ? 14 : 12,
    md: isTablet ? 18 : 16,
    lg: isTablet ? 22 : 20,
    xl: isTablet ? 28 : 24,
    xxl: isTablet ? 36 : 32,
    display: isTablet ? 48 : 40,
  },
  
  // Responsive border radius
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Component sizes
  button: {
    height: isTablet ? 56 : 48,
    minWidth: isTablet ? 120 : 100,
  },
  
  card: {
    minHeight: isTablet ? 200 : 150,
    padding: isTablet ? 24 : 16,
  },
} as const;

// ULTRA-PERFORMANCE ANIMATIONS
export const UltraAnimations = {
  // Timing configurations
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // Easing functions
  easing: {
    bounce: Easing.bounce,
    ease: Easing.ease,
    elastic: Easing.elastic(1.3),
    spring: Easing.spring,
  },
  
  // Pre-configured animations
  fadeIn: (duration = 300) => ({
    opacity: {
      from: 0,
      to: 1,
      duration,
      easing: Easing.ease,
    },
  }),
  
  slideUp: (duration = 300) => ({
    transform: [{
      translateY: {
        from: 50,
        to: 0,
        duration,
        easing: Easing.out(Easing.cubic),
      },
    }],
    opacity: {
      from: 0,
      to: 1,
      duration,
    },
  }),
  
  scale: (duration = 200) => ({
    transform: [{
      scale: {
        from: 0.9,
        to: 1,
        duration,
        easing: Easing.out(Easing.back(1.7)),
      },
    }],
  }),
} as const;

// ULTRA-RESPONSIVE BUTTON COMPONENT
interface UltraButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  gradient?: boolean;
  haptics?: boolean;
  style?: any;
}

export const UltraButton = memo<UltraButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  gradient = true,
  haptics = true,
  style,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  const handlePressIn = useCallback(() => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [haptics, scaleAnim, glowAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, glowAnim]);

  const buttonStyles = useMemo(() => {
    const baseStyle = {
      height: UltraDimensions.button.height,
      minWidth: UltraDimensions.button.minWidth,
      borderRadius: UltraDimensions.radius.xl,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row' as const,
      paddingHorizontal: UltraDimensions.spacing.lg,
    };

    const variants = {
      primary: {
        backgroundColor: gradient ? undefined : UltraColors.primary,
        shadowColor: UltraColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
      secondary: {
        backgroundColor: UltraColors.surface,
        borderWidth: 2,
        borderColor: UltraColors.border,
      },
      success: {
        backgroundColor: gradient ? undefined : UltraColors.success,
        shadowColor: UltraColors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      danger: {
        backgroundColor: gradient ? undefined : UltraColors.error,
        shadowColor: UltraColors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return [baseStyle, variants[variant], disabled && { opacity: 0.6 }];
  }, [variant, gradient, disabled]);

  const textStyles = useMemo(() => {
    const baseTextStyle = {
      fontSize: UltraDimensions.fontSize.md,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    };

    const textColors = {
      primary: UltraColors.text.inverse,
      secondary: UltraColors.text.primary,
      success: UltraColors.text.inverse,
      danger: UltraColors.text.inverse,
      ghost: UltraColors.text.primary,
    };

    return [baseTextStyle, { color: textColors[variant] }];
  }, [variant]);

  const gradientColors = useMemo(() => {
    const gradientMap = {
      primary: UltraColors.gradients.primary,
      secondary: ['#F8FAFC', '#E2E8F0'],
      success: UltraColors.gradients.success,
      danger: UltraColors.gradients.danger,
      ghost: ['transparent', 'transparent'],
    };
    return gradientMap[variant];
  }, [variant]);

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? UltraColors.primary : UltraColors.text.inverse}
          style={{ marginRight: title ? UltraDimensions.spacing.sm : 0 }}
        />
      ) : icon ? (
        <Ionicons
          name={icon as any}
          size={20}
          color={variant === 'secondary' ? UltraColors.primary : UltraColors.text.inverse}
          style={{ marginRight: title ? UltraDimensions.spacing.sm : 0 }}
        />
      ) : null}
      {title ? <Text style={textStyles}>{title}</Text> : null}
    </>
  );

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {gradient && variant !== 'secondary' && variant !== 'ghost' ? (
          <LinearGradient
            colors={gradientColors}
            style={buttonStyles}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ButtonContent />
          </LinearGradient>
        ) : (
          <View style={buttonStyles}>
            <ButtonContent />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// ULTRA-RESPONSIVE CARD COMPONENT
interface UltraCardProps {
  children: React.ReactNode;
  style?: any;
  gradient?: boolean;
  blur?: boolean;
  shadow?: boolean;
  onPress?: () => void;
  haptics?: boolean;
}

export const UltraCard = memo<UltraCardProps>(({
  children,
  style,
  gradient = false,
  blur = false,
  shadow = true,
  onPress,
  haptics = true,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = useCallback(() => {
    if (haptics && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  }, [haptics, onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  }, [onPress, scaleAnim]);

  const cardStyles = useMemo(() => [
    styles.card,
    shadow && styles.cardShadow,
    style,
  ], [shadow, style]);

  const CardContent = () => (
    <View style={cardStyles}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
        >
          {gradient ? (
            <LinearGradient
              colors={UltraColors.gradients.primary}
              style={cardStyles}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {children}
            </LinearGradient>
          ) : blur ? (
            <BlurView intensity={20} style={cardStyles}>
              {children}
            </BlurView>
          ) : (
            <CardContent />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (gradient) {
    return (
      <LinearGradient
        colors={UltraColors.gradients.primary}
        style={cardStyles}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  if (blur) {
    return (
      <BlurView intensity={20} style={cardStyles}>
        {children}
      </BlurView>
    );
  }

  return <CardContent />;
});

// ULTRA-RESPONSIVE LOADING COMPONENT
interface UltraLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export const UltraLoading = memo<UltraLoadingProps>(({
  size = 'md',
  color = UltraColors.primary,
  text,
  overlay = false,
}) => {
  const [spinAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizes = {
    sm: 24,
    md: 40,
    lg: 60,
  };

  const LoadingContent = () => (
    <View style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.loadingSpinner,
          {
            width: sizes[size],
            height: sizes[size],
            transform: [{ rotate: spin }, { scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[color, `${color}80`]}
          style={styles.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      {text && (
        <Text style={[styles.loadingText, { color }]}>
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={styles.loadingOverlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <LoadingContent />
      </View>
    );
  }

  return <LoadingContent />;
});

// ULTRA-RESPONSIVE STYLES
const styles = StyleSheet.create({
  card: {
    backgroundColor: UltraColors.surface,
    borderRadius: UltraDimensions.radius.lg,
    padding: UltraDimensions.card.padding,
    minHeight: UltraDimensions.card.minHeight,
  },
  
  cardShadow: {
    shadowColor: UltraColors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: UltraDimensions.spacing.lg,
  },
  
  loadingSpinner: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  
  loadingGradient: {
    flex: 1,
    borderRadius: 9999,
  },
  
  loadingText: {
    marginTop: UltraDimensions.spacing.md,
    fontSize: UltraDimensions.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});

// ULTRA-RESPONSIVE HOOKS
export const useUltraAnimation = () => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  const fadeIn = useCallback((duration = 300) => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const slideUp = useCallback((duration = 300) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const scaleIn = useCallback((duration = 200) => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    fadeIn,
    slideUp,
    scaleIn,
  };
};

export const useUltraHaptics = () => {
  const light = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const medium = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const heavy = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const success = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const warning = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const error = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  return { light, medium, heavy, success, warning, error };
};
