import axios from "axios";

// Ensure VITE_API_URL always resolves to an /api base path.
const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle responses
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log network-level and HTTP errors for easier debugging.
        console.error('API response error:', {
            message: error.message,
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
        });

        if (!error.response) {
            // Network error (DNS, CORS, connection refused, etc.)
            // Surface a helpful message so UI can show it.
            return Promise.reject(new Error('Network Error'));
        }

        if (error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;