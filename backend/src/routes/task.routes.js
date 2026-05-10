import express from 'express';
import TaskController from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', TaskController.getTasks);
router.post('/', TaskController.createTask);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', TaskController.updateTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.get('/:id/attachments/:index', TaskController.viewTaskAttachment);
router.get('/:id/attachments/:index/download', TaskController.downloadTaskAttachment);
router.delete('/:id/attachments/:index', TaskController.deleteTaskAttachment);
router.delete('/:id', TaskController.deleteTask);
router.post('/:id/subtasks', TaskController.addSubtask);
router.post('/:id/comments', TaskController.addComment);

export default router;
