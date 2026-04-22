import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { UsersPage } from '../../pages/users/UsersPage';

const mockGetUsers = vi.fn();

vi.mock('../../api/admin/users', () => ({
    getUsers: () => mockGetUsers(),
}));

vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: { id: 1, username: 'admin', role: 'admin' },
            isAuthenticated: true,
        }),
    };
});

describe('UsersPage', () => {
    it('отображает заголовок страницы пользователей', () => {
        mockGetUsers.mockResolvedValueOnce([]);

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <UsersPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        expect(screen.getByText(/Пользователи/i)).toBeInTheDocument();
    });
});
