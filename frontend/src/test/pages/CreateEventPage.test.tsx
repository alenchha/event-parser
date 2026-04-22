import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { CreateEventPage } from '../../pages/createEvent/CreateEventPage';

const mockCreateEvent = vi.fn();
const mockParseEventImage = vi.fn();

vi.mock('../../api/admin/events', () => ({
    createEvent: (...args: unknown[]) => mockCreateEvent(...args),
    parseEventImage: (...args: unknown[]) => mockParseEventImage(...args),
}));

vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: { id: 1, username: 'admin', role: 'admin' },
            isAuthenticated: true,
            isLoading: false,
        }),
    };
});

describe('CreateEventPage', () => {
    beforeEach(() => {
        mockCreateEvent.mockClear();
        mockParseEventImage.mockClear();
    });

    it('отображает форму создания события', () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <CreateEventPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        expect(screen.getByText(/Создание события/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Название/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Дата/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Время/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Место/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Вместимость/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Создать событие/i })).toBeInTheDocument();
    });

    it('показывает ошибку при пустых обязательных полях', async () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <CreateEventPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        const submitButton = screen.getByRole('button', { name: /Создать событие/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Пожалуйста, заполните все обязательные поля/i)).toBeInTheDocument();
        });
    });

    it('вызывает createEvent при заполнении формы', async () => {
        mockCreateEvent.mockResolvedValueOnce({ id: 1 });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <CreateEventPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        fireEvent.change(screen.getByLabelText(/Название/i), { target: { value: 'Тестовое событие' } });
        fireEvent.change(screen.getByLabelText(/Дата/i), { target: { value: '31.12.2026' } });
        fireEvent.change(screen.getByLabelText(/Время/i), { target: { value: '20:00' } });
        fireEvent.change(screen.getByLabelText(/Место/i), { target: { value: 'Москва' } });
        fireEvent.change(screen.getByLabelText(/Вместимость/i), { target: { value: '100' } });

        const submitButton = screen.getByRole('button', { name: /Создать событие/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalled();
        });
    });
});
