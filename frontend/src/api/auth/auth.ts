import axios from "axios";
import apiClient from '../axiosConfig';

interface RegisterRequest {
    username: string;
    password: string;
}
type RegisterResponse = string;

export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const response = await apiClient.post<RegisterResponse>('/auth/register', data);
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) {
                throw err.response.data;
            }
        }
        throw err;
    }
};

interface LoginRequest {
    username: string;
    password: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

interface LoginResponse {
    access_token: string;
    token_type: string;
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
        const formData = new URLSearchParams();
        formData.append("grant_type", "password");
        formData.append("username", data.username);
        formData.append("password", data.password);

        const response = await apiClient.post<LoginResponse>('/auth/login', formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true,
        });

        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) {
                throw err.response.data;
            }
        }
        throw err;
    }
};

export const refreshToken = async () => {
    const response = await apiClient.post("/auth/refresh");
    return response.data;
};

export const logoutUser = async (): Promise<{ message: string }> => {
    try {
        const response = await apiClient.post<{ message: string }>('/auth/logout', {}, {
            withCredentials: true,
        });

        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.data) {
                throw err.response.data;
            }
        }
        throw err;
    }
};
