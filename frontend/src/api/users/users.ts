import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

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
}

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.get<CurrentUserResponse>(`${API_URL}/users/me`, {
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

export const changePassword = async (old_password: string, new_password: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token");

    const res = await axios.patch(`${API_URL}/users/me/password`,
        { old_password, new_password },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
};

export const deleteMyAccount = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token");

    const res = await axios.delete(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
