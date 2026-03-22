import axios from "axios";
import apiClient from '../axiosConfig';

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

export const parseEventImage = async (file: File): Promise<Partial<EventData>> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await apiClient.post('/events/parse_image', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
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
        const response = await apiClient.post('/events/create', data);
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
        const response = await apiClient.patch(`/events/${eventId}`, data);
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
        const response = await apiClient.delete(`/events/${eventId}`);
        return response.data as string;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.data) throw err.response.data;
            throw new Error(err.message);
        }
        throw err;
    }
};
