import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>✦</Text>
      <Text style={styles.title}>Parashara</Text>
      <Text style={styles.subtitle}>Your Destiny in the Stars</Text>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 48,
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
});
