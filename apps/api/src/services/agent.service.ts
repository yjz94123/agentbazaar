import { agentDb } from '../db/store';
import type { Agent } from '@agentbazaar/shared';

export const agentService = {
  getAll(): Agent[] {
    return agentDb.findAll();
  },

  getById(id: string): Agent | undefined {
    return agentDb.findById(id);
  },

  getBySlug(slug: string): Agent | undefined {
    return agentDb.findBySlug(slug);
  },

  incrementCallCount(agentId: string): void {
    const agent = agentDb.findById(agentId);
    if (agent) {
      agentDb.update(agentId, { callCount: agent.callCount + 1 });
    }
  },

  updateReputation(agentId: string, newScore: number, newCount: number): void {
    agentDb.update(agentId, {
      reputationScore: newScore,
      reviewCount: newCount,
    });
  },

  // Dynamic pricing based on reputation score
  getDynamicPrice(agent: Agent): string {
    const base = parseFloat(agent.price);
    let multiplier = 1.0;

    if (!agent.validated) {
      multiplier = 1.3;
    } else if (agent.reputationScore >= 4.5) {
      multiplier = 0.8;
    } else if (agent.reputationScore >= 3.5) {
      multiplier = 1.0;
    } else if (agent.reputationScore >= 2.5) {
      multiplier = 1.2;
    } else {
      multiplier = 1.5;
    }

    return (base * multiplier).toFixed(4);
  },
};
