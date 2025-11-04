import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage, RegisterPage, EventsPage, EventDetailPage, ProfilePage, CreateEventPage } from './pages'
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/700.css";

const theme = createTheme({
    typography: {
        fontFamily: "'Oswald', sans-serif",
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/events"
                        element={
                            <ProtectedRoute>
                                <EventsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/events/:event_id"
                        element={
                            <ProtectedRoute>
                                <EventDetailPage />
                            </ProtectedRoute>
                        }
                    />
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
                                <CreateEventPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App;
