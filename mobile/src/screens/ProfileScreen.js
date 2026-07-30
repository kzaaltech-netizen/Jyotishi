import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const { profile } = useApp();

  return (
    <View style={styles.container}>
      <CosmicHeader
        title="Birth Profile"
        subtitle="Astrological Birth Data & Calculations"
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Account Email</Text>
            <Text style={styles.value}>{user?.email || '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{profile?.fullName || user?.name || '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{profile?.dob || '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Birth Time</Text>
            <Text style={styles.value}>{profile?.birthTime || '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Birthplace</Text>
            <Text style={styles.value}>{profile?.birthplace || '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Timezone</Text>
            <Text style={styles.value}>{profile?.timezone || 'Asia/Kolkata'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Onboarding')}>
          <Text style={styles.btnPrimaryText}>Update Birth Details</Text>
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
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
