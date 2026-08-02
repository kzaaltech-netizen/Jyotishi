import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import AgentCard from '../components/AgentCard';
import FormattedChatMessage from '../components/FormattedChatMessage';
import { apiSendAIChat } from '../services/api';
import { useApp } from '../context/AppContext';

const AGENTS = [
  { id: 'general', mode: 'general', name: 'Jyotish', title: 'Natal Guide', domain: 'General natal chart, personality essence' },
  { id: 'career', mode: 'career', name: 'Karma', title: 'Career Agent', domain: 'Professional life, D10 Dashamsha, growth' },
  { id: 'wealth', mode: 'wealth', name: 'Lakshmi', title: 'Wealth Agent', domain: 'Financial patterns, D2 Hora, savings' },
  { id: 'abundance', mode: 'abundance', name: 'Vriddhi', title: 'Abundance Agent', domain: 'Luck, expansion, Jupiter blessings' },
  { id: 'union', mode: 'union', name: 'Mitra', title: 'Union Agent', domain: 'Love, D9 Navamsa, partnership' },
  { id: 'forecast', mode: 'forecast', name: 'Kala', title: 'Forecast Agent', domain: 'Vimshottari Dasha, event timing' },
];

const getTimestamp = () => {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export default function AIChatScreen({ route, navigation }) {
  const { refreshTokens } = useApp();
  const initialMode = route?.params?.initialMode || 'general';

  const [activeMode, setActiveMode] = useState(initialMode);
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

  const scrollRef = useRef(null);

  useEffect(() => {
    if (route?.params?.initialMode) {
      setActiveMode(route.params.initialMode);
    }
  }, [route?.params?.initialMode]);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messagesByAgent, activeMode, loadingByAgent]);

  const handleSend = async () => {
    const targetMode = activeMode;
    const text = input.trim();
    if (!text || loadingByAgent[targetMode]) return;

    const timeStr = getTimestamp();
    const userMsg = { role: 'user', content: text, time: timeStr };

    setMessagesByAgent(prev => ({
      ...prev,
      [targetMode]: [...(prev[targetMode] || []), userMsg],
    }));
    setInput('');
    setLoadingByAgent(prev => ({ ...prev, [targetMode]: true }));

    try {
      const res = await apiSendAIChat(targetMode, text);
      const aiReply = res.reply || res.formatted?.analysis || 'I have analyzed your request.';

      const aiMsg = { role: 'ai', content: aiReply, time: getTimestamp() };
      setMessagesByAgent(prev => ({
        ...prev,
        [targetMode]: [...(prev[targetMode] || []), aiMsg],
      }));
      refreshTokens();
    } catch (e) {
      Alert.alert('AI Request Error', e.message || 'Failed to connect to AI Orchestrator');
    } finally {
      setLoadingByAgent(prev => ({ ...prev, [targetMode]: false }));
    }
  };

  const activeAgent = AGENTS.find(a => a.mode === activeMode);
  const activeMessages = messagesByAgent[activeMode] || [];
  const isCurrentLoading = Boolean(loadingByAgent[activeMode]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <CosmicHeader
        title={`${activeAgent?.name} Agent`}
        subtitle={activeAgent?.title}
        onTokenPress={() => navigation.navigate('TokenWallet')}
      />

      {/* Agent Selector Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.agentSelector} contentContainerStyle={styles.agentSelectorContent}>
        {AGENTS.map(agent => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            title={agent.title}
            domain={agent.domain}
            active={activeMode === agent.mode}
            onPress={() => setActiveMode(agent.mode)}
          />
        ))}
      </ScrollView>

      {/* Chat Messages Feed */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageFeed}
        contentContainerStyle={styles.messageContent}
      >
        {activeMessages.map((m, idx) => (
          <View
            key={idx}
            style={[
              styles.bubble,
              m.role === 'user' ? styles.userBubble : styles.aiBubble
            ]}
          >
            <View style={styles.bubbleHeaderRow}>
              <Text style={styles.bubbleRole}>{m.role === 'user' ? '👤 You' : `✦ ${activeAgent?.name}`}</Text>
              {m.time ? <Text style={styles.bubbleTime}>{m.time}</Text> : null}
            </View>
            <FormattedChatMessage content={m.content} role={m.role} />
          </View>
        ))}

        {isCurrentLoading && (
          <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Synthesizing Vedic chart facts...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Ask ${activeAgent?.name}...`}
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isCurrentLoading}>
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  agentSelector: {
    maxHeight: 110,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  agentSelectorContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageFeed: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubble: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
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
    fontSize: 13,
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendIcon: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
});
