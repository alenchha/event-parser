import { Box, Grid, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/logo.png';
import log1 from'../../../public/log1.webp';
import log2 from '../../../public/log2.webp';
import { loginUser } from "../../api/auth/auth";

interface ErrorResponse {
    detail?: string | string[];
}

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const data = await loginUser({ username, password });
            localStorage.setItem("token", data.access_token);
            setUsername("");
            setPassword("");
            navigate("/events");
        } catch (error: unknown) {
            console.error("Ошибка входа:", error);

            const err = error as ErrorResponse;
            setSnackbarMessage(
                typeof err.detail === "string"
                    ? err.detail
                    : Array.isArray(err.detail)
                    ? err.detail.join(", ")
                    : "Registration failed"
            );
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Grid container sx={{ minHeight: "100vh", bgcolor: "#FAFAFA" }}>
                <Grid
                    gridColumn={{ xs: "span 12", md: "span 6" }}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        paddingLeft: 8,
                        paddingTop: 2,
                    }}
                >
                    <img src={logo} style={{ width: 199, height: 39, marginTop: 5, marginLeft: 117 }} />

                    <Box sx={{ ml: 14, mt: 16 }}>
                        <Typography variant="h3" fontWeight={400} fontSize={40} color="#222222">
                            Login
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", maxWidth: 380, mt: 3 }}>
                            <Typography fontSize={20} color="#222222">Your Username</Typography>
                            <TextField
                                type="text"
                                placeholder="ivanovii25"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ width: 359, mt: 1 }}
                                InputProps={{
                                    sx: {
                                        height: 50,
                                        borderRadius: 3,
                                        borderColor: "#222222",
                                        fontSize: 16,
                                        fontWeight: 300,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: "#222222" },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#222222" },
                                    },
                                }}
                            />

                            <Typography fontSize={20} color="#222222" mt={3}>Your Password</Typography>
                            <TextField
                                type="password"
                                placeholder="12345678"
                                sx={{ width: 359, mt: 1 }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    sx: {
                                        height: 50,
                                        borderRadius: 3,
                                        borderColor: "#222222",
                                        fontSize: 16,
                                        fontWeight: 300,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: "#222222" },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#222222" },
                                    },
                                }}
                            />

                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    width: 359,
                                    bgcolor: "#222222",
                                    mt: 3,
                                    borderRadius: 3,
                                    height: 50,
                                    fontSize: 18,
                                    textTransform: "none"
                                }}
                                onClick={handleLogin}
                            >
                                Login
                            </Button>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{ mt: 2, color: "#222222", fontSize: 16, cursor: "pointer" }}
                            onClick={() => navigate("/register")}
                        >
                            Don't have an account? Register →
                        </Typography>
                    </Box>
                </Grid>
                <Grid
                    gridColumn={{ xs: "span 12", md: "span 6" }}
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                    <Box sx={{ width: 840, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-end", gap: 0 }}>
                        <Box sx={{ position: "relative", width: 246, height: 328, marginRight: 49, marginTop: -10 }}>
                            <img
                                src={log1}
                                style={{
                                width: 246,
                                height: 328,
                                objectFit: "contain",
                                display: "block",
                                }}
                            />
                            <img
                                src={log2}
                                style={{
                                position: "absolute",
                                top: 162,
                                left: 127,
                                width: 412,
                                height: 309,
                                objectFit: "contain",
                                }}
                            />

                            <Typography
                                sx={{
                                position: "absolute",
                                top: 120,
                                left: 543,
                                transform: "translateX(-100%)",
                                fontSize: 30,
                                fontWeight: 400,
                                letterSpacing: "7px",
                                color: "#222222",
                                whiteSpace: "nowrap",
                                }}
                            >
                                The best events
                            </Typography>

                            <Typography
                                sx={{
                                position: "absolute",
                                top: 162,
                                left: 127 + 412,
                                transform: "rotate(90deg) translateY(-100%)",
                                transformOrigin: "top left",
                                fontSize: 30,
                                fontWeight: 400,
                                letterSpacing: "7px",
                                color: "#222222",
                                whiteSpace: "nowrap",
                                }}
                            >
                                all in one place
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            {loading && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        bgcolor: "rgba(255, 255, 255, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <CircularProgress sx={{ color: "#222222" }} size={40} />
                </Box>
            )}
        </>
    );
};
