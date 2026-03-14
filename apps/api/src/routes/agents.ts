import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';

const router = Router();

router.get('/', agentController.list);
router.get('/:id', agentController.getById);
router.get('/:id/reputation', agentController.getReputation);
router.get('/:id/identity', agentController.getIdentity);

export default router;
