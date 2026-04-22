import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { EventDetailPage } from '../../pages/eventDetail/EventDetailPage';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ event_id: '1' }),
    };
});

const mockGetEventById = vi.fn();
const mockGetWeather = vi.fn();

vi.mock('../../api/events/events', () => ({
    getEventById: (...args: unknown[]) => mockGetEventById(...args),
}));

vi.mock('../../api/weather/weather', () => ({
    getWeather: (...args: unknown[]) => mockGetWeather(...args),
}));

describe('EventDetailPage', () => {
    beforeEach(() => {
        mockGetEventById.mockClear();
        mockGetWeather.mockClear();
    });

    it('отображает загрузку', () => {
        mockGetEventById.mockImplementation(() => new Promise(() => {}));

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <EventDetailPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('отображает детали события после загрузки', async () => {
        mockGetEventById.mockResolvedValueOnce({
            id: 1,
            title: 'Тестовое событие',
            date: '31.12.2026',
            time: '20:00',
            place: 'Москва',
            description: 'Тестовое описание',
            age_limit: 16,
            event_type: 'Концерт',
            registration_count: 10,
            capacity: 100,
            image_url: 'https://example.com/image.jpg',
        });
        mockGetWeather.mockResolvedValueOnce({
            temperature: 15,
            feels_like: 14,
            humidity: 65,
            description: 'облачно',
            icon: '04d',
        });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <EventDetailPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Тестовое событие')).toBeInTheDocument();
            expect(screen.getByText('31.12.2026 • 20:00 • Москва')).toBeInTheDocument();
            expect(screen.getByText('Тестовое описание')).toBeInTheDocument();
        });
    });

    it('отображает сообщение об ошибке, если событие не найдено', async () => {
        mockGetEventById.mockRejectedValueOnce(new Error('Not found'));

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <EventDetailPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Такого события не существует/i)).toBeInTheDocument();
        });
    });
});
