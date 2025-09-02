import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, RefreshCw, Leaf } from 'lucide-react-native';
import { LuxuryColors, ThemeConfig } from '@/constants/colors';

interface State { 
  hasError: boolean; 
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  state: State = { 
    hasError: false, 
    retryCount: 0 
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Enhanced error logging for production debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    };
    
    console.error('[ErrorBoundary] Application Error:', errorDetails);
    
    // In production, you would send this to your error reporting service
    if (!__DEV__) {
      // Example: Sentry.captureException(error, { extra: errorDetails });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    // Prevent infinite retry loops
    if (newRetryCount > 3) {
      console.warn('[ErrorBoundary] Max retry attempts reached');
      return;
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: newRetryCount 
    });

    // Add a small delay to prevent immediate re-error
    this.retryTimeoutId = setTimeout(() => {
      // Force a re-render
      this.forceUpdate();
    }, 100) as ReturnType<typeof setTimeout>;
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Default luxury error UI
      return (
        <View style={styles.container} testID="errorBoundary">
          <LinearGradient
            colors={[LuxuryColors.PRIMARY, LuxuryColors.SECONDARY]}
            style={styles.backgroundGradient}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <AlertTriangle color={LuxuryColors.GOLD} size={32} strokeWidth={2} />
                </View>
                <View style={styles.leafAccent}>
                  <Leaf color={LuxuryColors.GOLD} size={16} />
                </View>
              </View>
              
              <Text style={styles.title}>Oops! Something Went Wrong</Text>
              <Text style={styles.subtitle}>
                We encountered an unexpected issue. Don&apos;t worry - your plant data is safe.
              </Text>
              
              {__DEV__ && this.state.error && (
                <View style={styles.debugInfo}>
                  <Text style={styles.debugTitle}>Debug Info:</Text>
                  <Text style={styles.debugText} numberOfLines={3}>
                    {this.state.error.message}
                  </Text>
                </View>
              )}
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={this.handleRetry}
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw 
                    color={LuxuryColors.CARD} 
                    size={20} 
                    strokeWidth={2}
                  />
                  <Text style={styles.retryButtonText}>
                    {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.supportText}>
                  If the problem persists, please contact our support team.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      );
    }
    
    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: ThemeConfig.spacing.xxxl,
    maxWidth: 400,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: ThemeConfig.spacing.xxxl,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  leafAccent: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: ThemeConfig.typography.fontSizes.xxxl,
    fontWeight: ThemeConfig.typography.fontWeights.bold as any,
    color: LuxuryColors.CARD,
    marginBottom: ThemeConfig.spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: ThemeConfig.spacing.xxxl,
    fontWeight: ThemeConfig.typography.fontWeights.regular as any,
  },
  debugInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: ThemeConfig.borderRadius.medium,
    padding: ThemeConfig.spacing.lg,
    marginBottom: ThemeConfig.spacing.xl,
    width: '100%',
  },
  debugTitle: {
    fontSize: ThemeConfig.typography.fontSizes.sm,
    fontWeight: ThemeConfig.typography.fontWeights.semibold as any,
    color: LuxuryColors.GOLD,
    marginBottom: ThemeConfig.spacing.sm,
  },
  debugText: {
    fontSize: ThemeConfig.typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    alignItems: 'center',
    width: '100%',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: ThemeConfig.spacing.xxxl,
    paddingVertical: ThemeConfig.spacing.lg,
    borderRadius: ThemeConfig.borderRadius.large,
    marginBottom: ThemeConfig.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: ThemeConfig.spacing.sm,
  },
  retryButtonText: {
    fontSize: ThemeConfig.typography.fontSizes.lg,
    fontWeight: ThemeConfig.typography.fontWeights.semibold as any,
    color: LuxuryColors.CARD,
    letterSpacing: 0.3,
  },
  supportText: {
    fontSize: ThemeConfig.typography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

// Export a higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
