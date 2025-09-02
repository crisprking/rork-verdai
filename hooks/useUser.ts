import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  dailyScans: number;
  lastScanDate: string;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setPremium: (premium: boolean) => void;
  incrementScans: () => void;
  resetDailyScans: () => void;
}

export const [UserProvider, useUser] = createContextHook<UserState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [dailyScans, setDailyScans] = useState<number>(0);
  const [lastScanDate, setLastScanDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await AsyncStorage.getItem('user');
        const premium = await AsyncStorage.getItem('isPremium');
        const scans = await AsyncStorage.getItem('dailyScans');
        const date = await AsyncStorage.getItem('lastScanDate');

        if (userData) setUser(JSON.parse(userData));
        if (premium !== null) setIsPremium(JSON.parse(premium));
        if (scans !== null) setDailyScans(parseInt(scans));
        if (date !== null) setLastScanDate(date);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[Auth] Attempting login for:', email);
      
      // Enhanced validation
      if (!email.includes('@') || password.length < 6) {
        console.error('[Auth] Invalid email or password format');
        return false;
      }
      
      const cleanEmail = email.toLowerCase().trim();
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        
        // Check if response is HTML (error page)
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
          console.error('[Auth] Received non-JSON response:', contentType);
          throw new Error('Backend returned HTML instead of JSON');
        }
        
        console.log('[Auth] Login response status:', response.status);
        
        let data;
        try {
          const text = await response.text();
          console.log('[Auth] Login response text:', text.substring(0, 200));
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('[Auth] Failed to parse response as JSON:', parseError);
          throw new Error('Invalid JSON response from backend');
        }
        
        if (response.ok && data.token) {
          const newUser: User = { 
            id: data.userId, 
            email: cleanEmail,
            name: data.name || cleanEmail.split('@')[0]
          };
          setUser(newUser);
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          await AsyncStorage.setItem('authToken', data.token);
          console.log('[Auth] Login successful for:', newUser.name);
          return true;
        } else {
          console.error('[Auth] Login failed:', data.error || 'Unknown error');
          return false;
        }
      } catch (fetchError) {
        console.log('[Auth] Backend login failed, using offline mode:', fetchError);
        
        // Fallback: Check if user exists in local storage
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.email === cleanEmail) {
            setUser(userData);
            console.log('[Auth] Offline login successful for:', userData.name);
            return true;
          }
        }
        
        // If no stored user matches, create a demo user for development
        const demoUser: User = {
          id: cleanEmail,
          email: cleanEmail,
          name: cleanEmail.split('@')[0]
        };
        setUser(demoUser);
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        await AsyncStorage.setItem('authToken', 'demo-token-' + Date.now());
        console.log('[Auth] Demo login successful for:', demoUser.name);
        return true;
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      console.log('[Auth] Attempting signup for:', email);
      
      // Enhanced validation
      if (!email.includes('@') || password.length < 6) {
        console.error('[Auth] Invalid email or password format');
        return false;
      }
      
      const cleanEmail = email.toLowerCase().trim();
      const displayName = name?.trim() || cleanEmail.split('@')[0];
      
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            email: cleanEmail, 
            password, 
            name: displayName 
          }),
        });
        
        // Check if response is HTML (error page)
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
          console.error('[Auth] Received non-JSON response:', contentType);
          throw new Error('Backend returned HTML instead of JSON');
        }
        
        console.log('[Auth] Signup response status:', response.status);
        
        let data;
        try {
          const text = await response.text();
          console.log('[Auth] Signup response text:', text.substring(0, 200));
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('[Auth] Failed to parse response as JSON:', parseError);
          throw new Error('Invalid JSON response from backend');
        }
        
        if (response.ok && data.token) {
          const newUser: User = { 
            id: data.userId, 
            email: cleanEmail, 
            name: data.name || displayName 
          };
          setUser(newUser);
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          await AsyncStorage.setItem('authToken', data.token);
          console.log('[Auth] Signup successful for:', newUser.name);
          return true;
        } else {
          console.error('[Auth] Signup failed:', data.error || 'Unknown error');
          return false;
        }
      } catch (fetchError) {
        console.log('[Auth] Backend signup failed, using offline mode:', fetchError);
        
        // Fallback: Create user locally
        const newUser: User = {
          id: cleanEmail,
          email: cleanEmail,
          name: displayName
        };
        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem('authToken', 'demo-token-' + Date.now());
        console.log('[Auth] Offline signup successful for:', newUser.name);
        return true;
      }
    } catch (error) {
      console.error('[Auth] Signup error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setUser(null);
      setIsPremium(false);
      setDailyScans(0);
      setLastScanDate('');
      await AsyncStorage.multiRemove(['user', 'authToken', 'isPremium', 'dailyScans', 'lastScanDate']);
      console.log('Logout successful - all data cleared');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const setPremium = useCallback(async (premium: boolean) => {
    setIsPremium(premium);
    await AsyncStorage.setItem('isPremium', JSON.stringify(premium));
    console.log('Premium status updated:', premium);
  }, []);

  const incrementScans = useCallback(async () => {
    const today = new Date().toDateString();
    if (lastScanDate !== today) {
      setDailyScans(1);
      setLastScanDate(today);
      await AsyncStorage.setItem('dailyScans', '1');
      await AsyncStorage.setItem('lastScanDate', today);
    } else {
      const newScans = dailyScans + 1;
      setDailyScans(newScans);
      await AsyncStorage.setItem('dailyScans', newScans.toString());
    }
  }, [dailyScans, lastScanDate]);

  const resetDailyScans = useCallback(async () => {
    setDailyScans(0);
    await AsyncStorage.setItem('dailyScans', '0');
  }, []);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isPremium,
    dailyScans,
    lastScanDate,
    isLoading,
    login,
    signup,
    logout,
    setPremium,
    incrementScans,
    resetDailyScans,
  }), [user, isPremium, dailyScans, lastScanDate, isLoading, login, signup, logout, setPremium, incrementScans, resetDailyScans]);
});