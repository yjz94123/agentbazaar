import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';

const router = Router();

router.post('/', reviewController.create);
router.get('/agent/:agentId', reviewController.getByAgentId);

export default router;
