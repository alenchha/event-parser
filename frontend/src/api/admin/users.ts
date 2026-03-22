import axios from "axios";
import type { CurrentUserResponse } from "../users/users";
import apiClient from '../axiosConfig';

export interface ChangeRoleRequest {
    new_role: string;
}

export interface ChangeRoleResponse {
    message: string;
    old_role: string;
    new_role: string;
}

export const getUsers = async (): Promise<CurrentUserResponse[]> => {
    try {
        const response = await apiClient.get<CurrentUserResponse[]>('/admin/users');
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) throw err.response.data;
        }
        throw err;
    }
};

export const changeUserRole = async (userId: number, new_role: string): Promise<ChangeRoleResponse> => {
    try {
        const response = await apiClient.put<ChangeRoleResponse>(
            `/admin/users/${userId}/role`,
            null,
            {
                params: { new_role },
            }
        );
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) throw err.response.data;
        }
        throw err;
    }
};