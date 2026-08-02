import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';

export default function HelpSupportScreen() {
  return (
    <View style={styles.container}>
      <CosmicHeader title="Help & Support" subtitle="Frequently Asked Questions" />

      <ScrollView contentContainerStyle={styles.content}>
        {[
          { q: 'How are charts calculated?', a: 'Charts are calculated using VedAstro with the Lahiri ayanamsa system, supporting D1 natal, D9 navamsa, D10 dashamsha, D2 hora, D11 labhamsa, and live transits.' },
          { q: 'How do tokens work?', a: 'Every AI chat message costs 1 token. Generating a full report or interpretation reading costs 3 tokens. New accounts start with 50 free tokens.' },
          { q: 'Is my birth data private?', a: 'Yes. Your birth profile is stored securely in PostgreSQL and used strictly for computing your Vedic chart.' },
        ].map((item, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.answer}>{item.a}</Text>
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
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  question: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  answer: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
