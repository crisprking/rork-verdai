import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/hooks/useUser';
import Colors from '@/constants/colors';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login, signup } = useUser();

  const handleSubmit = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters long');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      if (isLogin) {
        success = await login(email.trim(), password);
      } else {
        success = await signup(email.trim(), password, name.trim());
      }

      if (success) {
        Alert.alert(
          'Success!', 
          isLogin ? 'Welcome back to PlantAI!' : 'Welcome to PlantAI! Your account has been created.',
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert(
          'Authentication Issue',
          isLogin 
            ? 'We\'re having trouble signing you in. Please check your credentials and try again.' 
            : 'We couldn\'t create your account right now. Please try again with a different email or check your connection.'
        );
      }
    } catch (error) {
      console.error('[Auth] Submit error:', error);
      Alert.alert(
        'Connection Issue', 
        'We\'re having trouble connecting to our servers. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Keep email but clear password and name for better UX
    setPassword('');
    setName('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.light.luxuryGradientStart, Colors.light.luxuryGradientEnd]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Leaf color={Colors.light.luxuryCard} size={32} />
          </View>
          <Text style={styles.title}>PlantAI</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back to your plant journey' : 'Start your plant care journey'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <User color={Colors.light.luxuryTextSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.light.luxuryTextSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  testID="name-input"
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Mail color={Colors.light.luxuryTextSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.light.luxuryTextSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="email-input"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Lock color={Colors.light.luxuryTextSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.light.luxuryTextSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="password-input"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              testID="submit-button"
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.light.luxuryCard} size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                  <ArrowRight color={Colors.light.luxuryCard} size={20} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              testID="toggle-mode-button"
            >
              <Text style={styles.toggleButtonText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.toggleButtonTextBold}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.luxuryCard,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.light.luxuryBackground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
  },
  form: {
    paddingHorizontal: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.luxuryCard,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.luxuryText,
    marginLeft: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.luxuryPrimary,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.luxuryCard,
    marginRight: 8,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggleButtonText: {
    fontSize: 16,
    color: Colors.light.luxuryTextSecondary,
  },
  toggleButtonTextBold: {
    fontWeight: '600',
    color: Colors.light.luxuryPrimary,
  },
});