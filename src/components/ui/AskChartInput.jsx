import React, { useState } from 'react';
import './AskChartInput.css';

const SUGGESTED_QUESTIONS = [
  { label: 'Love', icon: 'favorite', query: 'What does my 7th house reveal about my romantic future?', category: 'union' },
  { label: 'Career', icon: 'work', query: 'What career direction aligns best with my Sun & 10th house?', category: 'career' },
  { label: 'Money', icon: 'payments', query: 'How does Jupiter impact my wealth & financial stability?', category: 'wealth' },
  { label: 'Current Phase', icon: 'auto_awesome', query: 'What major lessons or opportunities does my active Dasha bring?', category: 'general' },
  { label: 'Marriage', icon: 'diversity_1', query: 'When is my most auspicious timing for partnership or marriage?', category: 'union' },
  { label: 'Personal Growth', icon: 'eco', query: 'What are my soul gifts and biggest growth challenges?', category: 'abundance' },
];

export default function AskChartInput({ onAskQuestion }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onAskQuestion) {
      onAskQuestion(query.trim());
    }
  };

  const handleChipClick = (q) => {
    if (onAskQuestion) {
      onAskQuestion(q.query, q.category);
    }
  };

  return (
    <div className="ask-chart-card card">
      <div className="ask-chart-header">
        <div className="ask-chart-icon-badge">
          <span className="material-symbols-outlined icon-filled">auto_awesome</span>
        </div>
        <div>
          <h2 className="title-md text-on-surface">Ask Your Chart</h2>
          <p className="body-md text-muted">What would you like to understand?</p>
        </div>
      </div>

      <form className="ask-chart-form" onSubmit={handleSubmit}>
        <div className="ask-input-wrapper">
          <input
            type="text"
            className="ask-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your life, path, or timing..."
          />
          <button
            type="submit"
            className="ask-submit-btn"
            disabled={!query.trim()}
            title="Ask Your Chart"
          >
            <span className="material-symbols-outlined icon-filled">arrow_forward</span>
          </button>
        </div>
      </form>

      <div className="suggested-questions-wrap">
        <span className="label-sm text-muted suggested-label">Suggested Questions:</span>
        <div className="suggested-chips">
          {SUGGESTED_QUESTIONS.map((item) => (
            <button
              key={item.label}
              className="suggested-chip"
              onClick={() => handleChipClick(item)}
            >
              <span className="chip-icon material-symbols-outlined">{item.icon}</span>
              <span className="chip-text">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
