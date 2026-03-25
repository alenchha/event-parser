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

export interface EventsResponse {
    items: Event[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
}

interface GetEventsParams {
    skip?: number;
    limit?: number;
    search?: string;
    age_limit?: number;
    date_from?: string;
    date_to?: string;
    event_type?: string;
    place?: string;
    sort_by?: string;
    sort_order?: string;
}
export const getEvents = async (params: GetEventsParams = {}): Promise<EventsResponse> => {
    try {
        const response = await apiClient.get<EventsResponse>('/events', { params });
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
