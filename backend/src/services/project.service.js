import { randomUUID } from 'crypto';
import { getDb } from '../config/db.js';
import { parseJson, populateProjectRow, populateTaskRow, stringifyJson, toIso } from '../utils/sqlite.js';

const VALID_STATUSES = ['active', 'completed', 'on-hold', 'cancelled'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getProjectRows = () => {
    const db = getDb();
    return db.prepare('SELECT * FROM projects ORDER BY datetime(createdAt) DESC').all();
};

const validateProjectData = (projectData = {}) => {
    if (projectData.name !== undefined && !String(projectData.name).trim()) {
        throw new Error('Project name is required');
    }

    if (projectData.status !== undefined && !VALID_STATUSES.includes(projectData.status)) {
        throw new Error('Invalid project status');
    }

    if (projectData.priority !== undefined && !VALID_PRIORITIES.includes(projectData.priority)) {
        throw new Error('Invalid project priority');
    }
};

export class ProjectService {
    static async getAllProjects(filters = {}, pagination = {}, userId = null) {
        const { limit, page = 1, status, priority, search, folderId } = {
            ...filters,
            ...pagination,
        };

        const pageValue = Math.max(toNumber(page, 1), 1);
        const hasLimit = limit !== undefined && limit !== null && limit !== '';

        let projects = getProjectRows().map(populateProjectRow);

        if (userId) {
            projects = projects.filter((project) =>
                project.owner?.id === userId ||
                (Array.isArray(project.members) && project.members.some((member) => member.id === userId))
            );
        }

        if (status) {
            projects = projects.filter((project) => project.status === status);
        }

        if (priority) {
            projects = projects.filter((project) => project.priority === priority);
        }

        if (search) {
            const term = search.toLowerCase();
            projects = projects.filter((project) =>
                [project.name, project.description]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(term))
            );
        }

        if (folderId) {
            projects = projects.filter((project) => project.folderId === folderId);
        }

        const total = projects.length;
        const limitValue = hasLimit ? Math.max(toNumber(limit, 10), 1) : Math.max(total, 1);
        const skip = hasLimit ? (pageValue - 1) * limitValue : 0;
        const pagedProjects = hasLimit ? projects.slice(skip, skip + limitValue) : projects;

        return { projects: pagedProjects, total, page: pageValue, limit: limitValue };
    }

    static async getProjectById(projectId) {
        const db = getDb();
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        return populateProjectRow(project);
    }

    static async createProject(projectData, userId) {
        const db = getDb();
        validateProjectData(projectData);
        const now = toIso(new Date());
        const id = randomUUID();

        db.prepare(
            `INSERT INTO projects (
                id, name, description, ownerId, members, status, priority,
                    folderId, startDate, endDate, budget, thumbnail, tags, createdAt, updatedAt
            ) VALUES (
                @id, @name, @description, @ownerId, @members, @status, @priority,
                    @folderId, @startDate, @endDate, @budget, @thumbnail, @tags, @createdAt, @updatedAt
            )`
        ).run({
            id,
            name: projectData.name,
            description: projectData.description || null,
            ownerId: userId,
            folderId: projectData.folderId || null,
            members: stringifyJson([userId]),
            status: projectData.status || 'active',
            priority: projectData.priority || 'medium',
            startDate: projectData.startDate ? toIso(projectData.startDate) : now,
            endDate: projectData.endDate ? toIso(projectData.endDate) : null,
            budget: toNumber(projectData.budget, 0),
            thumbnail: projectData.thumbnail || null,
            tags: stringifyJson(projectData.tags),
            createdAt: now,
            updatedAt: now,
        });

        return this.getProjectById(id);
    }

    static async updateProject(projectId, updateData, userId, role = 'user') {
        const db = getDb();
        validateProjectData(updateData);
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (role !== 'admin' && project.ownerId !== userId) {
            throw new Error('Not authorized to update this project');
        }

        const now = toIso(new Date());
        const nextProject = {
            ...project,
            name: updateData.name ?? project.name,
            description: updateData.description ?? project.description,
            status: updateData.status ?? project.status,
            priority: updateData.priority ?? project.priority,
            folderId: updateData.folderId !== undefined ? (updateData.folderId || null) : project.folderId,
            startDate: updateData.startDate ? toIso(updateData.startDate) : project.startDate,
            endDate: updateData.endDate ? toIso(updateData.endDate) : project.endDate,
            budget: updateData.budget !== undefined ? toNumber(updateData.budget, project.budget) : project.budget,
            thumbnail: updateData.thumbnail ?? project.thumbnail,
            tags: updateData.tags !== undefined ? stringifyJson(updateData.tags) : project.tags,
            updatedAt: now,
        };

        db.prepare(
            `UPDATE projects
             SET name = ?, description = ?, status = ?, priority = ?, folderId = ?, startDate = ?, endDate = ?,
                 budget = ?, thumbnail = ?, tags = ?, updatedAt = ?
             WHERE id = ?`
        ).run(
            nextProject.name,
            nextProject.description,
            nextProject.status,
            nextProject.priority,
            nextProject.folderId,
            nextProject.startDate,
            nextProject.endDate,
            nextProject.budget,
            nextProject.thumbnail,
            nextProject.tags,
            nextProject.updatedAt,
            projectId
        );

        return this.getProjectById(projectId);
    }

    static async getProjectThumbnail(projectId, userId, role = 'user') {
        const db = getDb();
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (role !== 'admin' && project.ownerId !== userId) {
            throw new Error('Not authorized to view this project upload');
        }

        if (!project.thumbnail) {
            throw new Error('Project upload not found');
        }

        return project.thumbnail;
    }

    static async deleteProjectThumbnail(projectId, userId, role = 'user') {
        const db = getDb();
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (role !== 'admin' && project.ownerId !== userId) {
            throw new Error('Not authorized to delete this project upload');
        }

        db.prepare('UPDATE projects SET thumbnail = NULL, updatedAt = ? WHERE id = ?').run(
            toIso(new Date()),
            projectId
        );

        return this.getProjectById(projectId);
    }

    static async deleteProject(projectId, userId, role = 'user') {
        const db = getDb();
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (role !== 'admin' && project.ownerId !== userId) {
            throw new Error('Not authorized to delete this project');
        }

        db.prepare('DELETE FROM tasks WHERE projectId = ?').run(projectId);
        db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);

        return { message: 'Project deleted successfully' };
    }

    static async addMember(projectId, memberId, userId) {
        const db = getDb();
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (project.ownerId !== userId) {
            throw new Error('Not authorized to add members');
        }

        const members = parseJson(project.members, []);
        if (!members.includes(memberId)) {
            members.push(memberId);
            db.prepare('UPDATE projects SET members = ?, updatedAt = ? WHERE id = ?').run(
                stringifyJson(members),
                toIso(new Date()),
                projectId
            );
        }

        return this.getProjectById(projectId);
    }

    static async removeMember(projectId, memberId, userId) {
        const db = getDb();
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        if (project.ownerId !== userId) {
            throw new Error('Not authorized to remove members');
        }

        const members = parseJson(project.members, []).filter((id) => id !== memberId);
        db.prepare('UPDATE projects SET members = ?, updatedAt = ? WHERE id = ?').run(
            stringifyJson(members),
            toIso(new Date()),
            projectId
        );

        return this.getProjectById(projectId);
    }

    static async getProjectTasks(projectId) {
        const db = getDb();
        const tasks = db
            .prepare('SELECT * FROM tasks WHERE projectId = ? ORDER BY datetime(createdAt) DESC')
            .all(projectId)
            .map(populateTaskRow);

        return tasks;
    }
}

export default ProjectService;
