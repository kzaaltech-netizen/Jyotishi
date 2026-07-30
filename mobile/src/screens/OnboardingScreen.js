import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import colors from '../theme/colors';
import { apiSaveProfile } from '../services/api';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen() {
  const { setProfile, generateChart } = useApp();

  const [fullName, setFullName] = useState('Arjun Sharma');
  const [dob, setDob] = useState('1995-05-15');
  const [birthTime, setBirthTime] = useState('14:30');
  const [birthplace, setBirthplace] = useState('New Delhi, India');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !dob || !birthTime || !birthplace) {
      Alert.alert('Error', 'Please fill in all birth profile details.');
      return;
    }

    setLoading(true);
    try {
      // 1. Save birth profile to backend
      const savedProfile = await apiSaveProfile({
        fullName,
        dob,
        birthTime,
        birthplace,
      });

      setProfile(savedProfile);

      // 2. Automatically generate VedAstro chart bundle on backend
      await generateChart();

      Alert.alert('Success', 'Birth profile saved and natal chart calculated!');
    } catch (e) {
      Alert.alert('Generation Failed', e.message || 'Error saving birth details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.title}>Birth Profile</Text>
        <Text style={styles.subtitle}>Enter your birth details for exact VedAstro calculations</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Arjun Sharma"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={setDob}
          placeholder="1995-05-15"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Time of Birth (HH:MM in 24hr format)</Text>
        <TextInput
          style={styles.input}
          value={birthTime}
          onChangeText={setBirthTime}
          placeholder="14:30"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Birth Place (City, Country)</Text>
        <TextInput
          style={styles.input}
          value={birthplace}
          onChangeText={setBirthplace}
          placeholder="New Delhi, India"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.btnPrimaryText}>Calculate Birth Chart</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  symbol: {
    fontSize: 40,
    color: colors.primary,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
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
});
