import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import colors from '../theme/colors';
import CosmicHeader from '../components/CosmicHeader';
import AgentCard from '../components/AgentCard';
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

export default function AIChatScreen({ route, navigation }) {
  const { refreshTokens } = useApp();
  const initialMode = route?.params?.initialMode || 'general';

  const [activeMode, setActiveMode] = useState(initialMode);
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Greetings! I am your AI Astrology Guide. Ask me anything about your birth chart and planetary placements.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (route?.params?.initialMode) {
      setActiveMode(route.params.initialMode);
    }
  }, [route?.params?.initialMode]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiSendAIChat(activeMode, text);
      const aiReply = res.reply || res.formatted?.analysis || 'I have analyzed your request.';
      setMessages(prev => [...prev, { role: 'ai', content: aiReply }]);
      refreshTokens();
    } catch (e) {
      Alert.alert('AI Request Error', e.message || 'Failed to connect to AI Orchestrator');
    } finally {
      setLoading(false);
    }
  };

  const activeAgent = AGENTS.find(a => a.mode === activeMode);

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
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, idx) => (
          <View
            key={idx}
            style={[
              styles.bubble,
              m.role === 'user' ? styles.userBubble : styles.aiBubble
            ]}
          >
            <Text style={styles.bubbleRole}>{m.role === 'user' ? 'You' : activeAgent?.name}</Text>
            <Text style={styles.bubbleText}>{m.content}</Text>
          </View>
        ))}

        {loading && (
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
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
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
  bubbleRole: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
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
