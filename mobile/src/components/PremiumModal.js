import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function PremiumModal({ visible, onClose, onViewPlans }) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.symbol}>✨ 🔒</Text>
          <Text style={styles.title}>Premium Feature</Text>
          <Text style={styles.subtitle}>
            Unlock advanced Vedic divisional charts & deep AI interpretations.
          </Text>

          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✦ Hora (D2) – Wealth & Financial Assets</Text>
            <Text style={styles.featureItem}>✦ Dashamsha (D10) – Career & Authority</Text>
            <Text style={styles.featureItem}>✦ Labhamsa (D11) – Income & High Gains</Text>
            <Text style={styles.featureItem}>✦ Live Transits – Real-time Movements</Text>
            <Text style={styles.featureItem}>✦ Advanced AI Analysis – Deep Insights</Text>
            <Text style={styles.featureItem}>✦ Future Premium Reports – PDF Downloads</Text>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={onViewPlans} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>View Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnSecondaryText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  symbol: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  featuresList: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureItem: {
    color: colors.textSecondary,
    fontSize: 12,
    marginVertical: 4,
    lineHeight: 16,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  btnSecondary: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
