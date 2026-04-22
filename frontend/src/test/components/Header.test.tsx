import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { Header } from '../../widgets/header/Header';

describe('Header', () => {
    it('отображает навигационные ссылки', () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Header />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        expect(screen.getByText(/события/i)).toBeInTheDocument();
        expect(screen.getByText(/аккаунт/i)).toBeInTheDocument();
    });
});
