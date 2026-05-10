import axiosInstance from './axios';

const projectAPI = {
    getProjects: (params) =>
        axiosInstance.get('/projects', { params }),

    getProjectById: (id) =>
        axiosInstance.get(`/projects/${id}`),

    createProject: (projectData) =>
        axiosInstance.post('/projects', projectData),

    updateProject: (id, projectData) =>
        axiosInstance.put(`/projects/${id}`, projectData),

    deleteProject: (id) =>
        axiosInstance.delete(`/projects/${id}`),

    getProjectThumbnail: (id) =>
        axiosInstance.get(`/projects/${id}/thumbnail`),

    deleteProjectThumbnail: (id) =>
        axiosInstance.delete(`/projects/${id}/thumbnail`),

    getProjectTasks: (projectId) =>
        axiosInstance.get(`/projects/${projectId}/tasks`),
};

export default projectAPI;
