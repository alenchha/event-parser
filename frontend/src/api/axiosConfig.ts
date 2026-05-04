import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

apiClient.interceptors.request.use((config) => {
    const publicEndpoints = ['/events', '/events/'];
    const isPublic = publicEndpoints.some(endpoint => config.url?.startsWith(endpoint));
    
    if (isPublic) {
        return config;
    }
    
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (originalRequest.url?.includes('/auth/login') || 
            originalRequest.url?.includes('/auth/register')) {
            return Promise.reject(error);
        }

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh"
        ) {
            originalRequest._retry = true;

            try {
                const response = await apiClient.post(
                    '/auth/refresh',
                    {},
                    { withCredentials: true }
                );
                const newAccessToken = (response.data).access_token;
                localStorage.setItem("access_token", newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                const currentToken = localStorage.getItem("access_token");
                if (!currentToken) {
                    localStorage.removeItem("access_token");
                    window.location.href = "/";
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
