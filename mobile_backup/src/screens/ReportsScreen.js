import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import { apiGetReports } from '../services/api';

export default function ReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiGetReports();
      setReports(data || []);
    } catch (e) {
      console.warn('[ReportsScreen] Failed to load reports:', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CosmicHeader
        title="Saved AI Reports"
        subtitle="Comprehensive Chart Readings & Insights"
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved reports yet.</Text>
          <Text style={styles.emptySub}>Generate readings in the AI tab to save reports.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedReport(item)}>
              <Text style={styles.cardMode}>{item.mode.toUpperCase()} READING</Text>
              <Text style={styles.cardSnippet} numberOfLines={3}>{item.content}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Report Modal */}
      <Modal visible={!!selectedReport} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedReport?.mode?.toUpperCase()} REPORT</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.reportText}>{selectedReport?.content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
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
  cardMode: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSnippet: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  cardDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  modalTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    marginBottom: 20,
  },
  reportText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
});
