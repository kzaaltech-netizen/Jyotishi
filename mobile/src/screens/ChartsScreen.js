import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import NorthIndianChart from '../components/NorthIndianChart';
import PremiumModal from '../components/PremiumModal';
import FormattedChatMessage from '../components/FormattedChatMessage';
import { useSubscription } from '../components/SubscriptionGuard';
import { apiGetChart, apiSendAIChat, apiSaveReport } from '../services/api';
import { useApp } from '../context/AppContext';

const CHART_TYPES = [
  { id: 'natal', name: 'D1 Lagna', title: 'Natal Birth Chart', locked: false },
  { id: 'd9', name: 'D9 Navamsa', title: 'Soul & Marriage Chart', locked: false },
  { id: 'd2', name: '🔒 D2 Hora', title: 'Wealth & Income Chart', locked: true },
  { id: 'd10', name: '🔒 D10 Dashamsha', title: 'Career & Profession Chart', locked: true },
  { id: 'd11', name: '🔒 D11 Labhamsa', title: 'Gains & Fulfilment Chart', locked: true },
  { id: 'transit', name: '🔒 Transit', title: 'Live Planetary Transits', locked: true },
];

const AGENTS = [
  { id: 'general', mode: 'general', name: 'Jyotish', title: 'Natal Guide', icon: '✦', domain: 'Natal chart & overall life purpose' },
  { id: 'career', mode: 'career', name: 'Karma', title: 'Career Agent', icon: '💼', domain: 'D10 Dashamsha & profession' },
  { id: 'wealth', mode: 'wealth', name: 'Lakshmi', title: 'Wealth Agent', icon: '💰', domain: 'D2 Hora & financial assets' },
  { id: 'union', mode: 'union', name: 'Mitra', title: 'Union Agent', icon: '❤️', domain: 'D9 Navamsa & relationships' },
  { id: 'abundance', mode: 'abundance', name: 'Vriddhi', title: 'Abundance Agent', icon: '🌿', domain: 'D11 Labhamsa & Jupiter blessings' },
  { id: 'forecast', mode: 'forecast', name: 'Kala', title: 'Forecast Agent', icon: '⏳', domain: 'Transits & Vimshottari Dasha' },
];

const SUGGESTED_QUESTIONS = {
  general: [
    'What are my core strengths?',
    'What key areas should I improve?',
    'Describe my natal personality.',
  ],
  career: [
    'Best career path for me?',
    'Government vs private sector?',
    'Business or job suitability?',
  ],
  wealth: [
    'What is my financial potential?',
    'How can I maximize my financial growth?',
    'When will income increase?',
  ],
  union: [
    'When is my marriage timing?',
    'Love marriage or arranged?',
    'What will my spouse be like?',
  ],
  abundance: [
    'Jupiter blessings in my chart?',
    'Spiritual evolution guidance?',
    'What is my highest purpose?',
  ],
  forecast: [
    'What are my active Mahadasha effects?',
    'Upcoming major opportunities?',
    'Key dates in the next period?',
  ],
};

const getTimestamp = () => {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export default function ChartsScreen({ route, navigation }) {
  const { activeChart, tokenBalance, refreshTokens } = useApp();
  const { isChartLocked, getRecommendedAgent } = useSubscription();

  const [activeTab, setActiveTab] = useState(route?.params?.initialChart || 'natal');
  const [chartData, setChartData] = useState(activeChart);
  const [loadingChart, setLoadingChart] = useState(false);

  const [activeAgent, setActiveAgent] = useState('general');
  const [messagesByAgent, setMessagesByAgent] = useState({
    general: [{ role: 'ai', content: 'Greetings! I am Jyotish, your Natal Guide. Ask me anything about your D1 chart & life purpose.', time: getTimestamp() }],
    career: [{ role: 'ai', content: 'Greetings! I am Karma, your Career Agent. Ask me about D10 Dashamsha, profession, and business.', time: getTimestamp() }],
    wealth: [{ role: 'ai', content: 'Greetings! I am Lakshmi, your Wealth Agent. Ask me about D2 Hora, financial assets, and savings.', time: getTimestamp() }],
    union: [{ role: 'ai', content: 'Greetings! I am Mitra, your Union Agent. Ask me about D9 Navamsa, marriage timing, and spouse.', time: getTimestamp() }],
    abundance: [{ role: 'ai', content: 'Greetings! I am Vriddhi, your Abundance Agent. Ask me about D11 Labhamsa, gains, and Jupiter.', time: getTimestamp() }],
    forecast: [{ role: 'ai', content: 'Greetings! I am Kala, your Forecast Agent. Ask me about transits, Vimshottari Dasha, and event timing.', time: getTimestamp() }],
  });

  const [input, setInput] = useState('');
  const [loadingByAgent, setLoadingByAgent] = useState({});
  const [savingReport, setSavingReport] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  const mainScrollRef = useRef(null);
  const chatScrollRef = useRef(null);
  const aiSectionRef = useRef(null);

  useEffect(() => {
    if (route?.params?.initialChart) {
      handleTabPress(route.params.initialChart);
    }
  }, [route?.params?.initialChart]);

  useEffect(() => {
    if (route?.params?.initialMode) {
      setActiveAgent(route.params.initialMode);
    }
  }, [route?.params?.initialMode]);

  useEffect(() => {
    if (route?.params?.scrollToAI) {
      setTimeout(() => {
        aiSectionRef.current?.measureLayout(
          mainScrollRef.current,
          (x, y) => {
            mainScrollRef.current?.scrollTo({ y: y - 10, animated: true });
          },
          () => {}
        );
      }, 300);
    }
  }, [route?.params?.scrollToAI]);

  useEffect(() => {
    loadChart(activeTab);
  }, [activeTab]);

  useEffect(() => {
    // Auto scroll chat to end when active agent's messages change or loading state changes
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messagesByAgent, activeAgent, loadingByAgent]);

  const loadChart = async (type) => {
    if ((type === 'natal' || type === 'd1') && activeChart) {
      setChartData(activeChart);
      return;
    }

    setLoadingChart(true);
    try {
      const res = await apiGetChart(type);
      const chartObj = res?.chartData || res;
      if (chartObj && (chartObj.planets || chartObj.ascendant || chartObj.houses)) {
        setChartData(chartObj);
      } else {
        setChartData(null);
      }
    } catch (e) {
      if (e.message?.includes('PREMIUM_REQUIRED') || e.message?.includes('403')) {
        setPremiumModalVisible(true);
      }
      setChartData(null);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleTabPress = (type) => {
    // SHORT-CIRCUIT: Locked tabs open Premium Modal instantly without API call or loading spinner
    if (isChartLocked(type)) {
      setPremiumModalVisible(true);
      return;
    }

    setActiveTab(type);

    // Smart Agent Recommendation: Automatically suggest/switch to recommended agent for the chart
    const recAgent = getRecommendedAgent(type);
    if (recAgent) {
      setActiveAgent(recAgent);
    }
  };

  const handleSend = async (overrideText = null) => {
    const targetAgent = activeAgent;
    const textToSend = (overrideText || input).trim();
    if (!textToSend || loadingByAgent[targetAgent]) return;

    const timeStr = getTimestamp();

    // Add user message to active agent's history
    const userMsg = { role: 'user', content: textToSend, time: timeStr };
    setMessagesByAgent(prev => ({
      ...prev,
      [targetAgent]: [...(prev[targetAgent] || []), userMsg],
    }));
    setInput('');
    setLoadingByAgent(prev => ({ ...prev, [targetAgent]: true }));

    try {
      const res = await apiSendAIChat(targetAgent, textToSend);
      const aiReply = res.reply || res.formatted?.analysis || 'Analysis complete.';

      const aiMsg = { role: 'ai', content: aiReply, time: getTimestamp() };
      setMessagesByAgent(prev => ({
        ...prev,
        [targetAgent]: [...(prev[targetAgent] || []), aiMsg],
      }));
      refreshTokens();
    } catch (e) {
      const errorMsg = e.message?.includes('PREMIUM_REQUIRED')
        ? 'This insight requires Premium because it depends on advanced divisional charts.'
        : (e.message || 'Failed to connect to AI Orchestrator');

      if (e.message?.includes('PREMIUM_REQUIRED')) {
        setPremiumModalVisible(true);
      }

      setMessagesByAgent(prev => ({
        ...prev,
        [targetAgent]: [...(prev[targetAgent] || []), { role: 'ai', content: errorMsg, time: getTimestamp() }],
      }));
    } finally {
      setLoadingByAgent(prev => ({ ...prev, [targetAgent]: false }));
    }
  };

  const handleSaveReport = async () => {
    const history = messagesByAgent[activeAgent] || [];
    if (history.length <= 1) {
      Alert.alert('Save Report', 'Have a conversation with the AI guide before saving a report.');
      return;
    }

    setSavingReport(true);
    try {
      const reportText = history
        .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n\n');

      await apiSaveReport(activeAgent, reportText);
      Alert.alert('Report Saved', 'This AI interpretation has been saved to your Reports section!');
    } catch (e) {
      Alert.alert('Save Error', e.message || 'Failed to save report.');
    } finally {
      setSavingReport(false);
    }
  };

  const activeMeta = CHART_TYPES.find(c => c.id === activeTab);
  const currentAgent = AGENTS.find(a => a.mode === activeAgent);
  const activeMessages = messagesByAgent[activeAgent] || [];
  const showSuggestions = activeMessages.length <= 1; // Chips disappear after first user message!

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CosmicHeader
        title="Kundli Charts"
        subtitle="Unified Vedic Astrology & AI Workspace"
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      {/* Divisional Chart Tabs */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabContent}
        >
          {CHART_TYPES.map(tab => {
            const locked = isChartLocked(tab.id);
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  active && styles.tabActive,
                  locked && styles.tabLocked,
                ]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive, locked && styles.tabTextLocked]}>
                  {locked ? `🔒 ${tab.name.replace('🔒 ', '')}` : tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView ref={mainScrollRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* 1. Birth Chart Header */}
        <View style={styles.chartHeaderCard}>
          <Text style={styles.chartTitle}>{activeMeta?.title}</Text>
          <Text style={styles.chartSubtitle}>
            Lagna Sign: <Text style={styles.highlightVal}>{chartData?.lagnaSign || '—'}</Text>
            {chartData?.lagnaDeg ? ` (${chartData.lagnaDeg}°)` : ''}
          </Text>
        </View>

        {/* 2. Selected Chart SVG */}
        {loadingChart ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Rendering {activeMeta?.name}...</Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <NorthIndianChart chartData={chartData} size={310} />
          </View>
        )}

        {/* 3. Planetary Placements Table */}
        {chartData?.planets ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Planetary Placements</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, { width: '35%' }]}>Planet</Text>
              <Text style={[styles.tableCol, { width: '35%' }]}>Rashi Sign</Text>
              <Text style={[styles.tableCol, { width: '30%', textAlign: 'right' }]}>House</Text>
            </View>
            {chartData.planets.map((p, idx) => (
              <View key={`planet-${p.name || idx}`} style={styles.tableRow}>
                <Text style={styles.planetName}>{p.name} ({p.abbr})</Text>
                <Text style={styles.planetSign}>{p.sign} {p.deg ? `${p.deg}°` : ''}</Text>
                <Text style={styles.planetHouse}>House {p.house}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* 4. House Details */}
        {chartData?.houses ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>House Lords & Occupants</Text>
            <View style={styles.houseGrid}>
              {chartData.houses.slice(0, 12).map((h, idx) => (
                <View key={`house-${h.house || idx}`} style={styles.houseCard}>
                  <Text style={styles.houseNum}>House {h.house}</Text>

                  <Text style={styles.houseSign}>{h.sign}</Text>
                  {h.occupants && h.occupants.length > 0 ? (
                    <Text style={styles.houseOcc}>
                      Occ: {h.occupants.join(', ')}
                    </Text>
                  ) : (
                    <Text style={styles.houseOccEmpty}>Empty</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : null}


        {/* 6. Dasha & Nakshatra Summary */}
        {chartData?.dashaInfo || chartData?.nakshatra ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Dasha Period & Nakshatra</Text>
            <View style={styles.dashaBox}>
              <Text style={styles.dashaText}>
                Active Mahadasha: <Text style={styles.highlightVal}>{chartData?.dashaInfo?.currentDasha?.lord || '—'}</Text>
              </Text>
              <Text style={styles.dashaText}>
                Moon Nakshatra: <Text style={styles.highlightVal}>{chartData?.nakshatra?.name || '—'}</Text> (Lord: {chartData?.nakshatra?.lord || '—'})
              </Text>
            </View>
          </View>
        ) : null}

        {/* 7. ✨ EMBEDDED AI ASTROLOGY ASSISTANT */}
        <View ref={aiSectionRef} style={styles.aiSectionContainer}>
          <View style={styles.aiSectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>✨ Ask your AI Astrology Guide</Text>
              <Text style={styles.aiSub}>
                Connected to {activeMeta?.name} context
              </Text>
            </View>
            <View style={styles.tokenPillHeader}>
              <Text style={styles.tokenPillText}>⭐⭐ {tokenBalance} Tokens</Text>
            </View>
          </View>

          {/* Save Report Action Bar */}
          <View style={styles.aiActionRow}>
            <TouchableOpacity
              style={styles.btnSaveReport}
              onPress={handleSaveReport}
              disabled={savingReport}
            >
              {savingReport ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.btnSaveReportText}>📜 Save as Report</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Specialist Agent Selector */}
          <Text style={styles.agentSelectorTitle}>Select AI Specialist:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.agentSelectorBar}
            contentContainerStyle={styles.agentSelectorContent}
          >
            {AGENTS.map(agent => {
              const active = activeAgent === agent.mode;
              return (
                <TouchableOpacity
                  key={`agent-${agent.id}`}
                  style={[styles.agentChip, active && styles.agentChipActive]}
                  onPress={() => setActiveAgent(agent.mode)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.agentIcon}>{agent.icon}</Text>
                  <View>
                    <Text style={[styles.agentName, active && styles.agentNameActive]}>{agent.name}</Text>
                    <Text style={styles.agentTitle}>{agent.title}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Context-aware Suggested Questions (Disappears once user asks a question!) */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggested Questions for {currentAgent?.name}:</Text>
              <View style={styles.suggestionsRow}>
                {(SUGGESTED_QUESTIONS[activeAgent] || []).map((q, idx) => (
                  <TouchableOpacity
                    key={`sq-${activeAgent}-${idx}`}
                    style={styles.suggestionPill}
                    onPress={() => handleSend(q)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionText}>✦ {q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Per-Agent Isolated Chat Bubble Feed */}
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatFeed}
            contentContainerStyle={styles.chatFeedContent}
            nestedScrollEnabled
          >
            {activeMessages.map((m, idx) => (
              <View
                key={`msg-${activeAgent}-${idx}`}
                style={[
                  styles.bubble,
                  m.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <View style={styles.bubbleHeaderRow}>
                  <Text style={styles.bubbleRole}>
                    {m.role === 'user' ? '👤 You' : `${currentAgent?.icon} ${currentAgent?.name}`}
                  </Text>
                  {m.time ? <Text style={styles.bubbleTime}>{m.time}</Text> : null}
                </View>

                {/* Structured Rich Message Parsing */}
                <FormattedChatMessage content={m.content} role={m.role} />
              </View>
            ))}

            {Boolean(loadingByAgent[activeAgent]) && (
              <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Synthesizing Vedic chart facts...</Text>
              </View>
            )}
          </ScrollView>

          {/* Fixed Chat Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Ask ${currentAgent?.name} about ${activeMeta?.name}...`}
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()} disabled={Boolean(loadingByAgent[activeAgent])}>
              <Text style={styles.sendIcon}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Premium Dialog Modal */}
      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        onViewPlans={() => {
          setPremiumModalVisible(false);
          navigation.navigate('Subscription');
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBarWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBar: {
    maxHeight: 50,
  },
  tabContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLocked: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.background,
    fontWeight: '700',
  },
  tabTextLocked: {
    color: colors.textMuted,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  chartHeaderCard: {
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  highlightVal: {
    color: colors.primary,
    fontWeight: '700',
  },
  loaderBox: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loaderText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableCol: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  planetName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    width: '35%',
  },
  planetSign: {
    color: colors.textSecondary,
    fontSize: 12,
    width: '35%',
  },
  planetHouse: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    width: '30%',
    textAlign: 'right',
  },
  houseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  houseCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
    width: '31%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  houseNum: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  houseSign: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  houseOcc: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  houseOccEmpty: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  yogaRow: {
    marginBottom: 8,
  },
  yogaName: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  yogaDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  dashaBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dashaText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginVertical: 2,
  },
  aiSectionContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  aiSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  tokenPillHeader: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tokenPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  aiActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  btnSaveReport: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSaveReportText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  agentSelectorTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  agentSelectorBar: {
    maxHeight: 60,
    marginBottom: 12,
  },
  agentSelectorContent: {
    paddingRight: 10,
  },
  agentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  agentChipActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderColor: colors.primary,
  },
  agentIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  agentName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  agentNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  agentTitle: {
    color: colors.textMuted,
    fontSize: 10,
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  suggestionsTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionPill: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    color: colors.textPrimary,
    fontSize: 11,
  },
  chatFeed: {
    maxHeight: 320,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatFeedContent: {
    paddingBottom: 10,
  },
  bubble: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    maxWidth: '85%',
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: colors.surfaceLight,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubbleRole: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  bubbleTime: {
    color: colors.textMuted,
    fontSize: 9,
    marginLeft: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    maxHeight: 80,
    fontSize: 13,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendIcon: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
