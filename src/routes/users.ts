import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  deactivateUser,
  getUserTasks,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.get('/:id/tasks', getUserTasks);
router.put('/deactivate', deactivateUser);

export default router;