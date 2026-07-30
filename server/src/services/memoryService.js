import prisma from '../db.js';
import { getProvider } from '../providers/index.js';

export class MemoryService {
  /**
   * Get or create UserPreference for a user.
   */
  static async getOrCreatePreference(userId) {
    let pref = await prisma.userPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await prisma.userPreference.create({
        data: {
          userId,
          personality: 'Balanced',
          language: 'English',
          goals: '',
          importantQuestions: '',
          summaries: '',
        },
      });
    }
    return pref;
  }

  /**
   * Update user preference settings.
   */
  static async updatePreference(userId, data) {
    const pref = await this.getOrCreatePreference(userId);
    return prisma.userPreference.update({
      where: { id: pref.id },
      data: {
        personality: data.personality || pref.personality,
        language: data.language || pref.language,
        communicationStyle: data.communicationStyle || pref.communicationStyle,
        goals: Array.isArray(data.goals) ? data.goals.join(',') : (data.goals || pref.goals),
        importantQuestions: Array.isArray(data.importantQuestions) ? data.importantQuestions.join(',') : (data.importantQuestions || pref.importantQuestions),
        summaries: data.summaries || pref.summaries,
      },
    });
  }

  /**
   * Add a key question or life goal to user memory.
   */
  static async rememberKeyFact(userId, key, value) {
    const pref = await this.getOrCreatePreference(userId);
    if (key === 'goal') {
      const current = pref.goals ? pref.goals.split(',') : [];
      if (!current.includes(value)) {
        current.push(value);
        await this.updatePreference(userId, { goals: current });
      }
    } else if (key === 'question') {
      const current = pref.importantQuestions ? pref.importantQuestions.split(',') : [];
      if (!current.includes(value)) {
        current.push(value);
        await this.updatePreference(userId, { importantQuestions: current });
      }
    }
  }

  /**
   * Check message count and summarize conversation when limit exceeded.
   * Archives older messages to keep the session history clean and compact.
   */
  static async checkAndSummarizeSession(userId, sessionId, limit = 10) {
    const messageCount = await prisma.chatMessage.count({ where: { sessionId } });
    if (messageCount <= limit) return;

    console.log(`[MemoryService] Summarizing session ${sessionId} (Count: ${messageCount} > Limit: ${limit})`);

    // Fetch all messages in the session
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    // Generate summary via Gemini Provider
    const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
    const systemPrompt = `You are a conversation summarization bot. Summarize the chat history below between the user and their personal Vedic astrologer. Focus on key life areas discussed (e.g. career changes, relationships, financial worries) and any specific chart insights. Keep the summary under 150 words.`;
    
    const provider = getProvider('gemini');
    let summaryText = '';
    try {
      const result = await provider.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: 'user', parts: [{ text: `Summarize this conversation:\n\n${historyText}` }] }],
        temperature: 0.3,
        maxTokens: 300,
      });
      summaryText = result.text;
      console.log(`[MemoryService] Generated Summary: ${summaryText}`);
    } catch (e) {
      console.warn(`[MemoryService] Summarization failed, using text snippet fallback: ${e.message}`);
      summaryText = `Snippet summary of recent topics: ${historyText.slice(0, 200)}...`;
    }

    // Save summary to UserPreference memory
    const pref = await this.getOrCreatePreference(userId);
    let combinedSummaries = pref.summaries ? pref.summaries + '\n' + summaryText : summaryText;
    // Cap summaries length
    if (combinedSummaries.length > 2000) {
      combinedSummaries = combinedSummaries.slice(-2000);
    }
    await this.updatePreference(userId, { summaries: combinedSummaries });

    // Keep only the last 4 messages and delete older ones (archiving them in memory summary)
    const keepIds = messages.slice(-4).map(m => m.id);
    await prisma.chatMessage.deleteMany({
      where: {
        sessionId,
        id: { notIn: keepIds },
      },
    });

    console.log(`[MemoryService] Truncated chat messages. Retained latest ${keepIds.length} messages.`);
  }
}

export default MemoryService;
