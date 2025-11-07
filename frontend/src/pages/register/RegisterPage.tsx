import { Box, Grid, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/logo.png';
import picreg from '../../../public/picreg.jpg';
import { registerUser } from "../../api/auth/auth";

interface ErrorResponse {
    detail?: string | string[];
}

export const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async () => {
        setLoading(true);
        try {
            await registerUser({ username, password });
            setUsername("");
            setPassword("");
            navigate("/");
        } catch (error: unknown) {
            console.error("Ошибка регистрации:", error);

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
                            Register
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
                                onClick={handleRegister}
                            >
                                Register
                            </Button>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{ mt: 2, color: "#222222", fontSize: 16, cursor: "pointer" }}
                            onClick={() => navigate("/")}
                        >
                            Already have an account? Login →
                        </Typography>
                    </Box>
                </Grid>
                <Grid
                    gridColumn={{ xs: "span 12", md: "span 6" }}
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                    <Box sx={{ width: 840, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-end", gap: 0 }}>
                        <Typography sx={{ marginRight: 13, fontSize: 30, fontWeight: 400, letterSpacing: "10px", color: "#222222", marginBottom: 0 }}>
                            master classes,clubs
                        </Typography>
                        <Box sx={{ width: 840, height: 620, alignSelf: "flex-end", margin: 0 }}>
                            <img
                                src={picreg}
                                style={{ marginLeft: 100, width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                            />
                        </Box>
                        <Typography sx={{ marginRight: 13.5, fontSize: 30, fontWeight: 400, letterSpacing: "10px", color: "#222222", marginTop: 0 }}>
                            exhibitions,concerts
                        </Typography>
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
