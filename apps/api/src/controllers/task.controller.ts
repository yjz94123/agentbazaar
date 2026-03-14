import type { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { taskDb } from '../db/store';

export const taskController = {
  async create(req: Request, res: Response): Promise<void> {
    const { agentId, taskType, input, parentTaskId } = req.body as {
      agentId?: string;
      taskType?: string;
      input?: string;
      parentTaskId?: string;
    };

    const orderId = req.headers['x-order-id'] as string | undefined;
    const sessionId =
      (req.headers['x-session-id'] as string) ||
      req.body.sessionId ||
      'anonymous';

    if (!agentId || !taskType || !input) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId, taskType, input',
        code: 'INVALID_REQUEST',
      });
      return;
    }

    try {
      const result = await taskService.createAndExecute({
        agentId,
        taskType,
        input,
        sessionId,
        orderId,
        parentTaskId,
      });

      if (result.status === 402) {
        res.status(402).json({
          code: 'PAYMENT_REQUIRED',
          message: 'Payment required before task execution',
          orderId: result.order?.id,
          taskId: result.task?.id,
          amount: result.order?.amount,
          currency: result.order?.currency,
          chain: result.order?.chain,
        });
        return;
      }

      res.json({
        success: true,
        data: {
          taskId: result.task?.id,
          status: result.task?.status,
          result: result.result,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Agent not found') {
        res.status(404).json({ success: false, error: message, code: 'AGENT_NOT_FOUND' });
      } else if (message === 'ORDER_SESSION_EXPIRED') {
        res.status(410).json({
          success: false,
          error: 'Payment session expired (server may have restarted). Please refresh and start a new task.',
          code: 'ORDER_SESSION_EXPIRED',
        });
      } else if (message === 'TASK_SESSION_EXPIRED') {
        res.status(410).json({
          success: false,
          error: 'Task session expired (server may have restarted). Payment was received but task state was lost. Please contact support.',
          code: 'TASK_SESSION_EXPIRED',
        });
      } else if (message === 'Parent task not found' || message === 'Parent task has not completed yet') {
        res.status(422).json({ success: false, error: message, code: 'PARENT_TASK_UNAVAILABLE' });
      } else {
        res.status(500).json({ success: false, error: message, code: 'INTERNAL_ERROR' });
      }
    }
  },

  getById(req: Request, res: Response): void {
    const { id } = req.params;
    const task = taskService.getById(id);

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found', code: 'TASK_NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: task });
  },
};
