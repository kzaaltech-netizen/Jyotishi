import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import { useSubscription } from '../components/SubscriptionGuard';

const PLANS = [
  {
    id: 'free',
    name: 'Free Seeker',
    price: 'Free',
    period: 'Forever',
    badge: 'Current Standard',
    charts: 'D1 Lagna & D9 Navamsa',
    ai: 'Natal & Relationship AI Guidance',
    tokens: '50 Initial Tokens included',
    features: [
      '• Access to D1 Natal Birth Chart',
      '• Access to D9 Navamsa Soul Chart',
      '• AI Chat with Natal & Relationship Guides',
      '• Basic Planetary Placements & House Details',
    ],
    buttonText: 'Current Plan',
    disabled: true,
  },
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: '₹299',
    period: '/ month',
    badge: 'Popular',
    charts: 'All Divisional Charts (D1, D9, D2, D10, D11, Transits)',
    ai: 'Unlimited Multi-Agent AI Analysis',
    tokens: 'Bonus 200 Tokens monthly',
    features: [
      '• Full D1 to D11 Divisional Kundli access',
      '• Live Planetary Transit Calculations',
      '• All 6 Specialized AI Agents (Career, Wealth, Union, etc.)',
      '• Priority Server Queue & Extended Memory',
      '• Unlimited Saved Reports & PDF Exports',
    ],
    buttonText: 'Coming Soon',
    disabled: true,
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: '₹2,999',
    period: '/ year',
    badge: 'Save 15%',
    charts: 'All Divisional & Future Charts',
    ai: 'Priority AI Orchestration & Deep Insights',
    tokens: 'Bonus 1,000 Tokens annually',
    features: [
      '• Everything in Premium Monthly',
      '• 15% discount on annual subscription',
      '• Early access to new divisional tools & transits',
      '• Priority AI response generation speed',
    ],
    buttonText: 'Coming Soon',
    disabled: true,
  },
  {
    id: 'lifetime',
    name: 'Premium Lifetime',
    price: '₹9,999',
    period: 'one-time',
    badge: 'Best Value',
    charts: 'Lifetime Unlimited Charts',
    ai: 'Unlimited Lifetime AI Access',
    tokens: 'Unlimited Token Replenishment',
    features: [
      '• Pay once, access forever',
      '• All present and future divisional chart modules',
      '• Unlimited AI Chat & PDF Report exports',
      '• VIP Support & early feature access',
    ],
    buttonText: 'Coming Soon',
    disabled: true,
  },
];

export default function SubscriptionScreen({ navigation }) {
  const { isPremium } = useSubscription();

  const handlePlanSelect = (plan) => {
    Alert.alert('Payment Integration', `The ${plan.name} option will be available when payments go live!`);
  };

  return (
    <View style={styles.container}>
      <CosmicHeader
        title="Parashara Premium"
        subtitle="Vedic Astrology & Multi-Agent Intelligence"
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.symbol}>✦</Text>
          <Text style={styles.heroTitle}>Unlock Your Cosmic Potential</Text>
          <Text style={styles.heroSub}>
            Explore complete divisional Kundlis, live planetary transits, and specialized AI guides.
          </Text>
        </View>

        {isPremium && (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerText}>✓ You have an active Premium Subscription</Text>
          </View>
        )}

        {PLANS.map(plan => (
          <View
            key={plan.id}
            style={[styles.planCard, plan.id === 'yearly' && styles.planCardHighlighted]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              {plan.badge && <Text style={styles.badge}>{plan.badge}</Text>}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Accessible Charts: <Text style={styles.metaVal}>{plan.charts}</Text></Text>
              <Text style={styles.metaLabel}>AI Capabilities: <Text style={styles.metaVal}>{plan.ai}</Text></Text>
              <Text style={styles.metaLabel}>Token Benefits: <Text style={styles.metaVal}>{plan.tokens}</Text></Text>
            </View>

            <View style={styles.featureList}>
              {plan.features.map((feat, idx) => (
                <Text key={idx} style={styles.featureText}>{feat}</Text>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btnPlan, plan.disabled && styles.btnDisabled]}
              onPress={() => handlePlanSelect(plan)}
            >
              <Text style={[styles.btnPlanText, plan.disabled && styles.btnDisabledText]}>
                {plan.buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
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
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  symbol: {
    fontSize: 36,
    color: colors.primary,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  activeBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  activeBannerText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  planCardHighlighted: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  period: {
    color: colors.textMuted,
    fontSize: 13,
    marginLeft: 6,
  },
  metaBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginVertical: 2,
  },
  metaVal: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  featureList: {
    marginBottom: 16,
  },
  featureText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginVertical: 3,
    lineHeight: 16,
  },
  btnPlan: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPlanText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnDisabledText: {
    color: colors.textMuted,
  },
});
