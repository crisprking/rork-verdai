export const config = { runtime: 'edge' };

// Enhanced usage tracking with premium tiers and strict limits
interface UsageData {
  count: number;
  resetAt: number;
  tier: 'free' | 'premium' | 'enterprise';
  lastAction: number;
  dailySpend: number; // Track API costs
  monthlySpend: number;
  blocked: boolean;
  blockReason?: string;
  // Feature-specific tracking
  identifyCount: number;
  diagnoseCount: number;
  chatCount: number;
}



// Ultra-strict usage limits to maximize profitability and prevent abuse
// Separate limits for each AI feature to prevent any single feature abuse
interface FeatureLimits {
  identify: number;  // Plant identification requests
  diagnose: number;  // Plant health diagnosis requests
  chat: number;      // AI chat messages
}

interface UsageLimits {
  daily: number;
  monthly: number;
  dailyCost: number; // Max daily API cost in USD
  monthlyCost: number; // Max monthly API cost in USD
  rateLimit: number; // Requests per minute
  features: FeatureLimits; // Per-feature limits
}

const USAGE_LIMITS: Record<string, UsageLimits> = {
  free: {
    daily: 10, // 10 total AI requests per day - reasonable trial
    monthly: 50, // 50 per month max - reasonable trial
    dailyCost: 1.00, // $1.00 daily API cost limit
    monthlyCost: 10.00, // $10.00 monthly API cost limit
    rateLimit: 3, // 3 requests per minute - reasonable for trial
    features: {
      identify: 5,   // 5 plant identifications per day
      diagnose: 5,   // 5 plant diagnoses per day  
      chat: 15,      // 15 chat messages per day
    }
  },
  premium: {
    daily: 100, // 100 total requests per day for premium - generous for paying users
    monthly: 1000, // 1000 per month - generous usage
    dailyCost: 15.00, // $15 daily API cost limit - profitable margin
    monthlyCost: 150.00, // $150 monthly API cost limit - good profit margin
    rateLimit: 10, // 10 requests per minute - fast for paying users
    features: {
      identify: 50,  // 50 plant identifications per day
      diagnose: 50,  // 50 plant diagnoses per day
      chat: 100,     // 100 chat messages per day
    }
  },
  enterprise: {
    daily: 100, // 100 requests per day for enterprise - high value tier
    monthly: 1000, // 1000 per month - enterprise level
    dailyCost: 25.00, // $25 daily API cost limit - enterprise pricing
    monthlyCost: 250.00, // $250 monthly API cost limit - high margin
    rateLimit: 15, // 15 requests per minute - enterprise speed
    features: {
      identify: 100, // 100 plant identifications per day
      diagnose: 100, // 100 plant diagnoses per day
      chat: 200,     // 200 chat messages per day
    }
  },
};

// Optimized API cost estimates for profitability
const API_COSTS = {
  identify: 0.06, // $0.06 per plant identification (optimized)
  diagnose: 0.08, // $0.08 per plant diagnosis (optimized)
  chat: 0.03, // $0.03 per chat message (optimized)
  image_analysis: 0.10, // $0.10 per image analysis (optimized)
};

const memory: { 
  counts: Record<string, UsageData>;
  rateLimits: Record<string, { count: number; resetAt: number }>;
} = {
  counts: {},
  rateLimits: {},
};

function getKey(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anon';
  const user = req.headers.get('x-user-id') || 'guest';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Create a more unique fingerprint to prevent abuse
  const fingerprint = `${user}:${ip}:${userAgent.slice(0, 50)}`;
  return fingerprint;
}

function getUserTier(req: Request): 'free' | 'premium' | 'enterprise' {
  const tier = req.headers.get('x-user-tier') || 'free';
  return tier as 'free' | 'premium' | 'enterprise';
}

function checkRateLimit(key: string, tier: string): boolean {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const limit = USAGE_LIMITS[tier].rateLimit;
  
  const current = memory.rateLimits[key];
  if (!current || now > current.resetAt) {
    memory.rateLimits[key] = { count: 1, resetAt: now + oneMinute };
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count += 1;
  return true;
}

function getLimitInfo(key: string, tier: 'free' | 'premium' | 'enterprise'): UsageData {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneMonth = 30 * oneDay;
  
  const current = memory.counts[key];
  if (!current || now > current.resetAt) {
    memory.counts[key] = {
      count: 0,
      resetAt: now + oneDay,
      tier,
      lastAction: now,
      dailySpend: 0,
      monthlySpend: current?.monthlySpend || 0,
      blocked: false,
      // Initialize feature-specific counters
      identifyCount: 0,
      diagnoseCount: 0,
      chatCount: 0,
    };
    
    // Reset monthly spend if it's been more than 30 days
    if (!current || now > (current.resetAt + oneMonth)) {
      memory.counts[key].monthlySpend = 0;
    }
  }
  
  return memory.counts[key];
}

function calculateCost(action: string): number {
  return API_COSTS[action as keyof typeof API_COSTS] || 0.01;
}

function isBlocked(usage: UsageData, limits: UsageLimits, action: string): { blocked: boolean; reason?: string } {
  const cost = calculateCost(action);
  
  // Check feature-specific limits first (most restrictive)
  if (action === 'identify' && usage.identifyCount >= limits.features.identify) {
    return { blocked: true, reason: 'identify_limit_exceeded' };
  }
  if (action === 'diagnose' && usage.diagnoseCount >= limits.features.diagnose) {
    return { blocked: true, reason: 'diagnose_limit_exceeded' };
  }
  if (action === 'chat' && usage.chatCount >= limits.features.chat) {
    return { blocked: true, reason: 'chat_limit_exceeded' };
  }
  
  // Check overall daily limits
  if (usage.count >= limits.daily) {
    return { blocked: true, reason: 'daily_limit_exceeded' };
  }
  
  // Check daily cost limits
  if (usage.dailySpend + cost > limits.dailyCost) {
    return { blocked: true, reason: 'daily_cost_limit_exceeded' };
  }
  
  // Check monthly cost limits
  if (usage.monthlySpend + cost > limits.monthlyCost) {
    return { blocked: true, reason: 'monthly_cost_limit_exceeded' };
  }
  
  // Check for suspicious activity (too many requests in short time)
  const now = Date.now();
  if (now - usage.lastAction < 10000 && usage.tier === 'free') { // 10 second cooldown for free users
    return { blocked: true, reason: 'rate_limit_cooldown' };
  }
  if (now - usage.lastAction < 3000 && usage.tier === 'premium') { // 3 second cooldown for premium
    return { blocked: true, reason: 'rate_limit_cooldown' };
  }
  if (now - usage.lastAction < 1000 && usage.tier === 'enterprise') { // 1 second cooldown for enterprise
    return { blocked: true, reason: 'rate_limit_cooldown' };
  }
  
  return { blocked: false };
}

export default async function handler(req: Request) {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-user-id, x-user-tier',
        },
      });
    }
    
    const key = getKey(req);
    const tier = getUserTier(req);
    let body: { action?: string; checkOnly?: boolean } = {};
    try {
      const text = await req.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (error) {
      console.warn('[Usage] Failed to parse request body:', error);
      body = {};
    }
    
    const action = body.action || 'unknown';
    const limits = USAGE_LIMITS[tier];
    const usage = getLimitInfo(key, tier);
    
    // Check rate limiting first
    if (!checkRateLimit(key, tier)) {
      return json({
        ok: false,
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please wait before trying again.',
        usage: {
          count: usage.count,
          limit: limits.daily,
          resetAt: usage.resetAt,
          tier,
          blocked: true,
          blockReason: 'rate_limit_exceeded'
        }
      }, 429);
    }
    
    // Check if action should be blocked
    const blockCheck = isBlocked(usage, limits, action);
    if (blockCheck.blocked && !body.checkOnly) {
      usage.blocked = true;
      usage.blockReason = blockCheck.reason;
      
      const messages = {
        daily_limit_exceeded: 'Daily usage limit reached. Upgrade to Premium for more scans.',
        daily_cost_limit_exceeded: 'Daily cost limit reached. Upgrade to Premium for higher limits.',
        monthly_cost_limit_exceeded: 'Monthly cost limit reached. Please upgrade your plan.',
        rate_limit_cooldown: 'Please wait a few seconds between requests.',
      };
      
      return json({
        ok: false,
        error: blockCheck.reason,
        message: messages[blockCheck.reason as keyof typeof messages] || 'Usage limit exceeded',
        usage: {
          count: usage.count,
          limit: limits.daily,
          resetAt: usage.resetAt,
          tier,
          blocked: true,
          blockReason: blockCheck.reason,
          upgradeRequired: tier === 'free'
        }
      }, 403);
    }
    
    // If not just checking, increment usage and costs
    if (!body.checkOnly && (action === 'identify' || action === 'diagnose' || action === 'chat')) {
      const cost = calculateCost(action);
      usage.count += 1;
      usage.dailySpend += cost;
      usage.monthlySpend += cost;
      usage.lastAction = Date.now();
      usage.blocked = false;
      usage.blockReason = undefined;
      
      // Increment feature-specific counters
      if (action === 'identify') {
        usage.identifyCount += 1;
      } else if (action === 'diagnose') {
        usage.diagnoseCount += 1;
      } else if (action === 'chat') {
        usage.chatCount += 1;
      }
      
      const featureCount = action === 'identify' ? usage.identifyCount : 
                          action === 'diagnose' ? usage.diagnoseCount : 
                          action === 'chat' ? usage.chatCount : 0;
      const featureLimit = limits.features[action as keyof FeatureLimits];
      
      console.log(`[Usage] ${tier} user ${key.slice(0, 20)}... used ${action} (${usage.count}/${limits.daily}, ${action}: ${featureCount}/${featureLimit}, cost: ${usage.dailySpend.toFixed(2)})`);
    }
    
    return json({
      ok: true,
      usage: {
        count: usage.count,
        limit: limits.daily,
        resetAt: usage.resetAt,
        tier,
        blocked: usage.blocked || false,
        blockReason: usage.blockReason,
        dailySpend: usage.dailySpend,
        monthlySpend: usage.monthlySpend,
        remaining: Math.max(0, limits.daily - usage.count),
        upgradeAvailable: tier === 'free',
        // Feature-specific data
        identifyCount: usage.identifyCount,
        diagnoseCount: usage.diagnoseCount,
        chatCount: usage.chatCount,
        identifyLimit: limits.features.identify,
        diagnoseLimit: limits.features.diagnose,
        chatLimit: limits.features.chat,
      }
    });
    
  } catch (e) {
    console.error('[Usage] Error:', e);
    return json({ 
      ok: false, 
      error: 'usage_error',
      message: 'Unable to process usage request'
    }, 500);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id, x-user-tier',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
