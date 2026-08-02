import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import colors from '../theme/colors';
import { apiSaveProfile, apiGetProfile } from '../services/api';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen({ navigation }) {
  const { setProfile, generateChart } = useApp();

  const [fullName, setFullName] = useState('Arjun Sharma');
  const [dob, setDob] = useState('1995-05-15');
  const [birthTime, setBirthTime] = useState('14:30');
  const [birthplace, setBirthplace] = useState('New Delhi, India');
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.2090);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing profile details if already configured
    apiGetProfile()
      .then(p => {
        if (p) {
          setFullName(p.fullName);
          setDob(p.dob);
          setBirthTime(p.birthTime);
          setBirthplace(p.birthplace);
          if (p.lat) setLat(p.lat);
          if (p.lon) setLon(p.lon);
          if (p.timezone) setTimezone(p.timezone);
        }
      })
      .catch(() => {});
  }, []);

  const handlePlaceChange = async (text) => {
    setBirthplace(text);
    if (text.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&addressdetails=1`, {
        headers: {
          'User-Agent': 'AethericJyotish/1.0',
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.warn('Geocoding error:', err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = async (item) => {
    const formattedName = item.display_name;
    setBirthplace(formattedName);
    setShowSuggestions(false);

    const cleanLat = parseFloat(item.lat);
    const cleanLon = parseFloat(item.lon);
    setLat(cleanLat);
    setLon(cleanLon);

    // Fetch matching timezone
    try {
      const tzRes = await fetch(`https://timeapi.io/api/timezone/coordinate?latitude=${cleanLat}&longitude=${cleanLon}`);
      const tzData = await tzRes.json();
      if (tzData && tzData.timeZone) {
        setTimezone(tzData.timeZone);
      }
    } catch (err) {
      console.warn('Timezone resolution error:', err.message);
    }
  };

  const [loadingStep, setLoadingStep] = useState('Generating Natal Chart...');

  const handleSubmit = async () => {
    if (!fullName || !dob || !birthTime || !birthplace) {
      Alert.alert('Error', 'Please fill in all birth profile details.');
      return;
    }

    setLoading(true);
    setLoadingStep('Generating Natal Chart...');
    try {
      // Step 1: Save birth profile
      const savedProfile = await apiSaveProfile({
        fullName,
        dob,
        birthTime,
        birthplace,
        lat: Number(lat),
        lon: Number(lon),
        timezone,
      });

      // Step 2: Calculate Planetary Positions
      setLoadingStep('Calculating Planetary Positions...');
      await generateChart();

      // Step 3: Preparing AI Guide
      setLoadingStep('Preparing AI Guide...');
      setProfile(savedProfile);

      if (navigation && navigation.navigate) {
        navigation.navigate('Main');
      }
    } catch (e) {
      Alert.alert('Generation Failed', e.message || 'Error saving birth details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingSymbol}>✦</Text>
        <Text style={styles.loadingTitle}>{loadingStep}</Text>
        <Text style={styles.loadingSubtitle}>
          Calculating planetary positions, natal Lagna (D1), and Vimshottari Dasha periods.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            value={birthplace}
            onChangeText={handlePlaceChange}
            placeholder="New Delhi, India"
            placeholderTextColor={colors.textMuted}
          />
          {searching && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.searchIndicator} />
          )}
        </View>

        {/* Suggestion Dropdown Overlay */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Collapsible Advanced Section */}
        <TouchableOpacity
          style={styles.advancedHeader}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedHeaderText}>
            {showAdvanced ? '▼ Hide Geographic Coordinates' : '▶ Show Geographic Coordinates'}
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedContent}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={String(lat)}
              onChangeText={(t) => setLat(parseFloat(t) || 0)}
              keyboardType="numeric"
              placeholder="28.6139"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={String(lon)}
              onChangeText={(t) => setLon(parseFloat(t) || 0)}
              keyboardType="numeric"
              placeholder="77.2090"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Timezone (IANA format)</Text>
            <TextInput
              style={styles.input}
              value={timezone}
              onChangeText={setTimezone}
              placeholder="Asia/Kolkata"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingSymbol: {
    fontSize: 48,
    color: colors.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
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
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIndicator: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    maxHeight: 180,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  advancedHeader: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  advancedHeaderText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  advancedContent: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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

