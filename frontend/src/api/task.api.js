import axiosInstance from './axios';

const taskAPI = {
    getTasks: (params) =>
        axiosInstance.get('/tasks', { params }),

    getTaskById: (id) =>
        axiosInstance.get(`/tasks/${id}`),

    createTask: (taskData) =>
        axiosInstance.post('/tasks', taskData),

    updateTask: (id, taskData) =>
        axiosInstance.put(`/tasks/${id}`, taskData),

    deleteTask: (id) =>
        axiosInstance.delete(`/tasks/${id}`),

    updateTaskStatus: (id, status) =>
        axiosInstance.patch(`/tasks/${id}/status`, { status }),

    getTaskAttachment: (id, index) =>
        axiosInstance.get(`/tasks/${id}/attachments/${index}`),

    deleteTaskAttachment: (id, index) =>
        axiosInstance.delete(`/tasks/${id}/attachments/${index}`),

    downloadTaskAttachment: (id, index) =>
        axiosInstance.get(`/tasks/${id}/attachments/${index}/download`, { responseType: 'blob' }),
};

export default taskAPI;
