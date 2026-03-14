import { reviewDb, validationDb } from '../db/store';
import { agentService } from './agent.service';
import type { ReputationData } from '@agentbazaar/shared';

export const reputationService = {
  getReputationData(agentId: string): ReputationData | undefined {
    const agent = agentService.getById(agentId);
    if (!agent) return undefined;

    const reviews = reviewDb.findByAgentId(agentId);
    const validations = validationDb.findByAgentId(agentId);

    const helpfulCount = reviews.filter((r) => r.helpful).length;
    const accurateCount = reviews.filter((r) => r.accurate).length;
    const positiveCount = reviews.filter((r) => r.rating >= 4).length;

    const lastValidation = validations
      .filter((v) => v.status === 'verified')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      agentId,
      reputationScore: agent.reputationScore,
      reviewCount: agent.reviewCount,
      positiveCount,
      helpfulRate: reviews.length > 0 ? Math.round((helpfulCount / reviews.length) * 100) : 0,
      accurateRate: reviews.length > 0 ? Math.round((accurateCount / reviews.length) * 100) : 0,
      validated: agent.validated,
      lastValidatedAt: lastValidation?.createdAt ?? null,
      reviews: reviews.slice(0, 20),
      validationRecords: validations,
    };
  },
};
