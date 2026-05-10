import TaskService from '../services/task.service.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/responseHandler.js';

export class TaskController {
    static async getTasks(req, res, next) {
        try {
            const { limit, page = 1, status, priority, projectId, search, folderId } = req.query;

            const result = await TaskService.getAllTasks(
                { status, priority, projectId, search, folderId },
                { limit: limit !== undefined ? parseInt(limit, 10) : undefined, page: parseInt(page, 10) },
                req.user
            );

            sendPaginatedResponse(
                res,
                200,
                result.tasks,
                result.page,
                result.limit,
                result.total
            );
        } catch (error) {
            sendError(res, 500, error.message);
        }
    }

    static async getTaskById(req, res, next) {
        try {
            const task = await TaskService.getTaskById(req.params.id, req.user);
            sendResponse(res, 200, true, 'Task retrieved successfully', task);
        } catch (error) {
            sendError(res, 404, error.message);
        }
    }

    static async createTask(req, res, next) {
        try {
            const { title, description, projectId, project, assignedTo, assignee, priority, dueDate, estimatedHours, tags, folderId, attachments, status } = req.body;

            if (!title || !(projectId || project)) {
                return sendError(res, 400, 'Title and project are required');
            }

            const task = await TaskService.createTask(
                {
                    title,
                    description,
                    projectId: projectId || project,
                    assignedTo: assignedTo || assignee,
                    priority,
                    dueDate,
                    estimatedHours,
                    tags,
                    folderId,
                    attachments,
                    status,
                },
                req.user._id
            );

            sendResponse(res, 201, true, 'Task created successfully', task);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async updateTask(req, res, next) {
        try {
            const task = await TaskService.updateTask(req.params.id, req.body, req.user);
            sendResponse(res, 200, true, 'Task updated successfully', task);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async updateTaskStatus(req, res, next) {
        try {
            const { status } = req.body;

            if (!status) {
                return sendError(res, 400, 'Status is required');
            }

            const task = await TaskService.updateTaskStatus(req.params.id, status, req.user);
            sendResponse(res, 200, true, 'Task status updated successfully', task);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async viewTaskAttachment(req, res, next) {
        try {
            const attachment = await TaskService.getTaskAttachment(
                req.params.id,
                Number(req.params.index),
                req.user
            );

            sendResponse(res, 200, true, 'Task attachment retrieved successfully', attachment);
        } catch (error) {
            sendError(res, 404, error.message);
        }
    }

    static async deleteTaskAttachment(req, res, next) {
        try {
            const task = await TaskService.deleteTaskAttachment(
                req.params.id,
                Number(req.params.index),
                req.user
            );
            sendResponse(res, 200, true, 'Task attachment deleted successfully', task);
        } catch (error) {
            sendError(res, 404, error.message);
        }
    }

    static async deleteTask(req, res, next) {
        try {
            await TaskService.deleteTask(req.params.id, req.user);
            sendResponse(res, 200, true, 'Task deleted successfully');
        } catch (error) {
            sendError(res, 404, error.message);
        }
    }

    static async addSubtask(req, res, next) {
        try {
            const { title } = req.body;

            if (!title) {
                return sendError(res, 400, 'Subtask title is required');
            }

            const task = await TaskService.addSubtask(req.params.id, { title });
            sendResponse(res, 201, true, 'Subtask added successfully', task);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }

    static async addComment(req, res, next) {
        try {
            const { text } = req.body;

            if (!text) {
                return sendError(res, 400, 'Comment text is required');
            }

            const task = await TaskService.addComment(req.params.id, { text }, req.user._id);
            sendResponse(res, 201, true, 'Comment added successfully', task);
        } catch (error) {
            sendError(res, 400, error.message);
        }
    }
}

export default TaskController;
