import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface RegisterRequest {
    username: string;
    password: string;
}
type RegisterResponse = string;

export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const response = await axios.post<RegisterResponse>(`${API_URL}/auth/register`, data, {
            headers: {
                "Content-Type": "application/json",
            },
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

interface LoginRequest {
    username: string;
    password: string;
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

        const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
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