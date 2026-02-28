import axios from "axios";
import type { CurrentUserResponse } from "../users/users";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface ChangeRoleRequest {
    new_role: string;
}

export interface ChangeRoleResponse {
    message: string;
    old_role: string;
    new_role: string;
}

export const getUsers = async (): Promise<CurrentUserResponse[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.get<CurrentUserResponse[]>(`${API_URL}/admin/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) throw err.response.data;
        }
        throw err;
    }
};

export const changeUserRole = async (userId: number, new_role: string): Promise<ChangeRoleResponse> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.put<ChangeRoleResponse>(
            `${API_URL}/admin/users/${userId}/role`,
            null,
            {
                params: { new_role },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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