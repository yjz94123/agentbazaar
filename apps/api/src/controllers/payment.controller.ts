import type { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';

export const paymentController = {
  getById(req: Request, res: Response): void {
    const { orderId } = req.params;
    const order = paymentService.getById(orderId);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: order });
  },

  // Initiate real GOAT x402 payment — creates on-chain order, returns payToAddress
  async initiateGoatPayment(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { fromAddress } = req.body as { fromAddress?: string };

    if (!fromAddress) {
      res.status(400).json({ success: false, error: 'fromAddress is required', code: 'MISSING_FROM_ADDRESS' });
      return;
    }

    if (!/^0x[0-9a-fA-F]{40}$/.test(fromAddress)) {
      res.status(400).json({ success: false, error: 'Invalid Ethereum address format', code: 'INVALID_ADDRESS' });
      return;
    }

    try {
      const result = await paymentService.initiateGoatPayment(orderId, fromAddress);

      if (!result) {
        res.status(404).json({ success: false, error: 'Order not found', code: 'ORDER_NOT_FOUND' });
        return;
      }

      res.json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GOAT x402 error';
      res.status(502).json({ success: false, error: message, code: 'GOAT_API_ERROR' });
    }
  },

  // Verify real GOAT payment status
  async verifyGoatPayment(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;

    try {
      const result = await paymentService.verifyGoatPayment(orderId);
      res.json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GOAT x402 error';
      res.status(502).json({ success: false, error: message, code: 'GOAT_API_ERROR' });
    }
  },
};
