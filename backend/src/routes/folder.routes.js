import express from 'express';
import FolderController from '../controllers/folder.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', FolderController.getFolders);
router.post('/', FolderController.createFolder);
router.get('/:id', FolderController.getFolderById);
router.put('/:id', FolderController.updateFolder);
router.delete('/:id', FolderController.deleteFolder);
router.get('/:id/contents', FolderController.getFolderContents);

export default router;