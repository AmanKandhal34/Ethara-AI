export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TASK_STATUSES = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const PROJECT_STATUSES = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ON_HOLD: 'on-hold',
    CANCELLED: 'cancelled',
};

export const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
};
