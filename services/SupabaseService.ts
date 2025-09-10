import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for our database schema
export interface PlantIdentification {
  id: string;
  user_id: string;
  plant_name: string;
  scientific_name: string;
  confidence_score: number;
  image_url: string;
  created_at: string;
}

export interface HealthDiagnosis {
  id: string;
  user_id: string;
  plant_id?: string;
  diagnosis: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  image_url: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

class SupabaseService {
  private static instance: SupabaseService;
  private supabase: SupabaseClient;

  constructor() {
    // Replace with your actual Supabase URL and anon key
    const supabaseUrl = 'https://your-project.supabase.co';
    const supabaseAnonKey = 'your-anon-key';
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Authentication methods
  async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Supabase signUp error:', error);
      return { success: false, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Supabase signIn error:', error);
      return { success: false, error };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Supabase signOut error:', error);
      return { success: false, error };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('❌ Supabase getCurrentUser error:', error);
      return null;
    }
  }

  // Plant identification methods
  async savePlantIdentification(identification: Omit<PlantIdentification, 'id' | 'created_at'>) {
    try {
      const { data, error } = await this.supabase
        .from('plant_identifications')
        .insert([identification])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Supabase savePlantIdentification error:', error);
      return { success: false, error };
    }
  }

  async getUserPlantIdentifications(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('plant_identifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Supabase getUserPlantIdentifications error:', error);
      return { success: false, error };
    }
  }

  // Health diagnosis methods
  async saveHealthDiagnosis(diagnosis: Omit<HealthDiagnosis, 'id' | 'created_at'>) {
    try {
      const { data, error } = await this.supabase
        .from('health_diagnoses')
        .insert([diagnosis])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Supabase saveHealthDiagnosis error:', error);
      return { success: false, error };
    }
  }

  async getUserHealthDiagnoses(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('health_diagnoses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Supabase getUserHealthDiagnoses error:', error);
      return { success: false, error };
    }
  }

  // User profile methods
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Supabase updateUserProfile error:', error);
      return { success: false, error };
    }
  }

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Supabase getUserProfile error:', error);
      return { success: false, error };
    }
  }

  // File upload methods
  async uploadImage(file: File | Blob, bucket: string, path: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { success: true, data, publicUrl: urlData.publicUrl };
    } catch (error) {
      console.error('❌ Supabase uploadImage error:', error);
      return { success: false, error };
    }
  }
}

export default SupabaseService;
