import { Box, Typography, CircularProgress, TextField, FormControl, MenuItem, Button, Select, InputLabel, Stack, Pagination } from "@mui/material";
import { Header } from '../../widgets/header';
import { useEffect, useState } from "react";
import { getEvents } from "../../api/events/events";
import type { Event, EventsResponse } from "../../api/events/events";
import { Link, useSearchParams } from "react-router-dom";
import { MetaTags } from "../../components/MetaTags";

export const EventsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchText, setSearchText] = useState(searchParams.get("search") || "");
    const [ageFilter, setAgeFilter] = useState(searchParams.get("age") || "");
    const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
    const [dateTo, setDateTo] = useState(searchParams.get("date_to") || "");
    const [eventType, setEventType] = useState(searchParams.get("type") || "");
    const [place, setPlace] = useState(searchParams.get("place") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "date");
    const [sortOrder, setSortOrder] = useState(searchParams.get("sort_order") || "asc");
    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
    const [limit] = useState(4);
    
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setPage(1);
    }, [searchText, ageFilter, dateFrom, dateTo, eventType, place, sortBy, sortOrder]);

    const updateUrl = (params: Record<string, string>) => {
        const newParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== "" && value !== "date" && value !== "asc") {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams);
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const skip = (page - 1) * limit;
                
                const response: EventsResponse = await getEvents({
                    skip,
                    limit,
                    search: searchText || undefined,
                    age_limit: ageFilter ? Number(ageFilter) : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    event_type: eventType || undefined,
                    place: place || undefined,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                });
                setEvents(response.items);
                setTotal(response.total);
                setError(false);
            } catch (err) {
                console.error("Failed to fetch events", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        
        fetchEvents();

        updateUrl({
            search: searchText,
            age: ageFilter,
            date_from: dateFrom,
            date_to: dateTo,
            type: eventType,
            place: place,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page > 1 ? String(page) : "",
        });
        
    }, [page, searchText, ageFilter, dateFrom, dateTo, eventType, place, sortBy, sortOrder]);

    const handleResetFilters = () => {
        setSearchText("");
        setAgeFilter("");
        setDateFrom("");
        setDateTo("");
        setEventType("");
        setPlace("");
        setSortBy("date");
        setSortOrder("asc");
        setPage(1);
    };
    
    const totalPages = Math.ceil(total / limit);
    const hasActiveFilters = searchText || ageFilter || dateFrom || dateTo || eventType || place;

    return (
        <Box >
            <MetaTags 
                title="Афиша событий"
                description="Все предстоящие события в одном месте. Концерты, спектакли, выставки."
                url={window.location.href}
            />

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

            <Box sx={{ minHeight: "100vh",minWidth: "100vw",  mt: 10, p: 4, backgroundColor: "#FAFAFA" }}>
                <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <TextField
                        label="Поиск по названию"
                        size="small"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        sx={{ width: 200 }}
                    />
                    <TextField
                        label="Возрастное ограничение <="
                        type="number"
                        size="small"
                        value={ageFilter}
                        onChange={e => setAgeFilter(e.target.value)}
                        placeholder="16"
                        sx={{ width: 190 }}
                    />
                    <TextField
                        label="Дата от"
                        type="date"
                        size="small"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 130 }}
                    />
                    <TextField
                        label="Дата до"
                        type="date"
                        size="small"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 130 }}
                    />
                    <TextField
                        label="Тип события"
                        size="small"
                        value={eventType}
                        onChange={e => setEventType(e.target.value)}
                        placeholder="концерт, выставка..."
                        sx={{ width: 150 }}
                    />
                    <TextField
                        label="Место"
                        size="small"
                        value={place}
                        onChange={e => setPlace(e.target.value)}
                        placeholder="Москва, Санкт-Петербург..."
                        sx={{ width: 150 }}
                    />
                    <FormControl size="small" sx={{ width: 130 }}>
                        <InputLabel>Сортировка</InputLabel>
                        <Select value={sortBy} onChange={e => setSortBy(e.target.value)} label="Сортировка">
                            <MenuItem value="date">По дате</MenuItem>
                            <MenuItem value="title">По названию</MenuItem>
                            <MenuItem value="place">По месту</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ width: 150 }}>
                        <InputLabel>Порядок</InputLabel>
                        <Select value={sortOrder} onChange={e => setSortOrder(e.target.value)} label="Порядок">
                            <MenuItem value="asc">По возрастанию</MenuItem>
                            <MenuItem value="desc">По убыванию</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Button variant="outlined" onClick={handleResetFilters} sx={{ height: 40 }}>
                        Сбросить
                    </Button>
                </Box>
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
                        {events.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 8, minWidth: "calc(4 * 340px + 3 * 30px)", maxWidth: 1200 }}>
                                <Typography variant="h6" color="#222222" gutterBottom>
                                    {hasActiveFilters 
                                        ? "По заданным фильтрам событий не найдено" 
                                        : "Нет предстоящих событий"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {hasActiveFilters 
                                        ? "Попробуйте изменить параметры фильтрации" 
                                        : "Скоро появятся новые события"}
                                </Typography>
                            </Box>
                        ) : (
                            <>
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
                                    {events.map(event => (
                                        <Box key={event.id} sx={{ position: "relative" }}>
                                            <img 
                                                src={event.image_url} 
                                                alt={event.title}
                                                style={{ display: "none" }}
                                                loading="lazy"
                                            />
                                            <Box
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
                                                <Link
                                                    to={`/events/${event.id}`}
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
                                                </Link>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {totalPages > 1 && (
                                    <Stack spacing={2} alignItems="center" sx={{ mt: 5 }}>
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={(_, value) => setPage(value)}
                                            color="standard"
                                            sx={{
                                                "& .MuiPaginationItem-root": {
                                                    color: "#222222",
                                                },
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Всего событий: {total}
                                        </Typography>
                                    </Stack>
                                )}
                            </>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};
