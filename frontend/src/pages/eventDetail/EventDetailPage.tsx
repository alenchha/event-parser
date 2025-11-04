import { Box,Typography, CircularProgress, Button, Dialog, DialogTitle,
    DialogActions, DialogContent, Snackbar, Alert } from "@mui/material";
import { Header } from "../../widgets/header";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getEventById } from "../../api/events/events";
import { registerForEvent, getEventQRCode } from '../../api/ticket/tickets';
import type { Event } from "../../api/events/events";
import { getCurrentUser } from "../../api/users/users";
import { deleteEvent, updateEvent } from '../../api/admin/events';
import { EventForm } from "../../widgets/eventForm";

export const EventDetailPage = () => {
    const { event_id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [qrCode, setQRCode] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        getCurrentUser()
            .then(user => setRole(user.role))
            .catch(() => setRole(null));
    }, []);


    useEffect(() => {
        if (!event_id) return;

        setLoading(true);
        getEventById(Number(event_id))
            .then(data => setEvent(data))
            .catch(() => setEvent(null))
            .finally(() => setLoading(false));
    }, [event_id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" minWidth="100vw" >
                <CircularProgress sx={{ size: 40, color: "#222222" }} />
            </Box>
        );
    }

    if (!event) {
        return (
            <>
                <Header />
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="calc(100vh - 80px)"
                    px={4}
                >
                    <Typography variant="h6" align="center">
                        Такого события не существует, вернитесь на страницу со всеми событиями.
                    </Typography>
                </Box>
            </>
        );
    }

    const soldOut = event.registration_count >= event.capacity;

    const handleRegister = async () => {
        if (!event) return;
        setSubmitting(true);
        setMessage(null);
        setQRCode(null);
        try {
            await registerForEvent(event.id);
            const qr = await getEventQRCode(event.id);
            setQRCode(qr);
            setMessage("Вы успешно зарегистрировались на событие! Сохраните qrCode или посмотрите его во вкладке 'Аккаунт'.");
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data?.detail) {
                setMessage(`Ошибка: ${err.response.data.detail}`);
            } else {
                setMessage("Ошибка регистрации");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
                <Header />
                <Box sx={{ 
                        display: "flex", 
                        gap: 4, 
                        mt: 10, 
                        p: 4, 
                        width: "100%",
                        minHeight: "calc(100vh - 80px)",
                        boxSizing: "border-box"
                    }}
                >
                    <Box
                        sx={{
                            flex: "0 0 600px",
                            minHeight: 600,
                            borderRadius: 3,
                            background: event.image_url
                                ? `url(${event.image_url}) center/cover no-repeat`
                                : "linear-gradient(0.523turn, rgba(214,255,0,1) 0%, rgba(255,0,127,1) 100%)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />

                    <Box
                        sx={{
                            flex: "0 0 800px",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography sx={{ fontSize: 35, fontWeight: 500, mb: 2 }}>
                                    {event.title}
                                </Typography>
                                <Typography sx={{ fontSize: 24, opacity: 0.9, mb: 2 }}>
                                    {event.date} • {event.time} • {event.place}
                                </Typography>
                                <Typography sx={{ fontSize: 20, opacity: 0.8, whiteSpace: "pre-line", lineHeight: 1.5, mb: 2 }}>
                                    {event.description}
                                </Typography>
                                {event.age_limit !== null && (
                                    <Typography sx={{ fontSize: 18, opacity: 0.7, mb: 1 }}>
                                    Возрастное ограничение: {event.age_limit}+
                                    </Typography>
                                )}
                                {event.event_type?.trim() && (
                                    <Typography sx={{ fontSize: 18, opacity: 0.7 }}>
                                    Тип события: {event.event_type}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ mt: 3 }}>
                                {soldOut ? (
                                    <Button variant="contained" disabled sx={{ width: 272, height: 57, borderRadius: 2 }}>
                                        SOLD OUT
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setOpen(true)}
                                        variant="contained"
                                        sx={{
                                            width: 272,
                                            height: 57,
                                            borderRadius: 2,
                                            fontSize: 20,
                                            background: "linear-gradient(0.744turn, rgba(214,255,0,1) 0%, rgba(255,0,127,1) 100%)",
                                            textTransform: "none",
                                        }}
                                    >
                                        Регистрация
                                    </Button>
                                )}
                                {role === "admin" && (
                                    <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            sx={{ width: 120 }}
                                            onClick={() => setOpenEdit(true)}
                                        >
                                            Edit
                                        </Button>


                                        <Button
                                            variant="outlined"
                                            color="error"
                                            sx={{ width: 120 }}
                                            onClick={() => setOpenDeleteDialog(true)}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle sx={{ textAlign: "center" }}>
                        Регистрация на событие "{event.title}", {event.date}, {event.time}.
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: "center", mt: 2 }}>
                        {message && (
                            <>
                                <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>{message}</Typography>
                                {qrCode && (
                                    <Box
                                        component="img"
                                        src={`data:image/png;base64,${qrCode}`}
                                        alt="QR Code"
                                        sx={{ width: 200, height: 200, mx: "auto" }}
                                    />
                                )}
                            </>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
                        {!qrCode && !submitting && (
                            <Button
                                variant='outlined'
                                onClick={handleRegister}
                                disabled={submitting || !!message}
                                sx={{
                                    color: "#222222",
                                    width: 240,
                                    height: 57,
                                    borderRadius: 2,
                                    borderColor: 'rgba(255,0,127,1)',
                                    fontSize: 20,
                                    textTransform: "none",
                                }}
                            >
                                Зарегистрироваться!
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                    <DialogTitle>Удаление события</DialogTitle>
                    <DialogContent>
                        <Typography>Вы действительно хотите удалить это событие? Это действие необратимо.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>
                            Отмена
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={async () => {
                                try {
                                    await deleteEvent(event.id);
                                    window.location.href = "/events";
                                } catch {
                                    setMessage("Ошибка удаления");
                                }
                            }}
                        >
                            Удалить
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="md">
                    <DialogTitle>Редактирование события</DialogTitle>
                    <DialogContent>
                        {event && (
                            <EventForm
                                initialData={event}
                                mode="edit"
                                onSubmit={async (data) => {
                                    try {
                                        await updateEvent(event.id, data);
                                        setSnackbarMessage("Событие обновлено!");
                                        setSnackbarOpen(true);
                                        setOpenEdit(false);
                                        window.location.reload()
                                    } catch (err: unknown) {
                                        let msg = "Неизвестная ошибка"
                                        if (err && typeof err === "object" && "detail" in err) {
                                            msg = (err as { detail: string }).detail;
                                        } else if (err instanceof Error) {
                                            msg = err.message;
                                        }
                                        setSnackbarMessage(msg)
                                        setSnackbarOpen(true)
                                    }
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
                <Snackbar 
                    open={snackbarOpen} 
                    autoHideDuration={3000} 
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert 
                        onClose={() => setSnackbarOpen(false)} 
                        severity={"error"} 
                        sx={{ width: '100%' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
};
