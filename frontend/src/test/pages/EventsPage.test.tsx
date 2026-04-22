import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { EventsPage } from '../../pages/events/EventsPage';

describe('EventsPage', () => {
    it('отображает мета-теги', async () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <EventsPage />
                    </AuthProvider>
                </BrowserRouter>
            </HelmetProvider>
        );

        await waitFor(() => {
            expect(document.title).toBe('Афиша событий');
        });

        const metaDescription = document.querySelector('meta[name="description"]');
        expect(metaDescription).toHaveAttribute('content', expect.stringContaining('события'));
    });
});
