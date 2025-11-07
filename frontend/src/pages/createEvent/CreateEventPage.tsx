import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Card,
    Stack,
    Paper,
} from "@mui/material";
import { Header } from "../../widgets/header";
import { parseEventImage, createEvent } from "../../api/admin/events";
import type { EventData } from "../../api/admin/events";
import { getCurrentUser } from "../../api/users/users";

interface EventFormData extends Partial<EventData> {
    capacity?: number | null;
    age_limit?: number | null;
}

export const CreateEventPage = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [eventData, setEventData] = useState<EventFormData>({
        title: "",
        date: "",
        time: "",
        place: "",
        capacity: null,
        age_limit: null,
        description: "",
        event_type: "",
        image_url: "",
    });

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await getCurrentUser();
                if (data.role !== "admin") {
                    window.location.href = "/events";
                }
            } catch {
                window.location.href = "/";
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0])
            setFile(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleParse = async () => {
        if (!file) return;
        try {
            setSubmitting(true);
            const parsed = await parseEventImage(file);
            setEventData((prev) => ({ ...prev, ...parsed }));
        } catch (err: unknown) {
            if (err && typeof err === "object" && "detail" in err) {
                setError((err as { detail: string }).detail);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Неизвестная ошибка");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (
            !eventData.title ||
            !eventData.date ||
            !eventData.time ||
            !eventData.place ||
            eventData.capacity == null
        ) {
            setError("Пожалуйста, заполните все обязательные поля!");
            return;
        }

        try {
            setSubmitting(true);
            const payload: EventFormData = {
                ...eventData,
                age_limit: eventData.age_limit ?? null,
            };

            await createEvent(payload);

            setSuccess(true);
            setEventData({
                title: "",
                date: "",
                time: "",
                place: "",
                capacity: null,
                age_limit: null,
                description: "",
                event_type: "",
                image_url: "",
            });
            setFile(null);
        } catch (err: unknown) {
            if (err && typeof err === "object" && "detail" in err) {
                const detail = (err as { detail: string | Array<{ msg: string }> }).detail;
                if (Array.isArray(detail)) {
                    setError(detail.map((d) => d.msg).join(", "));
                } else {
                    setError(detail);
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Неизвестная ошибка");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    bgcolor: "rgba(255,255,255,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress sx={{ size: 40, color: "#222222" }} />
            </Box>
        );
    }

    return (
        <>
            <Header />
            <Box sx={{ p: 4, maxWidth: 1400, mx: "auto", mt: 10 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 3,
                    }}
                >
                    <Card
                        sx={{
                            flex: "0 0 400px",
                            height: { xs: "400px", md: "400px" },
                            p: 4,
                            boxShadow: 3,
                            borderRadius: 3,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography variant="h5" sx={{ mb: 3 }}>
                            Загрузка изображения
                        </Typography>
                        <Paper
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            sx={{
                                flex: 1,
                                border: "2px dashed",
                                borderColor: "grey.400",
                                borderRadius: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                mb: 2,
                                p: 2,
                            }}
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                style={{ width: "100%", textAlign: "center", cursor: "pointer" }}
                            >
                                {file ? (
                                    <Typography fontWeight="bold">{file.name}</Typography>
                                ) : (
                                    <>
                                        <Typography>Перетащи сюда файл</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            или кликни, чтобы выбрать
                                        </Typography>
                                    </>
                                )}
                            </label>
                        </Paper>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleParse}
                            disabled={!file || submitting}
                            fullWidth
                            sx={{ py: 2 }}
                        >
                            {submitting ? "Парсим афишу. Это займёт некоторое время, подождите!" : "Загрузить файл"}
                        </Button>
                    </Card>

                    <Card
                        sx={{
                            flex: "0 0 1050px",
                            p: 4,
                            boxShadow: 3,
                            borderRadius: 3,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Typography variant="h5" sx={{ mb: 3 }}>
                            Создание события
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label="Название"
                                value={eventData.title}
                                onChange={(e) =>
                                    setEventData((prev) => ({ ...prev, title: e.target.value }))
                                }
                                fullWidth
                                required
                            />
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Дата (дд.мм.гггг)"
                                    value={eventData.date}
                                    onChange={(e) =>
                                        setEventData((prev) => ({ ...prev, date: e.target.value }))
                                    }
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Время (чч:мм)"
                                    value={eventData.time}
                                    onChange={(e) =>
                                        setEventData((prev) => ({ ...prev, time: e.target.value }))
                                    }
                                    fullWidth
                                    required
                                />
                            </Box>
                            <TextField
                                label="Место"
                                value={eventData.place}
                                onChange={(e) =>
                                    setEventData((prev) => ({ ...prev, place: e.target.value }))
                                }
                                fullWidth
                                required
                            />
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Вместимость"
                                    type="number"
                                    value={eventData.capacity ?? ""}
                                    onChange={(e) =>
                                        setEventData((prev) => ({
                                            ...prev,
                                            capacity: e.target.value === "" ? null : +e.target.value,
                                        }))
                                    }
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Возрастное ограничение"
                                    type="number"
                                    value={eventData.age_limit ?? ""}
                                    onChange={(e) =>
                                        setEventData((prev) => ({
                                            ...prev,
                                            age_limit: e.target.value === "" ? null : +e.target.value,
                                        }))
                                    }
                                    fullWidth
                                />
                            </Box>
                            <TextField
                                label="Описание"
                                multiline
                                rows={2}
                                value={eventData.description}
                                onChange={(e) =>
                                    setEventData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                fullWidth
                            />
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Тип события"
                                    value={eventData.event_type ?? ""}
                                    onChange={(e) =>
                                        setEventData((prev) => ({ ...prev, event_type: e.target.value }))
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="URL изображения"
                                    value={eventData.image_url ?? ""}
                                    onChange={(e) =>
                                        setEventData((prev) => ({ ...prev, image_url: e.target.value }))
                                    }
                                    fullWidth
                                />
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={submitting}
                                sx={{ mt: 1 }}
                            >
                                {submitting ? "Ожидание..." : "Создать событие"}
                            </Button>
                        </Stack>
                    </Card>
                </Box>
            </Box>

            <Snackbar
                open={!!error}
                autoHideDuration={4000}
                onClose={() => setError(null)}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={4000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success">Событие успешно создано!</Alert>
            </Snackbar>
        </>
    );
};
