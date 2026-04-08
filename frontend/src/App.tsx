import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage, RegisterPage, EventsPage, EventDetailPage, ProfilePage, CreateEventPage, UsersPage } from './pages'
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import { AdminRoute } from './app/routes/AdminRoute';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/700.css";
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
    typography: {
        fontFamily: "'Oswald', sans-serif",
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <HelmetProvider>
                <Helmet>
                    <title>AfishAI</title>
                    <meta name="description" content="Афиша событий. Концерты, спектакли, выставки." />
                </Helmet>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/" element={<LoginPage />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route path="/events/:event_id" element={<EventDetailPage />} />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/upload"
                                element={
                                    <ProtectedRoute>
                                        <AdminRoute>
                                            <CreateEventPage />
                                        </AdminRoute>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute>
                                        <AdminRoute>
                                            <UsersPage />
                                        </AdminRoute>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </HelmetProvider>
        </ThemeProvider>
    )
}

export default App;
