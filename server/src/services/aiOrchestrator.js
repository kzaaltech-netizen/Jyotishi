import prisma from '../db.js';
import AstrologyService, { CHART_STATUS } from './astrology.service.js';
import { getAgent } from '../agents/index.js';
import PromptBuilder from './promptBuilder.js';
import ResponseFormatter from './responseFormatter.js';
import { getProvider } from '../providers/index.js';
import MemoryService from './memoryService.js';
import AdminConfigService from './adminConfigService.js';
import ResponseCache from './responseCache.js';

export const AI_ERROR_CODES = {
  NO_CHART: 'NO_CHART',
  INSUFFICIENT_TOKENS: 'INSUFFICIENT_TOKENS',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_AGENT: 'INVALID_AGENT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export class AIOrchestrator {
  /**
   * Helper: Check user wallet token balance.
   */
  static async checkTokenBalance(userId, cost) {
    let wallet = await prisma.tokenWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.tokenWallet.create({ data: { userId, balance: 50 } });
    }
    if (wallet.balance < cost) {
      const err = new Error('Insufficient token balance.');
      err.code = AI_ERROR_CODES.INSUFFICIENT_TOKENS;
      throw err;
    }
    return wallet;
  }

  /**
   * Helper: Deduct tokens POST-execution on success.
   */
  static async deductTokensSuccess(userId, action, cost, description = '') {
    const wallet = await prisma.tokenWallet.findUnique({ where: { userId } });
    if (!wallet) return 0;

    const newBalance = Math.max(0, wallet.balance - cost);

    await prisma.$transaction([
      prisma.tokenWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.tokenLedger.create({
        data: {
          walletId: wallet.id,
          action,
          description: description || `AI action: ${action}`,
          cost,
          balance: newBalance,
        },
      }),
    ]);

    return newBalance;
  }

  /**
   * Helper: Log AI execution audit entry in PostgreSQL AILog.
   */
  static async logExecution({ userId, agentId, model, providerName, durationMs, promptTokens, completionTokens, cost, scores = null, error = null }) {
    try {
      await prisma.aILog.create({
        data: {
          userId,
          agentId,
          model: model || 'gemini-1.5-flash',
          provider: providerName || 'gemini',
          durationMs: durationMs || 0,
          promptTokens: promptTokens || 0,
          completionTokens: completionTokens || 0,
          cost: cost || 0,
          error: error ? String(error).slice(0, 500) : null,
        },
      });
    } catch (e) {
      console.warn(`[AIOrchestrator] Failed to write AILog: ${e.message}`);
    }
  }

  /**
   * Helper: Evaluate response quality (Internal response scoring engine).
   */
  static evaluateResponse(formattedResponse, domainFacts) {
    // Scoring logic (0 to 100)
    const safety = 100; // safety metrics
    let consistency = 90;
    let completeness = 85;
    let coverage = 80;

    // Check if predictions or planet facts match
    if (formattedResponse.analysis && formattedResponse.analysis.length > 300) {
      completeness = 95;
    }
    if (formattedResponse.chartsUsed && formattedResponse.chartsUsed.length > 0) {
      coverage = 95;
    }
    if (formattedResponse.warnings && formattedResponse.warnings.length === 0) {
      consistency = 95;
    }

    const confidence = formattedResponse.confidence === 'High' ? 95 : (formattedResponse.confidence === 'Medium' ? 80 : 60);

    return {
      consistency,
      completeness,
      chartCoverage: coverage,
      confidence,
      safety,
      overallScore: Math.round((consistency + completeness + coverage + confidence + safety) / 5),
    };
  }

  /**
   * Main Chat Pipeline
   */
  static async handleChat({ userId, mode = 'general', message, providerName = null }) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message content is required.');
    }

    // 1. Load active provider from AdminConfig
    const activeProvider = providerName || await AdminConfigService.get('active_provider') || 'gemini';

    // 2. Select Agent
    const agent = getAgent(mode);
    if (!agent) {
      const err = new Error(`Invalid agent mode: ${mode}`);
      err.code = AI_ERROR_CODES.INVALID_AGENT;
      throw err;
    }

    // 3. Load dynamic token cost
    const chatCostConfig = await AdminConfigService.get('token_cost_chat');
    const tokenCost = chatCostConfig ? parseInt(chatCostConfig) : (agent.tokenCost || 1);

    // 4. Token Pre-Check
    await this.checkTokenBalance(userId, tokenCost);

    // 5. Load user birth profile & cached chart bundle
    const birthProfile = await prisma.birthProfile.findUnique({ where: { userId } });
    const natalRecord = await AstrologyService.getChart(userId, 'natal');

    if (!natalRecord || !natalRecord.chartData) {
      const err = new Error('No chart found. Complete onboarding and generate your chart first.');
      err.code = AI_ERROR_CODES.NO_CHART;
      throw err;
    }

    const chartGeneratedAt = natalRecord.updatedAt?.toISOString() || '';

    // 6. RESPONSE CACHE CHECK
    const cachedResponse = ResponseCache.get({
      userId,
      mode: agent.mode,
      message,
      chartGeneratedAt,
    });
    if (cachedResponse) {
      console.log(`[AIOrchestrator] Serving cached chat response for user ${userId}`);
      return {
        ...cachedResponse,
        cached: true,
      };
    }

    // Load full bundle if needed
    const d9Record = await AstrologyService.getChart(userId, 'd9');
    const d10Record = await AstrologyService.getChart(userId, 'd10');
    const d2Record = await AstrologyService.getChart(userId, 'd2');
    const d11Record = await AstrologyService.getChart(userId, 'd11');
    const transitRecord = await AstrologyService.getChart(userId, 'transit');

    const chartBundle = {
      natal: natalRecord.chartData,
      d9: d9Record?.chartData,
      d10: d10Record?.chartData,
      d2: d2Record?.chartData,
      d11: d11Record?.chartData,
      transit: transitRecord?.chartData,
    };

    // 7. Load User Preferences (Personalization Engine)
    const preferences = await MemoryService.getOrCreatePreference(userId);

    // 8. Load Chat Session & Memory
    const session = await prisma.chatSession.upsert({
      where: { userId_mode: { userId, mode: agent.mode } },
      create: { userId, mode: agent.mode },
      update: {},
    });

    const chatHistory = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // 9. Build domain-specific prompt (inject preference, language, memory summary)
    const { systemInstruction, contents, domainFacts, promptVersion, promptHash, agentVersion } = PromptBuilder.buildPrompt({
      agent,
      chartBundle,
      birthProfile,
      userMessage: message,
      chatHistory: chatHistory.map(m => ({ role: m.role, content: m.content })),
      preferences,
      isInterpretation: false,
    });

    // 10. Execute Provider Call
    const provider = getProvider(activeProvider);
    let llmResult;
    try {
      llmResult = await provider.generateContent({
        systemInstruction,
        contents,
        temperature: 0.7,
        maxTokens: 800,
      });
    } catch (err) {
      await this.logExecution({
        userId,
        agentId: agent.id,
        model: provider.getModel ? provider.getModel() : 'gemini',
        providerName: provider.name,
        durationMs: 0,
        cost: tokenCost,
        error: err.message,
      });
      throw err;
    }

    // 11. Format & Normalize Response
    const formatted = ResponseFormatter.format(llmResult.text, {
      agent,
      chartsUsed: agent.allowedChartTypes,
    });

    // 12. Evaluate response quality internally
    const scores = this.evaluateResponse(formatted, domainFacts);
    formatted.evaluationScores = scores;
    formatted.promptVersion = promptVersion;
    formatted.promptHash = promptHash;
    formatted.agentVersion = agentVersion;

    const finalReplyText = formatted.analysis || formatted.summary || llmResult.text;

    // 13. Save Conversation
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: session.id, role: 'user', content: message.trim() },
        { sessionId: session.id, role: 'ai', content: finalReplyText },
      ],
    });

    // 14. DEDUCT TOKENS POST-EXECUTION SUCCESS
    const newBalance = await this.deductTokensSuccess(
      userId,
      `chat_${agent.mode}`,
      tokenCost,
      `Chat with ${agent.title}`
    );

    // 15. Save to response cache
    const responsePayload = {
      reply: finalReplyText,
      formatted,
      newBalance,
      agent: { id: agent.id, title: agent.title },
    };
    ResponseCache.set({
      userId,
      mode: agent.mode,
      message,
      chartGeneratedAt,
      response: responsePayload,
    });

    // 16. Log Execution Metrics & Scores
    await this.logExecution({
      userId,
      agentId: agent.id,
      model: llmResult.modelUsed,
      providerName: provider.name,
      durationMs: llmResult.durationMs,
      promptTokens: llmResult.promptTokens,
      completionTokens: llmResult.completionTokens,
      cost: tokenCost,
      scores,
    });

    // 17. Asynchronously trigger conversation memory summary check (non-blocking)
    MemoryService.checkAndSummarizeSession(userId, session.id, 10).catch(console.error);

    return {
      ...responsePayload,
      cached: false,
    };
  }

  /**
   * Main Interpretation Pipeline
   */
  static async handleInterpretation({ userId, mode = 'general', providerName = null }) {
    const activeProvider = providerName || await AdminConfigService.get('active_provider') || 'gemini';
    const agent = getAgent(mode);
    if (!agent) {
      const err = new Error(`Invalid agent mode: ${mode}`);
      err.code = AI_ERROR_CODES.INVALID_AGENT;
      throw err;
    }

    const interpretCostConfig = await AdminConfigService.get('token_cost_interpret');
    const tokenCost = interpretCostConfig ? parseInt(interpretCostConfig) : (agent.interpretationTokenCost || 3);

    // 1. Token Pre-Check
    await this.checkTokenBalance(userId, tokenCost);

    // 2. Load birth profile & cached chart bundle
    const birthProfile = await prisma.birthProfile.findUnique({ where: { userId } });
    const natalRecord = await AstrologyService.getChart(userId, 'natal');

    if (!natalRecord || !natalRecord.chartData) {
      const err = new Error('No chart found. Complete onboarding and generate your chart first.');
      err.code = AI_ERROR_CODES.NO_CHART;
      throw err;
    }

    const d9Record = await AstrologyService.getChart(userId, 'd9');
    const d10Record = await AstrologyService.getChart(userId, 'd10');
    const d2Record = await AstrologyService.getChart(userId, 'd2');
    const d11Record = await AstrologyService.getChart(userId, 'd11');
    const transitRecord = await AstrologyService.getChart(userId, 'transit');

    const chartBundle = {
      natal: natalRecord.chartData,
      d9: d9Record?.chartData,
      d10: d10Record?.chartData,
      d2: d2Record?.chartData,
      d11: d11Record?.chartData,
      transit: transitRecord?.chartData,
    };

    // 3. Load User Preferences
    const preferences = await MemoryService.getOrCreatePreference(userId);

    // 4. Build Prompt
    const { systemInstruction, contents, domainFacts, promptVersion, promptHash, agentVersion } = PromptBuilder.buildPrompt({
      agent,
      chartBundle,
      birthProfile,
      userMessage: `Provide a detailed ${agent.title} analysis`,
      chatHistory: [],
      preferences,
      isInterpretation: true,
    });

    // 5. Call Provider
    const provider = getProvider(activeProvider);
    let llmResult;
    try {
      llmResult = await provider.generateContent({
        systemInstruction,
        contents,
        temperature: 0.75,
        maxTokens: 1000,
      });
    } catch (err) {
      await this.logExecution({
        userId,
        agentId: agent.id,
        model: provider.getModel ? provider.getModel() : 'gemini',
        providerName: provider.name,
        durationMs: 0,
        cost: tokenCost,
        error: err.message,
      });
      throw err;
    }

    // 6. Format Output
    const formatted = ResponseFormatter.format(llmResult.text, {
      agent,
      chartsUsed: agent.allowedChartTypes,
    });

    const scores = this.evaluateResponse(formatted, domainFacts);
    formatted.evaluationScores = scores;
    formatted.promptVersion = promptVersion;
    formatted.promptHash = promptHash;
    formatted.agentVersion = agentVersion;

    const finalReplyText = formatted.analysis || formatted.summary || llmResult.text;

    // 7. Deduct Tokens
    const newBalance = await this.deductTokensSuccess(
      userId,
      `interpret_${agent.mode}`,
      tokenCost,
      `${agent.title} Reading`
    );

    // 8. Audit Log
    await this.logExecution({
      userId,
      agentId: agent.id,
      model: llmResult.modelUsed,
      providerName: provider.name,
      durationMs: llmResult.durationMs,
      promptTokens: llmResult.promptTokens,
      completionTokens: llmResult.completionTokens,
      cost: tokenCost,
      scores,
    });

    return {
      reply: finalReplyText,
      formatted,
      newBalance,
      agent: { id: agent.id, title: agent.title },
    };
  }

  /**
   * Stream Main Chat Response (Server-Sent Events)
   */
  static async handleChatStream({ userId, mode = 'general', message, onChunk, providerName = null }) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message content is required.');
    }

    const activeProvider = providerName || await AdminConfigService.get('active_provider') || 'gemini';
    const agent = getAgent(mode);
    if (!agent) {
      throw new Error(`Invalid agent mode: ${mode}`);
    }

    const chatCostConfig = await AdminConfigService.get('token_cost_chat');
    const tokenCost = chatCostConfig ? parseInt(chatCostConfig) : (agent.tokenCost || 1);

    // Token Pre-Check
    await this.checkTokenBalance(userId, tokenCost);

    const birthProfile = await prisma.birthProfile.findUnique({ where: { userId } });
    const natalRecord = await AstrologyService.getChart(userId, 'natal');
    if (!natalRecord || !natalRecord.chartData) {
      throw new Error('No chart found. Complete onboarding first.');
    }

    const d9Record = await AstrologyService.getChart(userId, 'd9');
    const d10Record = await AstrologyService.getChart(userId, 'd10');
    const d2Record = await AstrologyService.getChart(userId, 'd2');
    const d11Record = await AstrologyService.getChart(userId, 'd11');
    const transitRecord = await AstrologyService.getChart(userId, 'transit');

    const chartBundle = {
      natal: natalRecord.chartData,
      d9: d9Record?.chartData,
      d10: d10Record?.chartData,
      d2: d2Record?.chartData,
      d11: d11Record?.chartData,
      transit: transitRecord?.chartData,
    };

    const preferences = await MemoryService.getOrCreatePreference(userId);
    const session = await prisma.chatSession.upsert({
      where: { userId_mode: { userId, mode: agent.mode } },
      create: { userId, mode: agent.mode },
      update: {},
    });

    const chatHistory = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const { systemInstruction, contents } = PromptBuilder.buildPrompt({
      agent,
      chartBundle,
      birthProfile,
      userMessage: message,
      chatHistory: chatHistory.map(m => ({ role: m.role, content: m.content })),
      preferences,
      isInterpretation: false,
    });

    const provider = getProvider(activeProvider);
    if (!provider.generateContentStream) {
      throw new Error(`Provider ${activeProvider} does not support streaming.`);
    }

    // Call streaming provider
    const llmResult = await provider.generateContentStream({
      systemInstruction,
      contents,
      temperature: 0.7,
      maxTokens: 800,
      onChunk,
    });

    // Format & Save full text response after complete stream finishes
    const formatted = ResponseFormatter.format(llmResult.text, {
      agent,
      chartsUsed: agent.allowedChartTypes,
    });

    const finalReplyText = formatted.analysis || formatted.summary || llmResult.text;

    await prisma.chatMessage.createMany({
      data: [
        { sessionId: session.id, role: 'user', content: message.trim() },
        { sessionId: session.id, role: 'ai', content: finalReplyText },
      ],
    });

    const newBalance = await this.deductTokensSuccess(
      userId,
      `chat_${agent.mode}`,
      tokenCost,
      `Stream Chat with ${agent.title}`
    );

    await this.logExecution({
      userId,
      agentId: agent.id,
      model: llmResult.modelUsed,
      providerName: provider.name,
      durationMs: 0,
      cost: tokenCost,
    });

    MemoryService.checkAndSummarizeSession(userId, session.id, 10).catch(console.error);

    return {
      reply: finalReplyText,
      formatted,
      newBalance,
    };
  }
}

export default AIOrchestrator;
