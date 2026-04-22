import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute } from '../../app/routes/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
    it('показывает children для авторизованного пользователя', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
        });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div data-testid="protected-content">Защищённый контент</div>
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('редиректит на / для неавторизованного пользователя', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
        });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Скрытый контент</div>
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(window.location.pathname).toBe('/');
    });
});
