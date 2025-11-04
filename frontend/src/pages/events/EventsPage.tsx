import { Box, Typography, CircularProgress, TextField } from "@mui/material";
import { Header } from '../../widgets/header';
import { useEffect, useState } from "react";
import { getEvents } from "../../api/events/events";
import type { Event } from "../../api/events/events";

export const EventsPage = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [ageFilter, setAgeFilter] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    // debounced значения
    const [debouncedAge, setDebouncedAge] = useState<number | null>(ageFilter);
    const [debouncedSearch, setDebouncedSearch] = useState(searchText);
    const [debouncedDateFrom, setDebouncedDateFrom] = useState(dateFrom);
    const [debouncedDateTo, setDebouncedDateTo] = useState(dateTo);

    // debounce эффект
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedAge(ageFilter);
            setDebouncedSearch(searchText);
            setDebouncedDateFrom(dateFrom);
            setDebouncedDateTo(dateTo);
        }, 300); // задержка 300ms

        return () => clearTimeout(handler);
    }, [ageFilter, searchText, dateFrom, dateTo]);

    useEffect(() => {
        setLoading(true);
        getEvents()
            .then(data => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const parseDateDMY = (str: string) => {
                    const [day, month, year] = str.split(".").map(Number);
                    return new Date(year, month - 1, day);
                };
                const upcomingEvents = data.filter(ev => parseDateDMY(ev.date) >= today);
                setEvents(upcomingEvents);
                setError(false);
            })
            .catch(err => {
                console.error("Failed to fetch events", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    const parseDateInput = (value: string) => value ? new Date(value) : null;

    const filteredEvents = events.filter(ev => {
        const evDate = new Date(ev.date.split(".").reverse().join("-")); // перевод в YYYY-MM-DD

        const matchesAge = !debouncedAge || (ev.age_limit && ev.age_limit <= debouncedAge);
        const matchesSearch = !debouncedSearch || ev.title.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesDateFrom = !debouncedDateFrom || evDate >= parseDateInput(debouncedDateFrom)!;
        const matchesDateTo = !debouncedDateTo || evDate <= parseDateInput(debouncedDateTo)!;

        return matchesAge && matchesSearch && matchesDateFrom && matchesDateTo;
    });

    return (
        <Box >
            <Header />

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

            <Box sx={{ minHeight: "100vh", mt: 10, p: 4, backgroundColor: "#FAFAFA" }}>
                {error ? (
                    <Typography variant="h6" align="center" color="#222222">
                        Connection error
                    </Typography>
                ) : events.length === 0 && !loading ? (
                    <Typography variant="h6" align="center" color="#222222">
                        No upcoming events
                    </Typography>
                ) : (
                    <>
                        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                            <TextField
                                label="Возрастное ограничение"
                                type="number"
                                size="small"
                                value={ageFilter ?? ""}
                                onChange={e => setAgeFilter(e.target.value ? Number(e.target.value) : null)}
                                placeholder="16"
                                sx={{
                                    width: "190px"
                                }}
                            />
                            <TextField
                                label="Поиск по названию"
                                size="small"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                sx={{ width: 220 }}
                            />
                            <TextField
                                label="Дата от"
                                type="date"
                                size="small"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 160 }}
                            />
                            <TextField
                                label="Дата до"
                                type="date"
                                size="small"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 160 }}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, 340px)",
                                    md: "repeat(4, 340px)",
                                },
                                gap: "30px",
                                minWidth: "calc(4 * 340px + 3 * 30px)",
                                maxWidth: 1700,
                            }}
                        >
                            {filteredEvents.map(event => (
                                <Box
                                    key={event.id}
                                    sx={{
                                        width: 340,
                                        height: 340,
                                        borderRadius: 2,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        overflow: "hidden",
                                        background: event.image_url
                                            ? `url(${event.image_url}) center/cover no-repeat`
                                            : "linear-gradient(0.523turn, rgba(214,255,0,1) 0%, rgba(255,0,127,1) 100%)",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        position: "relative",
                                    }}
                                >
                                    <a
                                        href={`/events/${event.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: "none", display: "block", width: "100%", height: "100%" }}
                                    >
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                width: "100%",
                                                height: 75,
                                                bgcolor: "rgba(0,0,0,0.6)",
                                                px: 2,
                                                py: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                borderBottomLeftRadius: 10,
                                                borderBottomRightRadius: 10,
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 20, fontWeight: 300, color: "#fefefe" }} noWrap>
                                                {event.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: 14, color: "#fefefe" }} noWrap>
                                                {event.date} — {event.place}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 24,
                                                right: 12,
                                                fontSize: 18,
                                                fontWeight: 500,
                                                color: "#fefefe",
                                                opacity: 0.8,
                                                cursor: "pointer",
                                            }}
                                        >
                                            ➤
                                        </Box>
                                    </a>
                                </Box>
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};
