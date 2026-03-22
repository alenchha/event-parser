import axios from "axios";
import apiClient from '../axiosConfig';

export interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    place: string;
    capacity: number;
    description?: string;
    age_limit?: number;
    event_type?: string;
    registration_count: number;
    image_url?: string;
    participants: unknown[];
}

export const getEvents = async (): Promise<Event[]> => {

    try {
        const response = await apiClient.get<Event[]>('/events');
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) throw err.response.data;
        }
        throw err;
    }
};

export const getEventById = async (id: number): Promise<Event> => {
    try {
        const response = await apiClient.get<Event>(`/events/${id}`);
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) throw err.response.data;
        }
        throw err;
    }
};
