import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { RegisterPage } from '../../pages/register/RegisterPage';

const mockRegister = vi.fn();

vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            register: mockRegister,
            isLoading: false,
            error: null,
        }),
    };
});

describe('RegisterPage', () => {
    beforeEach(() => {
        mockRegister.mockClear();
    });

    it('отображает форму регистрации', () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <RegisterPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        expect(screen.getAllByText(/Register/i)[0]).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ivanovii25/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/12345678/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });

    it('вызывает register при отправке формы', async () => {
        mockRegister.mockResolvedValueOnce({});

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <RegisterPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        const usernameInput = screen.getByPlaceholderText(/ivanovii25/i);
        const passwordInput = screen.getByPlaceholderText(/12345678/i);
        const submitButton = screen.getByRole('button', { name: /Register/i });

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('newuser', 'password123');
        });
    });
});
