import axiosInstance from './axios';

const folderAPI = {
    getFolders: () => axiosInstance.get('/folders'),
    getFolderById: (id) => axiosInstance.get(`/folders/${id}`),
    getFolderContents: (id) => axiosInstance.get(`/folders/${id}/contents`),
    createFolder: (folderData) => axiosInstance.post('/folders', folderData),
    updateFolder: (id, folderData) => axiosInstance.put(`/folders/${id}`, folderData),
    deleteFolder: (id) => axiosInstance.delete(`/folders/${id}`),
};

export default folderAPI;