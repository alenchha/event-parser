import { useState } from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import type { Event } from "../../api/events/events";
import type { EventData } from "../../api/admin/events";

interface EventFormProps {
    initialData: Partial<Event> | Partial<EventData>;
    mode: "create" | "edit";
    onSubmit: (data: EventData) => Promise<void>;
}

export const EventForm = ({ initialData, mode, onSubmit }: EventFormProps) => {
    const [data, setData] = useState<EventData>({
        title: initialData.title ?? "",
        date: initialData.date ?? "",
        time: initialData.time ?? "",
        place: initialData.place ?? "",
        capacity: initialData.capacity ?? null,
        age_limit: initialData.age_limit ?? null,
        description: initialData.description ?? "",
        event_type: initialData.event_type ?? "",
        image_url: initialData.image_url ?? "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit(data);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {mode === "edit" ? "Изменить событие" : "Создать событие"}
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label="Название"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    required
                />
                <Box display="flex" gap={2}>
                    <TextField
                        label="Дата (дд.мм.гггг)"
                        value={data.date}
                        onChange={(e) => setData({ ...data, date: e.target.value })}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Время (чч:мм)"
                        value={data.time}
                        onChange={(e) => setData({ ...data, time: e.target.value })}
                        fullWidth
                        required
                    />
                </Box>
                <TextField
                    label="Место"
                    value={data.place}
                    onChange={(e) => setData({ ...data, place: e.target.value })}
                    required
                />
                <Box display="flex" gap={2}>
                    <TextField
                        label="Вместимость"
                        type="number"
                        value={data.capacity ?? ""}
                        onChange={(e) =>
                        setData({ ...data, capacity: e.target.value === "" ? null : +e.target.value })
                        }
                        fullWidth
                        required
                    />
                    <TextField
                        label="Возрастное ограничение"
                        type="number"
                        value={data.age_limit ?? ""}
                        onChange={(e) =>
                        setData({ ...data, age_limit: e.target.value === "" ? null : +e.target.value })
                        }
                        fullWidth
                    />
                </Box>
                <TextField
                    label="Описание"
                    multiline
                    rows={2}
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                />
                <Box display="flex" gap={2}>
                    <TextField
                        label="Тип события"
                        value={data.event_type ?? ""}
                        onChange={(e) => setData({ ...data, event_type: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="URL изображения"
                        value={data.image_url ?? ""}
                        onChange={(e) => setData({ ...data, image_url: e.target.value })}
                        fullWidth
                    />
                </Box>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting
                        ? (mode === "edit" ? "Сохранение..." : "Создание...")
                        : (mode === "edit" ? "Сохранить" : "Создать")}
                </Button>
            </Stack>
        </Box>
    );
};
