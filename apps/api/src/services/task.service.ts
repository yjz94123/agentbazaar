import { v4 as uuidv4 } from 'uuid';
import { taskDb } from '../db/store';
import { agentService } from './agent.service';
import { paymentService } from './payment.service';
import { runNewsAnalyst } from '../agents/news-analyst';
import { runProjectScreener } from '../agents/project-screener';
import { runReportWriter } from '../agents/report-writer';
import type { Task } from '@agentbazaar/shared';

export const taskService = {
  async createAndExecute(params: {
    agentId: string;
    taskType: string;
    input: string;
    sessionId: string;
    orderId?: string;
    parentTaskId?: string;
  }): Promise<{ status: 402 | 200; task?: Task; order?: ReturnType<typeof paymentService.createOrder>; result?: unknown }> {
    const { agentId, taskType, input, sessionId, orderId, parentTaskId } = params;

    const agent = agentService.getById(agentId);
    if (!agent) throw new Error('Agent not found');

    const dynamicPrice = agentService.getDynamicPrice(agent);

    // If orderId provided, check payment
    if (orderId) {
      const order = paymentService.getById(orderId);
      if (!order || !paymentService.isOrderPaid(orderId)) {
        return { status: 402 };
      }

      // Find the task associated with this order
      const existingTask = taskDb.findById(order.taskId);
      if (existingTask) {
        // Execute the task
        return this.executeTask(existingTask);
      }
    }

    // Create new task
    const taskId = `task-${uuidv4()}`;
    let userInput = input;

    // If parentTaskId, pull upstream result as input for Report Writer
    if (parentTaskId) {
      const parentTask = taskDb.findById(parentTaskId);
      if (parentTask?.result) {
        userInput = JSON.stringify(parentTask.result);
      }
    }

    const task: Task = {
      id: taskId,
      agentId,
      userInput,
      taskType,
      price: dynamicPrice,
      currency: agent.currency,
      status: 'payment_required',
      paymentOrderId: null,
      parentTaskId: parentTaskId ?? null,
      result: null,
      executionMs: null,
      sessionId,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    taskDb.save(task);

    // Create payment order
    const order = paymentService.createOrder(taskId, dynamicPrice, agent.currency);
    taskDb.update(taskId, { paymentOrderId: order.id });

    return { status: 402, task, order };
  },

  async executeTask(task: Task): Promise<{ status: 200; task: Task; result: unknown }> {
    const startTime = Date.now();

    taskDb.update(task.id, { status: 'processing' });

    try {
      let result: unknown;

      if (task.agentId === 'agent-news-001') {
        result = await runNewsAnalyst(task.userInput, task.taskType);
      } else if (task.agentId === 'agent-screener-001') {
        result = await runProjectScreener(task.userInput, task.taskType);
      } else if (task.agentId === 'agent-report-001') {
        result = await runReportWriter(task.userInput, task.taskType);
      } else {
        result = { message: 'Agent not implemented', input: task.userInput };
      }

      const executionMs = Date.now() - startTime;

      const updatedTask = taskDb.update(task.id, {
        status: 'completed',
        result,
        executionMs,
        completedAt: new Date().toISOString(),
      });

      // Increment agent call count
      agentService.incrementCallCount(task.agentId);

      return { status: 200, task: updatedTask!, result };
    } catch (error) {
      taskDb.update(task.id, { status: 'failed' });
      throw error;
    }
  },

  getById(id: string): Task | undefined {
    return taskDb.findById(id);
  },
};
