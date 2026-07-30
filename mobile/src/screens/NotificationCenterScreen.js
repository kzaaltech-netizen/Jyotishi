import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';

export default function NotificationCenterScreen() {
  return (
    <View style={styles.container}>
      <CosmicHeader title="Notifications" subtitle="Transits & Cosmic Alerts" />
      <View style={styles.content}>
        <Text style={styles.symbol}>🔔</Text>
        <Text style={styles.title}>No New Notifications</Text>
        <Text style={styles.sub}>You will receive alerts for major planetary transits and active Dasha transitions here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  symbol: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  sub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
