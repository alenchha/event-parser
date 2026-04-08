import axios from "axios";
import apiClient from '../axiosConfig';

export interface WeatherResponse {
    city: string;
    temperature: number;
    feels_like: number;
    humidity: number;
    description: string;
    icon: string;
    error?: string;
}

export const getWeather = async (city: string): Promise<WeatherResponse> => {
    try {
        const response = await apiClient.get<WeatherResponse>(`/weather/${encodeURIComponent(city)}`);
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response) {
                return { error: err.response.data?.error || "Ошибка получения погоды" } as WeatherResponse;
            }
        }
        return { error: "Не удалось загрузить погоду" } as WeatherResponse;
    }
};
