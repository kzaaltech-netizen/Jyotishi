import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import { apiGetSettings, apiSaveSettings } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PERSONALITIES = ['Balanced', 'Traditional', 'Spiritual', 'Scientific', 'Friendly', 'Professional'];
const LANGUAGES = ['English', 'Hindi', 'Hinglish'];

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();

  const [selectedPersonality, setSelectedPersonality] = useState('Balanced');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await apiGetSettings();
      if (res?.preferences) {
        if (res.preferences.personality) setSelectedPersonality(res.preferences.personality);
        if (res.preferences.language) setSelectedLanguage(res.preferences.language);
      }
    } catch (e) {}
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiSaveSettings({
        personality: selectedPersonality,
        language: selectedLanguage,
      });
      Alert.alert('Saved', 'AI personalization preferences updated!');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CosmicHeader
        title="Settings & Preferences"
        subtitle="AI Personalization Engine"
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Personality Style */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Personality Style</Text>
          <Text style={styles.cardSub}>Select how AI guides structure their insights</Text>

          <View style={styles.chipRow}>
            {PERSONALITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, selectedPersonality === p && styles.chipActive]}
                onPress={() => setSelectedPersonality(p)}
              >
                <Text style={[styles.chipText, selectedPersonality === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Response Language</Text>
          <Text style={styles.cardSub}>Language for AI interpretations and chat responses</Text>

          <View style={styles.chipRow}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang}
                style={[styles.chip, selectedLanguage === lang && styles.chipActive]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text style={[styles.chipText, selectedLanguage === lang && styles.chipTextActive]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleSave} disabled={loading}>
          <Text style={styles.btnPrimaryText}>Save Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLogout} onPress={logout}>
          <Text style={styles.btnLogoutText}>Sign Out</Text>
        </TouchableOpacity>
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
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.background,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  btnLogout: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  btnLogoutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
});
