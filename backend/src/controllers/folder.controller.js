import FolderService from '../services/folder.service.js';
import { sendError, sendResponse } from '../utils/responseHandler.js';

export class FolderController {
    static async getFolders(req, res) {
        try {
            const folders = await FolderService.getAllFolders();
            sendResponse(res, 200, true, 'Folders retrieved successfully', folders);
        } catch (error) {
            sendError(res, 500, error.message);
        }
    }

    static async getFolderById(req, res) {
        try {
            const folder = await FolderService.getFolderById(req.params.id);
            sendResponse(res, 200, true, 'Folder retrieved successfully', folder);
        } catch (error) {
            sendError(res, 404, error.message);
        }
    }

    static async createFolder(req, res) {
        try {
            const folder = await FolderService.createFolder(req.body);
            sendResponse(res, 201, true, 'Folder created successfully', folder);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async updateFolder(req, res) {
        try {
            const folder = await FolderService.updateFolder(req.params.id, req.body);
            sendResponse(res, 200, true, 'Folder updated successfully', folder);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async deleteFolder(req, res) {
        try {
            const result = await FolderService.deleteFolder(req.params.id);
            sendResponse(res, 200, true, result.message, result);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async getFolderContents(req, res) {
        try {
            const contents = await FolderService.getFolderContents(req.params.id);
            sendResponse(res, 200, true, 'Folder contents retrieved successfully', contents);
        } catch (error) {
            sendError(res, 404, error.message);
        }
    }
}

export default FolderController;