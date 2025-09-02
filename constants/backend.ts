import { Platform } from 'react-native';

export interface UsagePayload {
  action: 'identify' | 'diagnose' | 'care_tips' | 'auth_login' | 'auth_signup';
  size?: number;
  meta?: Record<string, unknown>;
}

export interface IdentificationRecord {
  name: string;
  scientific: string;
  confidence: number;
  timestamp: number;
}

export interface AuthResponse {
  token: string;
  userId: string;
}

const API_BASE = Platform.select({ 
  web: typeof window !== 'undefined' ? window.location.origin : '', 
  default: '' 
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${path}`;
  console.log('[backend] request', url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await safeText(res);
      console.warn('[backend] Non-JSON response:', text.substring(0, 200));
      throw new Error(`Server returned HTML instead of JSON: ${res.status}`);
    }
    
    if (!res.ok) {
      const text = await safeText(res);
      throw new Error(`Backend ${res.status} ${res.statusText} - ${text}`);
    }
    
    return (await res.json()) as T;
  } catch (error) {
    console.error('[backend] Request failed:', error);
    throw error;
  }
}

export const backend = {
  async trackUsage(payload: UsagePayload): Promise<{ ok: true }> {
    try {
      await request<{ ok: true }>('/usage', { body: JSON.stringify(payload) });
      return { ok: true };
    } catch (e) {
      console.log('[backend] trackUsage failed', e);
      return { ok: true };
    }
  },

  async recordIdentification(record: IdentificationRecord): Promise<{ ok: true }> {
    try {
      await request<{ ok: true }>('/identifications', { body: JSON.stringify(record) });
      return { ok: true };
    } catch (e) {
      console.log('[backend] recordIdentification failed', e);
      return { ok: true };
    }
  },

  async getCareTips(query: { plant?: string }): Promise<{ tips: string[] }> {
    try {
      return await request<{ tips: string[] }>('/care-tips', { body: JSON.stringify(query) });
    } catch (e) {
      console.log('[backend] getCareTips failed', e);
      return { tips: [
        'Water when the top 2-3cm of soil is dry.',
        'Provide bright, indirect light.',
        'Ensure pot has drainage to prevent root rot.',
      ] };
    }
  },

  async signup(email: string, password: string): Promise<AuthResponse> {
    return await request<AuthResponse>('/auth/signup', { body: JSON.stringify({ email, password }) });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return await request<AuthResponse>('/auth/login', { body: JSON.stringify({ email, password }) });
  },
};

async function safeText(res: Response) { try { return await res.text(); } catch { return ''; } }
