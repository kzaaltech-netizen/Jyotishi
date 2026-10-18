import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import { apiGetSubscription, apiSaveSubscription } from '../services/api';

export default function SubscriptionPlaceholderScreen() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const sub = await apiGetSubscription();
      setSubscription(sub);
    } catch (e) {
      console.warn('Failed to load subscription:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setSubmitting(plan.type);
    try {
      const now = new Date();
      const end = new Date();
      if (plan.type === 'monthly') {
        end.setDate(now.getDate() + 30);
      } else {
        end.setDate(now.getDate() + 365);
      }

      const sub = await apiSaveSubscription({
        planType: plan.type,
        startDate: now.toISOString(),
        endDate: end.toISOString(),
      });
      setSubscription(sub);
      Alert.alert('Subscription Activated', `You are now subscribed to the ${plan.name}!`);
    } catch (e) {
      Alert.alert('Activation Failed', e.message || 'Error activating plan.');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CosmicHeader title="Jyotishly Premium" subtitle="Unlimited Astrology Access" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CosmicHeader title="Jyotishly Premium" subtitle="Unlimited Astrology Access" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.title}>Go Premium</Text>
        <Text style={styles.subtitle}>Unlock unlimited chart calculations, priority AI requests, and full divisional insights.</Text>

        {subscription && subscription.status === 'active' ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeLabel}>✓ Your Subscription is Active</Text>
            <Text style={styles.activePlan}>Plan: {subscription.planType.toUpperCase()}</Text>
            <Text style={styles.activeDate}>Expires: {new Date(subscription.endDate).toLocaleDateString()}</Text>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {[
              { type: 'monthly', name: 'Monthly Cosmic Access', price: '₹299 / month', desc: '• Unlimited AI Chat & Interpretations\n• Full D1 to D11 Kundli access\n• Monthly renewal' },
              { type: 'yearly', name: 'Annual Cosmic Access', price: '₹2,999 / year', desc: '• Save 15%\n• Full D1 to D11 Divisional Kundli access\n• Priority Server Queue' }
            ].map(plan => (
              <View key={plan.type} style={styles.planCard}>
                <Text style={styles.planTitle}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planDesc}>{plan.desc}</Text>
                <TouchableOpacity
                  style={styles.btnActive}
                  onPress={() => handleSubscribe(plan)}
                  disabled={submitting !== null}
                >
                  {submitting === plan.type ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text style={styles.btnText}>Subscribe Now</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    alignItems: 'center',
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
  plansContainer: {
    width: '100%',
    marginTop: 10,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  planTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  planPrice: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 6,
  },
  planDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  btnActive: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  activeLabel: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  activePlan: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  activeDate: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});
