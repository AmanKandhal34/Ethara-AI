import axiosInstance from './axios';

const authAPI = {
    login: (email, password) =>
        axiosInstance.post('/auth/login', { email, password }),

    register: (userData) =>
        axiosInstance.post('/auth/register', userData),

    logout: () =>
        axiosInstance.post('/auth/logout'),

    getCurrentUser: () =>
        axiosInstance.get('/auth/me'),

    updateProfile: (userData) =>
        axiosInstance.put('/auth/profile', userData),
};

export default authAPI;
