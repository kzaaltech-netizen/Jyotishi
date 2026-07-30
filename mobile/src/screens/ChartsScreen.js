import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import NorthIndianChart from '../components/NorthIndianChart';
import { apiGetChart } from '../services/api';
import { useApp } from '../context/AppContext';

const CHART_TYPES = [
  { id: 'natal', name: 'D1 Lagna', title: 'Natal Birth Chart' },
  { id: 'd2', name: 'D2 Hora', title: 'Wealth & Income Chart' },
  { id: 'd9', name: 'D9 Navamsa', title: 'Soul & Marriage Chart' },
  { id: 'd10', name: 'D10 Dashamsha', title: 'Career & Profession Chart' },
  { id: 'd11', name: 'D11 Labhamsa', title: 'Gains & Fulfilment Chart' },
  { id: 'transit', name: 'Transit', title: 'Live Planetary Transits' },
];

export default function ChartsScreen({ navigation }) {
  const { activeChart } = useApp();

  const [activeTab, setActiveTab] = useState('natal');
  const [chartData, setChartData] = useState(activeChart);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChart(activeTab);
  }, [activeTab]);

  const loadChart = async (type) => {
    if (type === 'natal' && activeChart) {
      setChartData(activeChart);
      return;
    }

    setLoading(true);
    try {
      const res = await apiGetChart(type);
      if (res?.chartData) {
        setChartData(res.chartData);
      } else {
        setChartData(null);
      }
    } catch (e) {
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const activeMeta = CHART_TYPES.find(c => c.id === activeTab);

  return (
    <View style={styles.container}>
      <CosmicHeader
        title="Kundli Charts"
        subtitle="Vedic Divisional & Transit Calculations"
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      {/* Divisional Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {CHART_TYPES.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.chartTitle}>{activeMeta?.title}</Text>
        <Text style={styles.chartSubtitle}>
          Lagna Sign: {chartData?.lagnaSign || '—'} {chartData?.lagnaDeg ? `(${chartData.lagnaDeg}°)` : ''}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
        ) : (
          <View style={styles.chartContainer}>
            <NorthIndianChart chartData={chartData} size={310} />
          </View>
        )}

        {/* Planet Placement List */}
        {chartData?.planets ? (
          <View style={styles.planetSection}>
            <Text style={styles.sectionHeader}>Planetary Placements</Text>
            {chartData.planets.map(p => (
              <View key={p.name} style={styles.planetRow}>
                <Text style={styles.planetName}>{p.name} ({p.abbr})</Text>
                <Text style={styles.planetSign}>{p.sign} {p.deg ? `${p.deg}°` : ''}</Text>
                <Text style={styles.planetHouse}>House {p.house}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    maxHeight: 50,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.background,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  chartTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  chartSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  planetSection: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  planetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planetName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    width: '35%',
  },
  planetSign: {
    color: colors.textSecondary,
    fontSize: 13,
    width: '35%',
  },
  planetHouse: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
    width: '25%',
    textAlign: 'right',
  },
});
