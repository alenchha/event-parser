import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

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
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
        const response = await axios.get<Event[]>(`${API_URL}/events/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) throw err.response.data;
        }
        throw err;
    }
};

export async function getEventById(id: number) {
    const res = await fetch(`${API_URL}/events/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        throw new Error("Event not found");
    }

    return res.json();
}
