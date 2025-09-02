import { useState, useCallback, useEffect } from 'react';
import { useUser } from './useUser';

interface UsageInfo {
  count: number;
  limit: number;
  resetAt: number;
  tier: 'free' | 'premium' | 'enterprise';
  blocked: boolean;
  blockReason?: string;
  dailySpend: number;
  monthlySpend: number;
  remaining: number;
  upgradeAvailable: boolean;
  // Separate tracking for different AI features
  identifyCount?: number;
  diagnoseCount?: number;
  chatCount?: number;
  identifyLimit?: number;
  diagnoseLimit?: number;
  chatLimit?: number;
}

interface UsageControlHook {
  usage: UsageInfo | null;
  isLoading: boolean;
  canUseFeature: (action: 'identify' | 'diagnose' | 'chat') => Promise<boolean>;
  trackUsage: (action: 'identify' | 'diagnose' | 'chat') => Promise<boolean>;
  refreshUsage: () => Promise<void>;
  getUpgradeMessage: () => string;
  getRemainingTime: () => string;
}

export const useUsageControl = (): UsageControlHook => {
  const { user, isPremium } = useUser();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getUserTier = useCallback((): 'free' | 'premium' | 'enterprise' => {
    if (isPremium) return 'premium';
    return 'free';
  }, [isPremium]);

  const makeUsageRequest = useCallback(async (action?: string, checkOnly = false) => {
    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'anonymous',
          'x-user-tier': getUserTier(),
        },
        body: JSON.stringify({ action, checkOnly }),
      });

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('[UsageControl] Non-JSON response received:', contentType);
        const text = await response.text();
        console.warn('[UsageControl] Response text:', text.substring(0, 200));
        return { 
          success: false, 
          data: { 
            error: 'invalid_response',
            message: 'Server returned invalid response format'
          }
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.warn('[UsageControl] API error:', data);
        return { success: false, data };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[UsageControl] Request failed:', error);
      return { 
        success: false, 
        data: { 
          error: 'network_error',
          message: 'Unable to check usage limits. Please try again.'
        }
      };
    }
  }, [user?.id, getUserTier]);

  const refreshUsage = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await makeUsageRequest(undefined, true);
      if (result.success && result.data.usage) {
        setUsage(result.data.usage);
      }
    } catch (error) {
      console.error('[UsageControl] Failed to refresh usage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [makeUsageRequest]);

  const canUseFeature = useCallback(async (action: 'identify' | 'diagnose' | 'chat'): Promise<boolean> => {
    const result = await makeUsageRequest(action, true);
    
    if (!result.success) {
      // If we can't check usage, be very restrictive for free users
      console.warn('[UsageControl] Cannot verify usage, being restrictive');
      const tier = getUserTier();
      if (tier === 'free') {
        // For free users, only allow 1 more request if we can't verify
        return (usage?.count || 0) < 1;
      }
      // For premium users, allow some usage but be cautious
      return (usage?.count || 0) < 10;
    }

    if (result.data.usage) {
      setUsage(result.data.usage);
    }

    // Check if blocked or if specific feature limit is reached
    const blocked = result.data.usage?.blocked || false;
    if (blocked) {
      console.log(`[UsageControl] Feature ${action} is blocked:`, result.data.usage?.blockReason);
      return false;
    }

    return true;
  }, [makeUsageRequest, getUserTier, usage?.count]);

  const trackUsage = useCallback(async (action: 'identify' | 'diagnose' | 'chat'): Promise<boolean> => {
    const result = await makeUsageRequest(action, false);
    
    if (!result.success) {
      console.error('[UsageControl] Failed to track usage:', result.data);
      return false;
    }

    if (result.data.usage) {
      setUsage(result.data.usage);
    }

    return result.success;
  }, [makeUsageRequest]);

  const getUpgradeMessage = useCallback((): string => {
    if (!usage) return 'Upgrade to Premium for 12x more daily scans!';
    
    const messages = {
      daily_limit_exceeded: `Daily limit of ${usage.limit} scans reached! Premium users get ${usage.tier === 'free' ? '25' : '100'} daily scans.`,
      daily_cost_limit_exceeded: 'Daily cost limit reached to protect your account. Premium users get 20x higher limits!',
      monthly_cost_limit_exceeded: 'Monthly cost limit reached. Premium users get unlimited monthly usage!',
      rate_limit_cooldown: 'Please wait between requests. Premium users get faster processing!',
      identify_limit_exceeded: `Plant identification limit reached (${usage.identifyLimit}/day). Premium gets 25 daily identifications!`,
      diagnose_limit_exceeded: `Plant diagnosis limit reached (${usage.diagnoseLimit}/day). Premium gets 25 daily diagnoses!`,
      chat_limit_exceeded: `AI chat limit reached (${usage.chatLimit}/day). Premium gets 50 daily chat messages!`,
    };

    return messages[usage.blockReason as keyof typeof messages] || 
           `Upgrade to Premium for ${usage.tier === 'free' ? '12x' : '4x'} more daily plant AI features!`;
  }, [usage]);

  const getRemainingTime = useCallback((): string => {
    if (!usage?.resetAt) return '';
    
    const now = Date.now();
    const remaining = usage.resetAt - now;
    
    if (remaining <= 0) return 'Limits reset!';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Resets in ${hours}h ${minutes}m`;
    }
    return `Resets in ${minutes}m`;
  }, [usage?.resetAt]);

  // Auto-refresh usage on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshUsage();
    }
  }, [user, refreshUsage]);

  return {
    usage,
    isLoading,
    canUseFeature,
    trackUsage,
    refreshUsage,
    getUpgradeMessage,
    getRemainingTime,
  };
};