import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF69B4", // MaathaCare Pink
        tabBarInactiveTintColor: "#888",
        headerShown: false,
        tabBarStyle: { 
          height: 65, 
          paddingBottom: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0'
        },
      }}
    >
      {/* 1. HOME (The Pregnancy Dashboard - Visible after login) */}
      <Tabs.Screen
        name="index" 
        options={{
          tabBarShowLabel: false,
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. EXPLORE (Visible after login) */}
      <Tabs.Screen
        name="explore"
        options={{
          tabBarShowLabel: false,
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={24} color={color} />
          ),
        }}
      />

        {/* 3. DOCUMENTS (Visible after login) */}
      <Tabs.Screen
        name="digitalLocker"
        options={{
          tabBarShowLabel: false,
          title: 'Documents',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="document-text" size={20} color={color} />
            </View>
          ),
        }}
      />

      {/* 4. PROFILE (Visible after login) */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarShowLabel: false,
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />



      {/* HIDE THE REST */}
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="phm-profile" options={{ href: null }} />
      <Tabs.Screen name="edit-mother-profile" options={{ href: null }} />
      <Tabs.Screen name="notification" options={{ href: null }} />
    </Tabs>
  );
}