import { randomUUID } from 'crypto';
import { getDb } from '../config/db.js';
import { normalizeTaskModel } from '../models/task.model.js';
import { parseJson, populateTaskRow, stringifyJson, toIso } from '../utils/sqlite.js';

const VALID_STATUSES = ['pending', 'in-progress', 'completed', 'blocked'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getTaskRows = () => {
    const db = getDb();
    return db.prepare('SELECT * FROM tasks ORDER BY datetime(createdAt) DESC').all();
};

const normalizeTaskInput = (taskData) => ({
    title: taskData.title,
    description: taskData.description || null,
    folderId: taskData.folderId || null,
    projectId: taskData.projectId || taskData.project || null,
    assigneeId: taskData.assignedTo || taskData.assignee || taskData.assigneeId || null,
    priority: taskData.priority || 'medium',
    dueDate: taskData.dueDate ? toIso(taskData.dueDate) : null,
    startDate: taskData.startDate ? toIso(taskData.startDate) : null,
    completedDate: taskData.completedDate ? toIso(taskData.completedDate) : null,
    estimatedHours: toNumber(taskData.estimatedHours, 0),
    actualHours: toNumber(taskData.actualHours, 0),
    tags: stringifyJson(taskData.tags),
    subtasks: stringifyJson(taskData.subtasks),
    attachments: stringifyJson(taskData.attachments),
    comments: stringifyJson(taskData.comments),
});

const getTaskByIdRow = (taskId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
};

const validateTaskData = (taskData = {}) => {
    if (taskData.title !== undefined && !String(taskData.title).trim()) {
        throw new Error('Task title is required');
    }

    if (taskData.status !== undefined && !VALID_STATUSES.includes(taskData.status)) {
        throw new Error('Invalid task status');
    }

    if (taskData.priority !== undefined && !VALID_PRIORITIES.includes(taskData.priority)) {
        throw new Error('Invalid task priority');
    }
};

const canAccessTask = (task, user = null) => {
    if (!user) return true;
    const userId = user.id || user._id;
    if (user.role === 'admin' || task.createdById === userId || task.assigneeId === userId) return true;

    const db = getDb();
    const project = db.prepare('SELECT ownerId, members FROM projects WHERE id = ?').get(task.projectId);
    const members = parseJson(project?.members, []);
    return project?.ownerId === userId || members.includes(userId);
};

export class TaskService {
    static async getAllTasks(filters = {}, pagination = {}, user = null) {
        const { limit, page = 1, status, priority, projectId, folderId, search } = {
            ...filters,
            ...pagination,
        };

        const pageValue = Math.max(toNumber(page, 1), 1);
        const hasLimit = limit !== undefined && limit !== null && limit !== '';

        let taskRows = getTaskRows();
        if (user?.role !== 'admin') {
            taskRows = taskRows.filter((task) => canAccessTask(task, user));
        }

        let tasks = taskRows.map(populateTaskRow);

        if (status) {
            tasks = tasks.filter((task) => task.status === status);
        }

        if (priority) {
            tasks = tasks.filter((task) => task.priority === priority);
        }

        if (projectId) {
            tasks = tasks.filter((task) => task.projectId === projectId);
        }

        if (folderId) {
            tasks = tasks.filter((task) => task.folderId === folderId);
        }

        if (search) {
            const term = search.toLowerCase();
            tasks = tasks.filter((task) =>
                [task.title, task.description]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(term))
            );
        }

        const total = tasks.length;
        const limitValue = hasLimit ? Math.max(toNumber(limit, 10), 1) : Math.max(total, 1);
        const skip = hasLimit ? (pageValue - 1) * limitValue : 0;
        const pagedTasks = hasLimit ? tasks.slice(skip, skip + limitValue) : tasks;

        return { tasks: pagedTasks, total, page: pageValue, limit: limitValue };
    }

    static async getTaskById(taskId, user = null) {
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        return populateTaskRow(task);
    }

    static async createTask(taskData, userId) {
        const db = getDb();
        validateTaskData(taskData);
        const normalizedInput = normalizeTaskModel({ ...taskData, createdById: userId });
        const projectId = normalizedInput.projectId;

        if (!projectId) {
            throw new Error('Title and project are required');
        }

        const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        const now = toIso(new Date());
        const id = randomUUID();
        const normalized = normalizeTaskInput(normalizedInput);

        db.prepare(
            `INSERT INTO tasks (
                id, title, description, folderId, projectId, assigneeId, createdById, status, priority,
                dueDate, startDate, completedDate, estimatedHours, actualHours, tags,
                subtasks, attachments, comments, createdAt, updatedAt
            ) VALUES (
                @id, @title, @description, @folderId, @projectId, @assigneeId, @createdById, @status, @priority,
                @dueDate, @startDate, @completedDate, @estimatedHours, @actualHours, @tags,
                @subtasks, @attachments, @comments, @createdAt, @updatedAt
            )`
        ).run({
            id,
            title: normalized.title,
            description: normalized.description,
            folderId: normalized.folderId,
            projectId,
            assigneeId: normalized.assigneeId,
            createdById: normalizedInput.createdById,
            status: normalizedInput.status,
            priority: normalized.priority,
            dueDate: normalized.dueDate,
            startDate: normalized.startDate,
            completedDate: normalized.completedDate,
            estimatedHours: normalized.estimatedHours,
            actualHours: normalized.actualHours,
            tags: normalized.tags,
            subtasks: normalized.subtasks,
            attachments: normalized.attachments,
            comments: normalized.comments,
            createdAt: now,
            updatedAt: now,
        });

        return this.getTaskById(id);
    }

    static async updateTask(taskId, updateData, user = null) {
        const db = getDb();
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        const normalizedUpdate = normalizeTaskModel({ ...task, ...updateData });
        const projectId = normalizedUpdate.projectId ?? task.projectId;
        const assigneeId = normalizedUpdate.assigneeId ?? task.assigneeId;
        const folderId = updateData.folderId !== undefined ? (updateData.folderId || null) : task.folderId;
        const normalized = normalizeTaskInput({
            ...task,
            ...normalizedUpdate,
            projectId,
            assigneeId,
            folderId,
        });

        const now = toIso(new Date());

        db.prepare(
            `UPDATE tasks
             SET title = ?, description = ?, folderId = ?, projectId = ?, assigneeId = ?, status = ?, priority = ?,
                 dueDate = ?, startDate = ?, completedDate = ?, estimatedHours = ?, actualHours = ?,
                 tags = ?, subtasks = ?, attachments = ?, comments = ?, updatedAt = ?
             WHERE id = ?`
        ).run(
            updateData.title ?? task.title,
            updateData.description ?? task.description,
            folderId,
            projectId,
            assigneeId,
            updateData.status ?? task.status,
            updateData.priority ?? task.priority,
            updateData.dueDate !== undefined ? toIso(updateData.dueDate) : task.dueDate,
            updateData.startDate !== undefined ? toIso(updateData.startDate) : task.startDate,
            updateData.completedDate !== undefined ? toIso(updateData.completedDate) : task.completedDate,
            updateData.estimatedHours !== undefined ? toNumber(updateData.estimatedHours, task.estimatedHours) : task.estimatedHours,
            updateData.actualHours !== undefined ? toNumber(updateData.actualHours, task.actualHours) : task.actualHours,
            updateData.tags !== undefined ? stringifyJson(updateData.tags) : task.tags,
            updateData.subtasks !== undefined ? stringifyJson(updateData.subtasks) : task.subtasks,
            updateData.attachments !== undefined ? stringifyJson(updateData.attachments) : task.attachments,
            updateData.comments !== undefined ? stringifyJson(updateData.comments) : task.comments,
            now,
            taskId
        );

        return this.getTaskById(taskId);
    }

    static async updateTaskStatus(taskId, status, user = null) {
        const db = getDb();
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        validateTaskData({ status });

        if (!canAccessTask(task, user)) {
            throw new Error('Not authorized to update this task');
        }

        const completedDate = status === 'completed' ? toIso(new Date()) : task.completedDate;

        db.prepare(
            'UPDATE tasks SET status = ?, completedDate = ?, updatedAt = ? WHERE id = ?'
        ).run(status, completedDate, toIso(new Date()), taskId);

        return this.getTaskById(taskId);
    }

    static async getTaskAttachment(taskId, attachmentIndex, user = null) {
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        if (!canAccessTask(task, user)) {
            throw new Error('Not authorized to access this task');
        }

        const attachments = parseJson(task.attachments, []);
        if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0 || attachmentIndex >= attachments.length) {
            throw new Error('Attachment not found');
        }

        const attachment = attachments[attachmentIndex];

        if (typeof attachment !== 'string') {
            throw new Error('Attachment not found');
        }

        return attachment;
    }

    static async deleteTaskAttachment(taskId, attachmentIndex, user = null) {
        const db = getDb();
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        if (!canAccessTask(task, user)) {
            throw new Error('Not authorized to update this task');
        }

        const attachments = parseJson(task.attachments, []);

        if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0 || attachmentIndex >= attachments.length) {
            throw new Error('Attachment not found');
        }

        attachments.splice(attachmentIndex, 1);

        db.prepare('UPDATE tasks SET attachments = ?, updatedAt = ? WHERE id = ?').run(
            stringifyJson(attachments),
            toIso(new Date()),
            taskId
        );

        return this.getTaskById(taskId);
    }

    static async deleteTask(taskId, user = null) {
        const db = getDb();
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        if (!canAccessTask(task, user)) {
            throw new Error('Not authorized to delete this task');
        }

        db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

        return { message: 'Task deleted successfully' };
    }

    static async addSubtask(taskId, subtaskData) {
        const db = getDb();
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        const subtasks = parseJson(task.subtasks, []);
        subtasks.push({
            title: subtaskData.title,
            completed: false,
        });

        db.prepare('UPDATE tasks SET subtasks = ?, updatedAt = ? WHERE id = ?').run(
            stringifyJson(subtasks),
            toIso(new Date()),
            taskId
        );

        return this.getTaskById(taskId);
    }

    static async addComment(taskId, commentData, userId) {
        const db = getDb();
        const task = getTaskByIdRow(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        const comments = parseJson(task.comments, []);
        comments.push({
            author: userId,
            text: commentData.text,
            createdAt: toIso(new Date()),
        });

        db.prepare('UPDATE tasks SET comments = ?, updatedAt = ? WHERE id = ?').run(
            stringifyJson(comments),
            toIso(new Date()),
            taskId
        );

        return this.getTaskById(taskId);
    }

    static async getProjectTasks(projectId) {
        const tasks = getTaskRows()
            .filter((task) => task.projectId === projectId)
            .map(populateTaskRow);

        return tasks;
    }
}

export default TaskService;
