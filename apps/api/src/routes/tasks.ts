import { Router } from 'express';
import { taskController } from '../controllers/task.controller';

const router = Router();

router.post('/', taskController.create);
router.get('/:id', taskController.getById);

export default router;
