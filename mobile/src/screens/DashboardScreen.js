import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import NorthIndianChart from '../components/NorthIndianChart';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { profile, activeChart, loadUserData } = useApp();

  useEffect(() => {
    if (!activeChart && profile) {
      loadUserData();
    }
  }, [profile, activeChart]);

  const dashaInfo = activeChart?.dashaInfo;
  const currentDasha = dashaInfo?.currentDasha;
  const antardasha = dashaInfo?.antardasha;

  return (
    <View style={styles.container}>
      <CosmicHeader
        title={`Welcome, ${profile?.fullName || user?.name || 'Seeker'}`}
        subtitle="Cosmic Natal & Planetary Intelligence"
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Dasha Banner */}
        {currentDasha ? (
          <View style={styles.dashaCard}>
            <Text style={styles.dashaBadge}>Active Dasha Period</Text>
            <Text style={styles.dashaTitle}>
              {currentDasha.lord} Mahadasha
              {antardasha ? ` / ${antardasha.lord} Antardasha` : ''}
            </Text>
            <Text style={styles.dashaSubtitle}>
              Nakshatra: {activeChart?.nakshatra?.name || '—'} (Lord: {activeChart?.nakshatra?.lord || '—'})
            </Text>
          </View>
        ) : null}

        {/* Natal Kundli Chart Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Natal Lagna Chart (D1)</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ChartsTab')}>
            <Text style={styles.linkText}>View All Charts ›</Text>
          </TouchableOpacity>
        </View>

        {activeChart ? (
          <View style={styles.chartWrapper}>
            <NorthIndianChart chartData={activeChart} size={280} />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No chart calculated yet.</Text>
            <TouchableOpacity style={styles.btnSm} onPress={() => navigation.navigate('Onboarding')}>
              <Text style={styles.btnSmText}>Enter Birth Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Agent Actions */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Specialized AI Guides</Text>

        <View style={styles.grid}>
          {[
            { mode: 'general', chart: 'natal', name: 'Jyotish', title: 'Natal Guide', icon: '✦', color: colors.primary },
            { mode: 'career', chart: 'd10', name: 'Karma', title: 'Career Agent', icon: '💼', color: colors.accentTeal },
            { mode: 'wealth', chart: 'd2', name: 'Lakshmi', title: 'Wealth Agent', icon: '💰', color: colors.accentViolet },
            { mode: 'union', chart: 'd9', name: 'Mitra', title: 'Union Agent', icon: '❤️', color: colors.accentViolet },
            { mode: 'abundance', chart: 'd11', name: 'Vriddhi', title: 'Abundance Agent', icon: '🌿', color: colors.primary },
            { mode: 'forecast', chart: 'transit', name: 'Kala', title: 'Forecast Agent', icon: '⏳', color: colors.accentTeal },
          ].map(agent => (
            <TouchableOpacity
              key={agent.mode}
              style={styles.gridCard}
              onPress={() => navigation.navigate('ChartsTab', {
                initialChart: agent.chart,
                initialMode: agent.mode,
                scrollToAI: true,
              })}
            >
              <Text style={[styles.gridIcon, { color: agent.color }]}>{agent.icon}</Text>
              <Text style={styles.gridName}>{agent.name}</Text>
              <Text style={styles.gridTitle}>{agent.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  dashaCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  dashaBadge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dashaTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  dashaSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  chartWrapper: {
    marginVertical: 8,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 12,
  },
  btnSm: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnSmText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  gridName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  gridTitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
