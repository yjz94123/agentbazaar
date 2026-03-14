import { v4 as uuidv4 } from 'uuid';
import { paymentDb, taskDb } from '../db/store';
import { config } from '../config/env';
import { goatx402Client, usdcToWei } from './goatx402.client';
import type { PaymentOrder } from '@agentbazaar/shared';

export const paymentService = {
  createOrder(taskId: string, amount: string, currency: string): PaymentOrder {
    const order: PaymentOrder = {
      id: `order-${uuidv4()}`,
      taskId,
      amount,
      currency,
      chain: config.x402Chain,
      status: 'pending',
      txHash: null,
      createdAt: new Date().toISOString(),
      goatOrderId: null,
      payToAddress: null,
      fromAddress: null,
      amountWei: null,
    };
    paymentDb.save(order);
    return order;
  },

  getById(orderId: string): PaymentOrder | undefined {
    return paymentDb.findById(orderId);
  },

  getByTaskId(taskId: string): PaymentOrder | undefined {
    return paymentDb.findByTaskId(taskId);
  },

  // Create a real GOAT x402 order for on-chain payment
  async initiateGoatPayment(
    orderId: string,
    fromAddress: string
  ): Promise<{ payToAddress: string; goatOrderId: string; amountWei: string } | undefined> {
    const order = paymentDb.findById(orderId);
    if (!order) return undefined;

    const amountWei = usdcToWei(order.amount);

    // Already initiated — return cached values instead of re-creating
    if (order.goatOrderId && order.payToAddress) {
      return { payToAddress: order.payToAddress, goatOrderId: order.goatOrderId, amountWei: order.amountWei ?? amountWei };
    }

    // Append a timestamp suffix so re-initiating after a server restart
    // (when in-memory state is lost but GOAT API still holds the old dapp_order_id)
    // creates a fresh order instead of hitting "order already exists".
    const dappOrderId = `${orderId}-${Date.now()}`;

    try {
      const goatOrder = await goatx402Client.createOrder({
        dappOrderId,
        fromAddress,
        amountWei,
        tokenSymbol: order.currency === 'USDT' ? 'USDT' : 'USDC',
      });

      paymentDb.update(orderId, {
        goatOrderId: goatOrder.orderId,
        payToAddress: goatOrder.payToAddress,
        fromAddress,
        amountWei,
      });

      return {
        payToAddress: goatOrder.payToAddress,
        goatOrderId: goatOrder.orderId,
        amountWei,
      };
    } catch (err) {
      console.error('[GOAT x402] initiateGoatPayment error:', err);
      throw err;
    }
  },

  // Check GOAT payment status and confirm if paid
  async verifyGoatPayment(orderId: string): Promise<{ confirmed: boolean; txHash: string | null; goatStatus: string }> {
    const order = paymentDb.findById(orderId);
    if (!order || !order.goatOrderId) {
      return { confirmed: false, txHash: null, goatStatus: 'NO_GOAT_ORDER' };
    }

    try {
      const goatStatus = await goatx402Client.getOrderStatus(order.goatOrderId);

      if (goatx402Client.isPaymentConfirmed(goatStatus.status)) {
        paymentDb.update(orderId, {
          status: 'confirmed',
          txHash: goatStatus.tx_hash ?? null,
        });
        taskDb.update(order.taskId, { status: 'paid' });

        return {
          confirmed: true,
          txHash: goatStatus.tx_hash ?? null,
          goatStatus: goatStatus.status,
        };
      }

      return { confirmed: false, txHash: null, goatStatus: goatStatus.status };
    } catch (err) {
      console.error('[GOAT x402] verifyGoatPayment error:', err);
      throw err;
    }
  },

  isOrderPaid(orderId: string): boolean {
    const order = paymentDb.findById(orderId);
    return order?.status === 'confirmed' || order?.status === 'paid';
  },
};
