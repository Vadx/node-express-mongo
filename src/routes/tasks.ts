import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate, taskSchema, updateTaskSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task routes
router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', validate(taskSchema), createTask);
router.get('/:id', getTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;