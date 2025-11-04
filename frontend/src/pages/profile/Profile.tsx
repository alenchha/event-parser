import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import axios from "axios";
import { getCurrentUser } from "../../api/users/users";
import type { CurrentUserResponse } from "../../api/users/users";
import { getEventQRCode, unregisterFromEvent } from "../../api/ticket/tickets";
import { Header } from "../../widgets/header";

export const ProfilePage = () => {
    const [user, setUser] = useState<CurrentUserResponse | null>(null);
    const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
    const [openUnregisterConfirm, setOpenUnregisterConfirm] = useState(false);
    const [pendingEventId, setPendingEventId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const getErrorMessage = (e: unknown, defaultMsg: string): string => {
        if (axios.isAxiosError(e)) {
            const data = e.response?.data;
            if (data && typeof data === "object" && "detail" in data && typeof (data as { detail?: string }).detail === "string") {
                return (data as { detail: string }).detail;
            }
            return e.message || defaultMsg;
        }
        return defaultMsg;
    };

    const load = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data);

            for (const ev of data.registered_events) {
                const qr = await getEventQRCode(ev.id);
                setQrCodes(prev => ({ ...prev, [ev.id]: qr }));
            }
        } catch (e: unknown) {
            setErrorMessage(getErrorMessage(e, "Не удалось загрузить данные пользователя"));
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUnregister = async (event_id: number) => {
        try {
            await unregisterFromEvent(event_id);
            setUser(prev =>
                prev
                    ? {
                          ...prev,
                          registered_events: prev.registered_events.filter(
                              e => e.id !== event_id
                          ),
                      }
                    : prev
            );
        } catch (e: unknown) {
            setErrorMessage(getErrorMessage(e, "Не удалось отменить регистрацию"));
            setSnackbarOpen(true);
        }
    };

    if (loading || !user)
        return (
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
        );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDateDMY = (str: string) => {
        const [day, month, year] = str.split(".").map(Number);
        return new Date(year, month - 1, day);
    };

    const upcomingEvents = user.registered_events.filter(ev => parseDateDMY(ev.date) >= today);
    const pastEvents = user.registered_events.filter(ev => parseDateDMY(ev.date) < today);

    return (
        <>
            <Header />

            <Box sx={{ p: 4, bgcolor: "#FAFAFA" }}>
                <Box sx={{ mt: 10 }} >
                    <Typography variant="h5">
                        Ваши предстоящие мероприятия:
                    </Typography>

                    {upcomingEvents.length === 0 && (
                        <Typography variant="body1" sx={{ opacity: 0.7, mt: 2 }}>
                            Нет будущих мероприятий
                        </Typography>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 3,
                            mt: 4,
                        }}
                    >
                        {upcomingEvents.map((ev) => (
                            <Box
                                key={ev.id}
                                sx={{
                                    background: "#222",
                                    border: "1px solid #333",
                                    borderRadius: 3,
                                    p: 2,
                                    color: "#fafafa",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.5,
                                }}
                            >
                                <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
                                    {ev.title}
                                </Typography>
                                <Typography sx={{ opacity: 0.7 }}>
                                    {ev.date} • {ev.time} • {ev.place}
                                </Typography>

                                <Box sx={{ mt: 2 }}>
                                    <Box
                                        component="img"
                                        src={`data:image/png;base64,${qrCodes[ev.id]}`}
                                        sx={{ width: 120, height: 120, borderRadius: 2 }}
                                    />
                                </Box>

                                <Button
                                    color="error"
                                    size="small"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={() => {
                                        setPendingEventId(ev.id);
                                        setOpenUnregisterConfirm(true);
                                    }}
                                >
                                    Отменить
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx= {{ mt: 3 }}> 
                    <Typography variant="h5">
                        Ваши прошедшие мероприятия:
                    </Typography>

                    {pastEvents.length === 0 && (
                        <Typography variant="body1" sx={{ opacity: 0.7, mt: 2 }}>
                            Нет прошедших мероприятий
                        </Typography>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 3,
                            mt: 4,
                        }}
                    >
                        {pastEvents.map((ev) => (
                            <Box
                                key={ev.id}
                                sx={{
                                    background: "#1b1b1b",
                                    border: "1px solid #262626",
                                    borderRadius: 3,
                                    p: 2,
                                    color: "#777",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.5,
                                    opacity: 0.6,
                                }}
                            >
                                <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#aaa" }}>
                                    {ev.title}
                                </Typography>
                                <Typography sx={{ opacity: 0.5 }}>
                                    {ev.date} • {ev.time} • {ev.place}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            <Dialog
                open={openUnregisterConfirm}
                onClose={() => setOpenUnregisterConfirm(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Отменить регистрацию?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ opacity: 0.8 }}>
                        Вы уверены, что хотите отменить регистрацию на это мероприятие?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUnregisterConfirm(false)}>Отмена</Button>
                    <Button
                        color="error"
                        onClick={async () => {
                            if (pendingEventId !== null) {
                                await handleUnregister(pendingEventId);
                            }
                            setPendingEventId(null);
                            setOpenUnregisterConfirm(false);
                        }}
                    >
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
};
