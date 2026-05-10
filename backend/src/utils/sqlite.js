import { getDb } from '../config/db.js';

const toIso = (value) => {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return new Date(value).toISOString();
};

const parseJson = (value, fallback) => {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const stringifyJson = (value) => JSON.stringify(Array.isArray(value) ? value : []);

const publicFolderFields = (row) => ({
    id: row.id,
    _id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

const publicUserFields = (row) => ({
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar,
    bio: row.bio,
    isActive: Boolean(row.isActive),
    lastLogin: row.lastLogin,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

const authUserFields = (row) => ({
    ...publicUserFields(row),
    password: row.password,
});

const fetchUsersByIds = (ids) => {
    const uniqueIds = [...new Set((ids || []).filter(Boolean))];

    if (uniqueIds.length === 0) {
        return new Map();
    }

    const db = getDb();
    const placeholders = uniqueIds.map(() => '?').join(', ');
    const rows = db.prepare(`SELECT * FROM users WHERE id IN (${placeholders})`).all(...uniqueIds);

    return new Map(rows.map((row) => [row.id, publicUserFields(row)]));
};

const populateProjectRow = (row) => {
    if (!row) {
        return null;
    }

    const members = parseJson(row.members, []);
    const users = fetchUsersByIds([row.ownerId, ...members]);

    return {
        id: row.id,
        _id: row.id,
        name: row.name,
        description: row.description,
        folderId: row.folderId,
        owner: users.get(row.ownerId) || { id: row.ownerId, _id: row.ownerId },
        members: members.map((memberId) => users.get(memberId) || { id: memberId, _id: memberId }),
        status: row.status,
        priority: row.priority,
        startDate: row.startDate,
        endDate: row.endDate,
        budget: row.budget,
        thumbnail: row.thumbnail,
        tags: parseJson(row.tags, []),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        progress: 0,
    };
};

const populateTaskRow = (row) => {
    if (!row) {
        return null;
    }

    const comments = parseJson(row.comments, []);
    const users = fetchUsersByIds([
        row.assigneeId,
        row.createdById,
        ...comments.map((comment) => comment.author),
    ]);

    return {
        id: row.id,
        _id: row.id,
        title: row.title,
        description: row.description,
        folderId: row.folderId,
        projectId: row.projectId,
        project: row.projectId,
        assignedTo: row.assigneeId ? (users.get(row.assigneeId) || { id: row.assigneeId, _id: row.assigneeId }) : null,
        assignee: row.assigneeId ? (users.get(row.assigneeId) || { id: row.assigneeId, _id: row.assigneeId }) : null,
        createdBy: users.get(row.createdById) || { id: row.createdById, _id: row.createdById },
        status: row.status,
        priority: row.priority,
        dueDate: row.dueDate,
        startDate: row.startDate,
        completedDate: row.completedDate,
        estimatedHours: row.estimatedHours,
        actualHours: row.actualHours,
        tags: parseJson(row.tags, []),
        subtasks: parseJson(row.subtasks, []),
        attachments: parseJson(row.attachments, []),
        comments: comments.map((comment) => ({
            ...comment,
            author: users.get(comment.author) || (comment.author ? { id: comment.author, _id: comment.author } : null),
        })),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
};

export {
    authUserFields,
    fetchUsersByIds,
    parseJson,
    populateProjectRow,
    populateTaskRow,
    publicFolderFields,
    publicUserFields,
    stringifyJson,
    toIso,
};