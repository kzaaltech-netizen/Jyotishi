// Older replies sometimes arrive as raw JSON or fenced code. Turn them into plain text.
export function formatMessageContent(content) {
  if (!content) return '';
  let text = String(content).trim();

  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      const parts = [];
      if (parsed.title) parts.push(`### ${parsed.title}`);
      if (parsed.answer) parts.push(parsed.answer);
      else if (parsed.summary) parts.push(parsed.summary);
      if (parsed.analysis && parsed.analysis !== parsed.answer) parts.push(parsed.analysis);
      else if (parsed.reply) parts.push(parsed.reply);
      if (parts.length) text = parts.join('\n\n');
    } catch {
      const pick = (key) => text.match(new RegExp(`"${key}"\\s*:\\s*"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"?`))?.[1];
      const unescape = (s) => s?.replace(/\\"/g, '"').replace(/\\n/g, '\n');
      const parts = [];
      const title = pick('title');
      if (title) parts.push(`### ${title}`);
      const answer = unescape(pick('answer')) || pick('summary');
      if (answer) parts.push(answer);
      const analysis = unescape(pick('analysis'));
      if (analysis) parts.push(analysis);
      if (parts.length) text = parts.join('\n\n');
    }
  }

  return text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
}

export function formatDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
