import type { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { taskDb } from '../db/store';

export const reviewController = {
  create(req: Request, res: Response): void {
    const { taskId, agentId, rating, helpful, accurate, comment } = req.body as {
      taskId?: string;
      agentId?: string;
      rating?: number;
      helpful?: boolean;
      accurate?: boolean;
      comment?: string;
    };

    if (!taskId || !agentId || rating === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: taskId, agentId, rating',
        code: 'INVALID_REQUEST',
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
        code: 'INVALID_RATING',
      });
      return;
    }

    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId || 'anonymous';

    // Verify the requester owns this task (sessionId must match)
    const task = taskDb.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found', code: 'TASK_NOT_FOUND' });
      return;
    }
    if (task.sessionId !== sessionId) {
      res.status(403).json({ success: false, error: 'You can only review tasks you submitted', code: 'FORBIDDEN' });
      return;
    }
    if (task.status !== 'completed') {
      res.status(422).json({ success: false, error: 'Can only review completed tasks', code: 'TASK_NOT_COMPLETED' });
      return;
    }

    // Idempotency: one review per task
    if (reviewService.existsForTask(taskId)) {
      res.status(409).json({
        success: false,
        error: 'Review already exists for this task',
        code: 'REVIEW_ALREADY_EXISTS',
      });
      return;
    }

    const reviewerAddress = sessionId;

    const review = reviewService.create({
      taskId,
      agentId,
      reviewerAddress,
      rating,
      helpful: helpful ?? false,
      accurate: accurate ?? false,
      comment: comment ?? '',
    });

    res.status(201).json({ success: true, data: review });
  },

  getByAgentId(req: Request, res: Response): void {
    const { agentId } = req.params;
    const reviews = reviewService.getByAgentId(agentId);
    res.json({ success: true, data: reviews });
  },
};
