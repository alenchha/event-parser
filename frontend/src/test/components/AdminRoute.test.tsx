import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AdminRoute } from '../../app/routes/AdminRoute';

const mockUseAuth = vi.fn();

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('AdminRoute', () => {
    it('показывает children для администратора', () => {
        mockUseAuth.mockReturnValue({
            user: { role: 'admin' },
            isLoading: false,
        });

        render(
            <BrowserRouter>
                <AdminRoute>
                    <div data-testid="admin-content">Админ панель</div>
                </AdminRoute>
            </BrowserRouter>
        );

        expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    it('редиректит на /events для обычного пользователя', () => {
        mockUseAuth.mockReturnValue({
            user: { role: 'user' },
            isLoading: false,
        });

        render(
            <BrowserRouter>
                <AdminRoute>
                    <div>Скрытый контент</div>
                </AdminRoute>
            </BrowserRouter>
        );

        expect(window.location.pathname).toBe('/events');
    });

    it('показывает загрузку пока isLoading = true', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: true,
        });

        render(
            <BrowserRouter>
                <AdminRoute>
                    <div>Контент</div>
                </AdminRoute>
            </BrowserRouter>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
