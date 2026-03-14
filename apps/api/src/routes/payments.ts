import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

router.get('/:orderId', paymentController.getById);
router.post('/:orderId/initiate-goat', paymentController.initiateGoatPayment);
router.get('/:orderId/verify-goat', paymentController.verifyGoatPayment);

export default router;
