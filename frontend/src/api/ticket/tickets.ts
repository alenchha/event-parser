import apiClient from '../axiosConfig';

export async function registerForEvent(event_id: number) {
    const response = await apiClient.post(`/events/${event_id}/register`);
        return response.data;
}

export const getEventQRCode = async (event_id: number): Promise<string> => {
    const response = await apiClient.get(`/events/${event_id}/qrcode`, {
            responseType: 'arraybuffer',
        });

        const base64 = btoa(
            new Uint8Array(response.data)
                .reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        return base64;
};

export const unregisterFromEvent = async (event_id: number) => {
    const response = await apiClient.delete(`/events/${event_id}/unregister`);
    return response.data;
};
