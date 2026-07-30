import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function TokenBadge({ onPress }) {
  const { tokenBalance } = useApp();

  return (
    <TouchableOpacity style={styles.badge} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.icon}>✦</Text>
      <Text style={styles.text}>{tokenBalance} Tokens</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  icon: {
    color: colors.primary,
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
