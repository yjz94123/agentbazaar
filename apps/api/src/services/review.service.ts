import { v4 as uuidv4 } from 'uuid';
import { reviewDb } from '../db/store';
import { agentService } from './agent.service';
import type { Review } from '@agentbazaar/shared';

export const reviewService = {
  create(data: {
    taskId: string;
    agentId: string;
    reviewerAddress: string;
    rating: number;
    helpful: boolean;
    accurate: boolean;
    comment: string;
  }): Review {
    const review: Review = {
      id: `review-${uuidv4()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    reviewDb.save(review);

    // Update agent reputation
    this.updateAgentReputation(data.agentId);

    return review;
  },

  getByAgentId(agentId: string): Review[] {
    return reviewDb
      .findByAgentId(agentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  existsForTask(taskId: string): boolean {
    return !!reviewDb.findByTaskId(taskId);
  },

  updateAgentReputation(agentId: string): void {
    const reviews = reviewDb.findByAgentId(agentId);
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgScore = Math.round((totalRating / reviews.length) * 10) / 10;

    agentService.updateReputation(agentId, avgScore, reviews.length);
  },
};
