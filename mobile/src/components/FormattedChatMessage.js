import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export function parseAndCleanText(rawText) {
  if (!rawText) return '';
  let cleaned = String(rawText).trim();

  // 1. Try JSON parse if it looks like a JSON object
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.analysis) cleaned = parsed.analysis;
      else if (parsed.reply) cleaned = parsed.reply;
      else if (parsed.summary) cleaned = parsed.summary;
      else if (parsed.text) cleaned = parsed.text;
    } catch (e) {
      // Continue if parsing failed
    }
  }

  // 2. Strip JSON code block wrappers e.g. ```json ... ```
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .replace(/^JSON:\s*/i, '');

  return cleaned;
}

export default function FormattedChatMessage({ content }) {
  const cleanContent = parseAndCleanText(content);

  // Split content into lines for structured rich-text rendering
  const lines = cleanContent.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={`empty-${idx}`} style={{ height: 6 }} />;
        }

        // Headings (### or ## or #)
        if (trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
          return (
            <Text key={`h-${idx}`} style={styles.heading}>
              {headingText}
            </Text>
          );
        }

        // Bullet points (- or * or •)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[-*•]\s*/, '');
          return (
            <View key={`b-${idx}`} style={styles.bulletRow}>
              <Text style={styles.bulletSymbol}>✦</Text>
              <Text style={styles.bulletText}>
                {renderBoldInline(bulletText, idx)}
              </Text>
            </View>
          );
        }

        // Numbered list (1. 2. etc)
        const numberMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
        if (numberMatch) {
          return (
            <View key={`n-${idx}`} style={styles.bulletRow}>
              <Text style={styles.numberSymbol}>{numberMatch[1]}</Text>
              <Text style={styles.bulletText}>
                {renderBoldInline(numberMatch[2], idx)}
              </Text>
            </View>
          );
        }

        // Normal paragraph text
        return (
          <Text key={`p-${idx}`} style={styles.paragraph}>
            {renderBoldInline(trimmed, idx)}
          </Text>
        );
      })}
    </View>
  );
}

// Helper to render bold text inside paragraphs without raw ** Markdown, with unique keys for all React nodes
function renderBoldInline(text, lineIdx = 0) {
  if (!text || typeof text !== 'string') return text;
  if (!text.includes('**')) {
    return text;
  }

  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <Text key={`bold-${lineIdx}-${i}`} style={styles.boldText}>
          {boldText}
        </Text>
      );
    }
    return <Text key={`txt-${lineIdx}-${i}`}>{part}</Text>;
  });
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  heading: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    marginVertical: 2,
    flexWrap: 'wrap',
  },
  boldText: {
    fontWeight: '700',
    color: colors.primaryLight,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    paddingLeft: 2,
  },
  bulletSymbol: {
    color: colors.primary,
    fontSize: 10,
    marginRight: 6,
    marginTop: 3,
  },
  numberSymbol: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
});
