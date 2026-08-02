import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import { apiGetTokens } from '../services/api';
import { useApp } from '../context/AppContext';

export default function TokenWalletScreen() {
  const { tokenBalance } = useApp();
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      const data = await apiGetTokens();
      if (data?.ledger) {
        setLedger(data.ledger);
      }
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <CosmicHeader title="Token Wallet" subtitle="Aetheric Pay-Per-Use Balance" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Token Balance</Text>
          <Text style={styles.balanceValue}>{tokenBalance}</Text>
          <Text style={styles.balanceSub}>1 Chat Message = 1 Token | 1 Interpretation = 3 Tokens</Text>
        </View>

        {/* Purchase Placeholder Cards */}
        <Text style={styles.sectionTitle}>Token Packs (Placeholder)</Text>

        <View style={styles.packRow}>
          {[
            { name: 'Starter Pack', tokens: 50, price: '₹199' },
            { name: 'Cosmic Pack', tokens: 200, price: '₹499' },
            { name: 'Unlimited Pack', tokens: 1000, price: '₹1,499' },
          ].map(pack => (
            <View key={pack.name} style={styles.packCard}>
              <Text style={styles.packTokens}>{pack.tokens} Tokens</Text>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packPrice}>{pack.price}</Text>
              <TouchableOpacity style={styles.btnBuyDisabled} disabled>
                <Text style={styles.btnBuyText}>Buy Pack</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Transaction History */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Transactions</Text>
        {ledger.length === 0 ? (
          <Text style={styles.emptyText}>No transactions recorded yet.</Text>
        ) : (
          ledger.map(item => (
            <View key={item.id} style={styles.ledgerRow}>
              <View>
                <Text style={styles.ledgerAction}>{item.action}</Text>
                <Text style={styles.ledgerDesc}>{item.description}</Text>
              </View>
              <Text style={[styles.ledgerCost, item.cost < 0 ? { color: colors.error } : { color: colors.success }]}>
                {item.cost < 0 ? item.cost : `-${item.cost}`}
              </Text>
            </View>
          ))
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
    padding: 16,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  balanceLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '700',
    marginVertical: 4,
  },
  balanceSub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  packRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  packTokens: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  packName: {
    color: colors.textPrimary,
    fontSize: 11,
    marginVertical: 4,
  },
  packPrice: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  btnBuyDisabled: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
  },
  btnBuyText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ledgerAction: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  ledgerDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  ledgerCost: {
    fontSize: 14,
    fontWeight: '700',
  },
});
