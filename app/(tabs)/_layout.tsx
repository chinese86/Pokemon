import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pokédex',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="entrenadores"
        options={{
          title: 'Entrenadores',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.3.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="equipos"
        options={{
          title: 'Equipos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="square.stack.3d.up.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
  name="mapa"
  options={{
    title: 'Mapa',
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="map.fill" color={color} />
    ),
  }}
/>
    </Tabs>
  );
}
