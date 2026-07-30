import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';

export default function SubscriptionPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <CosmicHeader title="Aetheric Premium" subtitle="Unlimited Astrology Access" />

      <View style={styles.content}>
        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.title}>Go Premium</Text>
        <Text style={styles.subtitle}>Unlock unlimited chart calculations, priority AI requests, and full divisional insights.</Text>

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Annual Cosmic Access</Text>
          <Text style={styles.planPrice}>₹2,999 / year</Text>
          <Text style={styles.planDesc}>• Unlimited AI Chat & Interpretations</Text>
          <Text style={styles.planDesc}>• Full D1 to D11 Divisional Kundli access</Text>
          <Text style={styles.planDesc}>• Priority Server Queue</Text>
        </View>

        <TouchableOpacity style={styles.btnDisabled} disabled>
          <Text style={styles.btnText}>Payments Coming Soon</Text>
        </TouchableOpacity>
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
    fontSize: 48,
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 12,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginVertical: 20,
  },
  planTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  planPrice: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 6,
  },
  planDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  btnDisabled: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
