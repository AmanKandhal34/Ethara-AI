import express from 'express';
import ProjectController from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', ProjectController.updateProject);
router.get('/:id/thumbnail', ProjectController.getProjectThumbnail);
router.get('/:id/thumbnail/download', ProjectController.downloadProjectThumbnail);
router.delete('/:id/thumbnail', ProjectController.deleteProjectThumbnail);
router.delete('/:id', ProjectController.deleteProject);
router.post('/:id/members', ProjectController.addMember);
router.delete('/:id/members', ProjectController.removeMember);
router.get('/:id/tasks', ProjectController.getProjectTasks);

export default router;
