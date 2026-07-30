import JyotishAgent from './JyotishAgent.js';
import KarmaAgent from './KarmaAgent.js';
import LakshmiAgent from './LakshmiAgent.js';
import VriddhiAgent from './VriddhiAgent.js';
import MitraAgent from './MitraAgent.js';
import KalaAgent from './KalaAgent.js';

export const AGENT_REGISTRY = {
  general: JyotishAgent,
  jyotish: JyotishAgent,

  career: KarmaAgent,
  karma: KarmaAgent,

  wealth: LakshmiAgent,
  lakshmi: LakshmiAgent,

  abundance: VriddhiAgent,
  vriddhi: VriddhiAgent,

  union: MitraAgent,
  mitra: MitraAgent,

  forecast: KalaAgent,
  kala: KalaAgent,
};

export function getAgent(modeOrId) {
  const key = String(modeOrId || 'general').toLowerCase();
  const agentClass = AGENT_REGISTRY[key] || AGENT_REGISTRY.general;
  return agentClass;
}

export function getAllAgents() {
  return [JyotishAgent, KarmaAgent, LakshmiAgent, VriddhiAgent, MitraAgent, KalaAgent];
}
