import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import TokenBadge from './TokenBadge';

export default function CosmicHeader({ title, subtitle, onTokenPress }) {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title || 'Aetheric Jyotish'}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TokenBadge onPress={onTokenPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
