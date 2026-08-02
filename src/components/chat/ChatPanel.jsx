import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useTokens } from '../../context/TokenContext.jsx';
import { apiSendAIChat, apiGetChatHistory, apiClearChat } from '../../lib/api.js';
import './ChatPanel.css';

const MODE_CONFIG = {
  general:   { agent: 'Jyotish',  title: 'Aetheric Guide',   icon: 'auto_awesome',     placeholder: 'Ask about your natal chart, personality, life themes…', color: 'gold' },
  career:    { agent: 'Karma',    title: 'Career Oracle',    icon: 'work',              placeholder: 'Ask about career direction, promotions, work timing…', color: 'teal' },
  wealth:    { agent: 'Lakshmi', title: 'Wealth Oracle',    icon: 'payments',          placeholder: 'Ask about income, savings, financial patterns…', color: 'violet' },
  abundance: { agent: 'Vriddhi', title: 'Abundance Oracle', icon: 'eco',               placeholder: 'Ask about prosperity, luck, growth opportunities…', color: 'gold' },
  union:     { agent: 'Mitra',   title: 'Union Oracle',     icon: 'favorite',          placeholder: 'Ask about love, marriage, relationship timing…', color: 'violet' },
  forecast:  { agent: 'Kala',    title: 'Forecast Oracle',  icon: 'timeline',          placeholder: 'Ask about upcoming events, Dasha timing, life periods…', color: 'teal' },
};

function formatMessageContent(content) {
  if (!content) return '';
  let text = String(content).trim();

  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      let parts = [];
      if (parsed.title) parts.push(`### ${parsed.title}`);
      if (parsed.summary) parts.push(parsed.summary);
      if (parsed.analysis) parts.push(parsed.analysis);
      else if (parsed.reply) parts.push(parsed.reply);
      if (parts.length > 0) {
        text = parts.join('\n\n');
      }
    } catch (e) {
      const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
      const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/);
      const analysisMatch = text.match(/"analysis"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/);

      let parts = [];
      if (titleMatch) parts.push(`### ${titleMatch[1]}`);
      if (summaryMatch) parts.push(summaryMatch[1]);
      if (analysisMatch) parts.push(analysisMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));

      if (parts.length > 0) {
        text = parts.join('\n\n');
      }
    }
  }

  return text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
}

export default function ChatPanel({ mode = 'general' }) {
  const { setCurrentPage } = useApp();
  const { balance, hasTokens, reload: reloadTokens } = useTokens();
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.general;

  const [messages, setMessages] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const feedRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Load chat history from API on mount / mode change
  useEffect(() => {
    setHistoryLoaded(false);
    setMessages([]);
    setError(null);
    setInput('');
    apiGetChatHistory(mode)
      .then(msgs => { setMessages(msgs); setHistoryLoaded(true); })
      .catch(() => setHistoryLoaded(true));
  }, [mode]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    if (!hasTokens('chat_message')) {
      setCurrentPage('buy-tokens');
      return;
    }

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const { reply } = await apiSendAIChat(mode, text);
      const aiMsg = { role: 'ai', content: reply, timestamp: new Date().toISOString() };
      setMessages([...next, aiMsg]);
      reloadTokens();
    } catch (err) {
      setError(err.message || 'AI request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([]);
    apiClearChat(mode).catch(() => {});
  };

  const colorClass = cfg.color;

  return (
    <div className="chat-panel card">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-agent">
          <div className={`agent-icon agent-icon-${colorClass}`}>
            <span className="material-symbols-outlined icon-filled">{cfg.icon}</span>
          </div>
          <div className="agent-info">
            <span className="title-sm text-on-surface">{cfg.title}</span>
            <span className="label-sm text-muted">{cfg.agent} · {mode} mode</span>
          </div>
        </div>
        <div className="chat-header-right">
          <span className="live-dot" />
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat} title="Clear chat">
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-feed" ref={feedRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className={`empty-icon empty-icon-${colorClass}`}>
              <span className="material-symbols-outlined icon-filled">{cfg.icon}</span>
            </div>
            <p className="body-md text-muted text-balance">
              {cfg.agent} is ready. Ask anything about your {mode === 'general' ? 'birth chart' : mode + ' chart'}.
            </p>
            <div className="starter-chips">
              {getStarterQuestions(mode).map(q => (
                <button key={q} className="starter-chip" onClick={() => { setInput(q); inputRef.current?.focus(); }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
            {msg.role === 'ai' && (
              <div className={`msg-avatar agent-icon-${colorClass}`}>
                <span className="material-symbols-outlined">{cfg.icon}</span>
              </div>
            )}
            <div className={`msg-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
              <p className="body-md" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {formatMessageContent(msg.content)}
              </p>
              <span className="msg-time label-sm text-muted">
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-ai">
            <div className={`msg-avatar agent-icon-${colorClass}`}>
              <span className="material-symbols-outlined">{cfg.icon}</span>
            </div>
            <div className="msg-bubble bubble-ai typing-bubble">
              <span className="typing-dot" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        {error && (
          <div className="chat-error">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="token-cost-hint label-sm text-muted">
          <span className="material-symbols-outlined">toll</span>
          1 token per message · {balance} remaining
        </div>
        <div className="chat-input-row">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={cfg.placeholder}
            className="chat-input"
            disabled={isLoading}
          />
          <button
            className={`send-btn send-btn-${colorClass}`}
            onClick={send}
            disabled={!input.trim() || isLoading}
            title="Send"
          >
            <span className="material-symbols-outlined icon-filled">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function getStarterQuestions(mode) {
  const map = {
    general:   ['What does my Lagna reveal about me?', 'What are my biggest strengths?', 'What life themes does my chart show?'],
    career:    ['What careers suit my chart?', 'When is my next career peak?', 'What does my 10th house say?'],
    wealth:    ['What is my wealth potential?', 'How can I improve my finances?', 'What does Jupiter say about my income?'],
    abundance: ['When will abundance increase for me?', 'What areas bring me luck?', 'How do my 9th and 5th houses look?'],
    union:     ['What does my 7th house reveal?', 'When might I meet my partner?', 'What kind of partner suits me?'],
    forecast:  ['What does my current Dasha mean?', 'What are my next 6 months like?', 'Any caution periods coming up?'],
  };
  return map[mode] || map.general;
}
