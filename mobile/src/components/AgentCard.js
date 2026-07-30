import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function AgentCard({ name, title, domain, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.name, active && styles.nameActive]}>{name}</Text>
        {active && <Text style={styles.activeBadge}>Active</Text>}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.domain} numberOfLines={2}>{domain}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    width: 160,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  nameActive: {
    color: colors.primaryLight,
  },
  activeBadge: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  domain: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
});
