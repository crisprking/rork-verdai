import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Supabase Configuration - Replace with your actual credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Table names
const TABLES = {
  USERS: 'users',
  PLANTS: 'plants',
  USER_PLANTS: 'user_plants',
  PLANT_CARE_LOGS: 'plant_care_logs',
  DIAGNOSES: 'diagnoses',
  IDENTIFICATIONS: 'identifications',
  CARE_SCHEDULES: 'care_schedules',
  PLANT_NOTES: 'plant_notes'
};

class SupabaseService {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Supabase client
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('Supabase already initialized');
        return true;
      }

      // Create Supabase client with AsyncStorage for auth persistence
      this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });

      // Check for existing session
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        this.currentUser = session.user;
        console.log('Existing session found:', session.user.email);
      }

      // Set up auth state listener
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        this.currentUser = session?.user || null;
        
        if (event === 'SIGNED_IN') {
          this.onUserSignedIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.onUserSignedOut();
        }
      });

      this.isInitialized = true;
      console.log('Supabase initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      return false;
    }
  }

  /**
   * Sign up new user
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          ...metadata
        });
      }

      return { success: true, user: data.user };

    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      return { success: true, user: data.user };

    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      return { success: true };

    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Create user profile
   */
  async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.USERS)
        .insert([{
          id: userId,
          ...profileData,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', this.currentUser.id);

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save plant identification
   */
  async saveIdentification(plantData, imageUrl) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.IDENTIFICATIONS)
        .insert([{
          user_id: this.currentUser.id,
          plant_name: plantData.plantName,
          common_name: plantData.commonName,
          confidence: plantData.confidence,
          image_url: imageUrl,
          metadata: plantData,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };

    } catch (error) {
      console.error('Error saving identification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add plant to user's collection
   */
  async addPlantToCollection(plantData) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.USER_PLANTS)
        .insert([{
          user_id: this.currentUser.id,
          plant_name: plantData.plantName,
          common_name: plantData.commonName,
          nickname: plantData.nickname || '',
          image_url: plantData.imageUrl,
          care_level: plantData.careLevel,
          light_requirement: plantData.lightRequirement,
          water_frequency: plantData.waterFrequency,
          last_watered: null,
          next_watering: plantData.nextWatering,
          metadata: plantData,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };

    } catch (error) {
      console.error('Error adding plant to collection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's plants
   */
  async getUserPlants() {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.USER_PLANTS)
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error fetching user plants:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update plant care log
   */
  async logPlantCare(plantId, careType, notes = '') {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.PLANT_CARE_LOGS)
        .insert([{
          user_id: this.currentUser.id,
          plant_id: plantId,
          care_type: careType, // 'watering', 'fertilizing', 'pruning', etc.
          notes: notes,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Update last care date for the plant
      if (careType === 'watering') {
        await this.updatePlantWatering(plantId);
      }

      return { success: true, data };

    } catch (error) {
      console.error('Error logging plant care:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update plant watering dates
   */
  async updatePlantWatering(plantId) {
    try {
      const nextWatering = new Date();
      nextWatering.setDate(nextWatering.getDate() + 7); // Default 7 days

      const { data, error } = await this.supabase
        .from(TABLES.USER_PLANTS)
        .update({
          last_watered: new Date().toISOString(),
          next_watering: nextWatering.toISOString()
        })
        .eq('id', plantId)
        .eq('user_id', this.currentUser.id);

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error updating plant watering:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save diagnosis result
   */
  async saveDiagnosis(plantId, diagnosisData, imageUrl) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.DIAGNOSES)
        .insert([{
          user_id: this.currentUser.id,
          plant_id: plantId,
          health_score: diagnosisData.healthScore,
          issues: diagnosisData.issues,
          recommendations: diagnosisData.recommendations,
          image_url: imageUrl,
          metadata: diagnosisData,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };

    } catch (error) {
      console.error('Error saving diagnosis:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get plant care history
   */
  async getPlantCareHistory(plantId) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.PLANT_CARE_LOGS)
        .select('*')
        .eq('plant_id', plantId)
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error fetching care history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create care schedule
   */
  async createCareSchedule(plantId, scheduleData) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.CARE_SCHEDULES)
        .insert([{
          user_id: this.currentUser.id,
          plant_id: plantId,
          water_frequency_days: scheduleData.waterFrequency,
          fertilize_frequency_days: scheduleData.fertilizeFrequency,
          prune_frequency_days: scheduleData.pruneFrequency,
          reminder_enabled: scheduleData.reminderEnabled || true,
          reminder_time: scheduleData.reminderTime || '09:00',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };

    } catch (error) {
      console.error('Error creating care schedule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add plant note
   */
  async addPlantNote(plantId, note, imageUrl = null) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await this.supabase
        .from(TABLES.PLANT_NOTES)
        .insert([{
          user_id: this.currentUser.id,
          plant_id: plantId,
          note: note,
          image_url: imageUrl,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };

    } catch (error) {
      console.error('Error adding plant note:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload image to storage
   */
  async uploadImage(imageUri, bucket = 'plant-images') {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename
      const fileName = `${this.currentUser.id}/${Date.now()}.jpg`;

      // Upload to Supabase storage
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };

    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get plants needing care
   */
  async getPlantsNeedingCare() {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const today = new Date().toISOString();

      const { data, error } = await this.supabase
        .from(TABLES.USER_PLANTS)
        .select('*')
        .eq('user_id', this.currentUser.id)
        .lte('next_watering', today)
        .order('next_watering', { ascending: true });

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error fetching plants needing care:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search plant database
   */
  async searchPlants(query) {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.PLANTS)
        .select('*')
        .or(`plant_name.ilike.%${query}%,common_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return { success: true, data };

    } catch (error) {
      console.error('Error searching plants:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      // Get plant count
      const { count: plantCount } = await this.supabase
        .from(TABLES.USER_PLANTS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.currentUser.id);

      // Get identification count
      const { count: scanCount } = await this.supabase
        .from(TABLES.IDENTIFICATIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.currentUser.id);

      // Get care log count
      const { count: careCount } = await this.supabase
        .from(TABLES.PLANT_CARE_LOGS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.currentUser.id);

      return {
        success: true,
        stats: {
          plantCount,
          scanCount,
          careCount,
          userSince: this.currentUser.created_at
        }
      };

    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete plant from collection
   */
  async deletePlant(plantId) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { error } = await this.supabase
        .from(TABLES.USER_PLANTS)
        .delete()
        .eq('id', plantId)
        .eq('user_id', this.currentUser.id);

      if (error) throw error;
      return { success: true };

    } catch (error) {
      console.error('Error deleting plant:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle user signed in
   */
  async onUserSignedIn(user) {
    console.log('User signed in:', user.email);
    // Additional actions on sign in
    await AsyncStorage.setItem('userId', user.id);
  }

  /**
   * Handle user signed out
   */
  async onUserSignedOut() {
    console.log('User signed out');
    // Clean up local storage
    await AsyncStorage.removeItem('userId');
  }

  /**
   * Subscribe to real-time changes
   */
  subscribeToPlantUpdates(callback) {
    if (!this.currentUser) return null;

    const subscription = this.supabase
      .channel('plant-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.USER_PLANTS,
          filter: `user_id=eq.${this.currentUser.id}`
        },
        (payload) => {
          console.log('Plant update:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Unsubscribe from real-time changes
   */
  unsubscribe(subscription) {
    if (subscription) {
      this.supabase.removeChannel(subscription);
    }
  }
}

// Export singleton instance
export default new SupabaseService();
export { TABLES };
