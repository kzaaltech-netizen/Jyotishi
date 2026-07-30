import prisma from '../db.js';

export class AdminConfigService {
  static defaults = {
    gemini_model: 'gemini-1.5-flash',
    token_cost_chat: '1',
    token_cost_interpret: '3',
    active_provider: 'gemini',
    daily_limit: '20',
    premium_limit: '100',
    enable_all_agents: 'true',
  };

  /**
   * Get dynamic config value by key.
   * Fallback to defaults or env.
   */
  static async get(key) {
    try {
      const config = await prisma.adminConfig.findUnique({ where: { key } });
      if (config) return config.value;
    } catch (e) {
      console.warn(`[AdminConfigService] Failed to read db key ${key}: ${e.message}`);
    }

    // Fallback to process.env or hardcoded defaults
    const envKey = `ADMIN_${key.toUpperCase()}`;
    return process.env[envKey] || this.defaults[key] || '';
  }

  /**
   * Set dynamic config value.
   */
  static async set(key, value) {
    return prisma.adminConfig.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }

  /**
   * List all current configurations.
   */
  static async list() {
    const dbConfigs = await prisma.adminConfig.findMany();
    const configMap = { ...this.defaults };
    dbConfigs.forEach(c => {
      configMap[c.key] = c.value;
    });
    return configMap;
  }
}

export default AdminConfigService;
