import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { LoginPage } from '../../pages/login/LoginPage';
import { beforeEach } from 'vitest';

const mockLogin = vi.fn();

vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            login: mockLogin,
            logout: vi.fn(),
            refreshUser: vi.fn(),
        }),
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        mockLogin.mockClear();
    });

    it('отображает форму входа', () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <LoginPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        expect(screen.getAllByText(/Login/i)[0]).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ivanovii25/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/12345678/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('вызывает login при отправке формы', async () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <LoginPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        const usernameInput = screen.getByPlaceholderText(/ivanovii25/i);
        const passwordInput = screen.getByPlaceholderText(/12345678/i);
        const submitButton = screen.getByRole('button', { name: /Login/i });

        fireEvent.change(usernameInput, { target: { value: 'admin' } });
        fireEvent.change(passwordInput, { target: { value: 'admin123' } });
        fireEvent.click(submitButton);

        expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
    });

    it('показывает ошибку при неудачном входе', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <LoginPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        const usernameInput = screen.getByPlaceholderText(/ivanovii25/i);
        const passwordInput = screen.getByPlaceholderText(/12345678/i);
        const submitButton = screen.getByRole('button', { name: /Login/i });

        fireEvent.change(usernameInput, { target: { value: 'wrong' } });
        fireEvent.change(passwordInput, { target: { value: 'wrong' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/login failed/i)).toBeInTheDocument();
        });
    });
});
