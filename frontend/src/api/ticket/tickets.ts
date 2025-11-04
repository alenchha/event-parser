import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export async function registerForEvent(event_id: number) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    return axios.post(
        `${API_URL}/events/${event_id}/register`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

export const getEventQRCode = async (event_id: number): Promise<string> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const res = await axios.get(`${API_URL}/events/${event_id}/qrcode`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
    });

    const base64 = btoa(
        new Uint8Array(res.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    return base64;
};

export const unregisterFromEvent = async (event_id: number) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const res = await axios.delete(`${API_URL}/events/${event_id}/unregister`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
