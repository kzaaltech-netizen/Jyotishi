import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import ChartsScreen from '../screens/ChartsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab: '🏠',
  ChartsTab: '🔮',
  ReportsTab: '📜',
  ProfileTab: '👤',
  SettingsTab: '⚙️',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 18, color: focused ? colors.primary : colors.textMuted }}>
            {TAB_ICONS[route.name] || '✦'}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ChartsTab" component={ChartsScreen} options={{ tabBarLabel: 'Charts' }} />
      <Tab.Screen name="ReportsTab" component={ReportsScreen} options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

