export const TASK_STATUSES = ['pending', 'in-progress', 'completed', 'blocked'];

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const createDefaultTaskModel = () => ({
    title: '',
    description: null,
    folderId: null,
    projectId: null,
    assigneeId: null,
    createdById: null,
    status: 'pending',
    priority: 'medium',
    dueDate: null,
    startDate: null,
    completedDate: null,
    estimatedHours: 0,
    actualHours: 0,
    tags: [],
    subtasks: [],
    attachments: [],
    comments: [],
});

export const normalizeTaskModel = (input = {}) => ({
    ...createDefaultTaskModel(),
    ...input,
    projectId: input.projectId || input.project || null,
    assigneeId: input.assignedTo || input.assignee || input.assigneeId || null,
    createdById: input.createdById || input.createdBy || null,
    folderId: input.folderId || null,
    description: input.description || null,
    status: input.status || 'pending',
    priority: input.priority || 'medium',
});
