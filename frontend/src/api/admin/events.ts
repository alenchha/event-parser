import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface EventData {
    id?: number;
    title: string;
    date: string;
    time: string;
    place: string;
    capacity: number | null;
    description: string;
    age_limit: number | null;
    event_type: string;
    image_url: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    return { Authorization: `Bearer ${token}` };
};

export const parseEventImage = async (file: File): Promise<Partial<EventData>> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(`${API_URL}/events/parse_image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                ...getAuthHeaders(),
            },
        });
        if (typeof response.data === "string") {
            return JSON.parse(response.data) as Partial<EventData>;
        }
        return response.data as Partial<EventData>;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.data) throw err.response.data;
            throw new Error(err.message);
        }
        throw err;
    }
};

export const createEvent = async (data: Partial<EventData>) => {
    try {
        const response = await axios.post(`${API_URL}/events/create`, data, {
            headers: getAuthHeaders(),
        });
        return response.data as EventData;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.data) throw err.response.data;
            throw new Error(err.message);
        }
        throw err;
    }
};

export const updateEvent = async (eventId: number, data: Partial<EventData>) => {
    try {
        const response = await axios.patch(`${API_URL}/events/${eventId}`, data, {
            headers: getAuthHeaders(),
        });
        return response.data as EventData;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.data) throw err.response.data;
            throw new Error(err.message);
        }
        throw err;
    }
};

export const deleteEvent = async (eventId: number) => {
    try {
        const response = await axios.delete(`${API_URL}/events/${eventId}`, {
            headers: getAuthHeaders(),
        });
        return response.data as string;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.data) throw err.response.data;
            throw new Error(err.message);
        }
        throw err;
    }
};
