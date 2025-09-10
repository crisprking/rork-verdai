import { Tabs, Redirect } from "expo-router";
import { MessageCircle, Search, Stethoscope, Heart, Crown, Notebook } from "lucide-react-native";
import React from "react";
import { Platform, ActivityIndicator, View } from 'react-native';
import { useUser } from '@/hooks/useUser';

import Colors from "@/constants/colors";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.luxuryBackground }}>
        <ActivityIndicator size="large" color={Colors.light.luxuryPrimary} />
      </View>
    );
  }

  // Allow access to core features without authentication (Apple App Store compliance)
  // Authentication is optional for premium features only

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.luxuryPrimary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.95)' : Colors.light.luxuryCard,
          borderTopWidth: 0,
          shadowColor: Colors.light.luxuryPrimary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 72,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="identify"
        options={{
          title: "Identify",
          tabBarIcon: ({ color, focused }) => (
            <Search 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diagnose"
        options={{
          title: "Health",
          tabBarIcon: ({ color, focused }) => (
            <Stethoscope 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: "Care",
          tabBarIcon: ({ color, focused }) => (
            <Heart 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="passport"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <Notebook 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: "Premium",
          tabBarIcon: ({ color, focused }) => (
            <Crown 
              color={focused ? Colors.light.luxuryGold : color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}