import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import TokenWalletScreen from '../screens/TokenWalletScreen';
import SubscriptionPlaceholderScreen from '../screens/SubscriptionPlaceholderScreen';
import NotificationCenterScreen from '../screens/NotificationCenterScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useApp();

  if (authLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !profile ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="TokenWallet" component={TokenWalletScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionPlaceholderScreen} />
          <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
