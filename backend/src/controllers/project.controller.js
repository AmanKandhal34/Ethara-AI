import ProjectService from '../services/project.service.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';

export class ProjectController {
    static async getProjects(req, res, next) {
        try {
            const { limit, page = 1, status, priority, search, folderId } = req.query;

            const result = await ProjectService.getAllProjects(
                { status, priority, search, folderId },
                { limit: limit !== undefined ? parseInt(limit, 10) : undefined, page: parseInt(page, 10) },
                req.user._id
            );

            sendPaginatedResponse(
                res,
                200,
                result.projects,
                result.page,
                result.limit,
                result.total
            );
        } catch (error) {
            sendError(res, 500, error.message);
        }
    }

    static async getProjectById(req, res, next) {
        try {
            const project = await ProjectService.getProjectById(req.params.id);
            sendResponse(res, 200, true, 'Project retrieved successfully', project);
        } catch (error) {
            sendError(res, 404, error.message);
        }
    }

    static async createProject(req, res, next) {
        try {
            const { name, description, priority, startDate, endDate, budget, tags, folderId, thumbnail } = req.body;

            if (!name) {
                return sendError(res, 400, 'Project name is required');
            }

            const project = await ProjectService.createProject(
                { name, description, priority, startDate, endDate, budget, tags, folderId, thumbnail },
                req.user._id
            );

            sendResponse(res, 201, true, 'Project created successfully', project);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async updateProject(req, res, next) {
        try {
            const project = await ProjectService.updateProject(
                req.params.id,
                req.body,
                req.user._id,
                req.user.role
            );

            sendResponse(res, 200, true, 'Project updated successfully', project);
        } catch (error) {
            sendError(res, error.message === 'Not authorized to update this project' ? 403 : 400, error.message);
        }
    }

    static async getProjectThumbnail(req, res, next) {
        try {
            const thumbnail = await ProjectService.getProjectThumbnail(req.params.id, req.user._id, req.user.role);
            sendResponse(res, 200, true, 'Project upload retrieved successfully', thumbnail);
        } catch (error) {
            sendError(res, error.message.includes('Not authorized') ? 403 : 404, error.message);
        }
    }

    static async deleteProjectThumbnail(req, res, next) {
        try {
            const project = await ProjectService.deleteProjectThumbnail(req.params.id, req.user._id, req.user.role);
            sendResponse(res, 200, true, 'Project upload deleted successfully', project);
        } catch (error) {
            sendError(res, error.message.includes('Not authorized') ? 403 : 404, error.message);
        }
    }

    static async deleteProject(req, res, next) {
        try {
            await ProjectService.deleteProject(req.params.id, req.user._id, req.user.role);
            sendResponse(res, 200, true, 'Project deleted successfully');
        } catch (error) {
            sendError(res, error.message === 'Not authorized to delete this project' ? 403 : 400, error.message);
        }
    }

    static async addMember(req, res, next) {
        try {
            const { memberId } = req.body;

            if (!memberId) {
                return sendError(res, 400, 'Member ID is required');
            }

            const project = await ProjectService.addMember(
                req.params.id,
                memberId,
                req.user._id
            );

            sendResponse(res, 200, true, 'Member added successfully', project);
        } catch (error) {
            sendError(res, error.message === 'Not authorized to add members' ? 403 : 400, error.message);
        }
    }

    static async removeMember(req, res, next) {
        try {
            const { memberId } = req.body;

            if (!memberId) {
                return sendError(res, 400, 'Member ID is required');
            }

            const project = await ProjectService.removeMember(
                req.params.id,
                memberId,
                req.user._id
            );

            sendResponse(res, 200, true, 'Member removed successfully', project);
        } catch (error) {
            sendError(res, error.message === 'Not authorized to remove members' ? 403 : 400, error.message);
        }
    }

    static async getProjectTasks(req, res, next) {
        try {
            const tasks = await ProjectService.getProjectTasks(req.params.id);
            sendResponse(res, 200, true, 'Project tasks retrieved successfully', tasks);
        } catch (error) {
            sendError(res, 500, error.message);
        }
    }
}

export default ProjectController;
