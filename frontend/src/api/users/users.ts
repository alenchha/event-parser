import axios from "axios";

import apiClient from '../axiosConfig';

export interface UserEvent {
    id: number;
    title: string;
    date: string;
    time: string;
    place: string;
}

export interface CurrentUserResponse {
    id: number;
    username: string;
    role: "user" | "admin";
    registered_events: UserEvent[];
    avatar_url?: string;
}

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
    try {
        const response = await apiClient.get<CurrentUserResponse>('/users/me');
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) throw err.response.data;
        }
        throw err;
    }
};

export const changePassword = async (old_password: string, new_password: string) => {
    const response = await apiClient.patch('/users/me/password', {
        old_password,
        new_password
    });
    return response.data;
};

export const deleteMyAccount = async () => {
    const response = await apiClient.delete('/users/me');
    return response.data;
};

export const uploadAvatar = async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/users/me/avatar', formData, {
        headers: { 
            'Content-Type': 'multipart/form-data' 
        }
    });
    return response.data;
};

export const deleteAvatar = async (): Promise<void> => {
    await apiClient.delete('/api/users/me/avatar');
};

export const getUserAvatar = async (userId: number): Promise<{ avatar_url: string | null }> => {
    const response = await apiClient.get(`/api/users/${userId}/avatar`);
    return response.data;
};
