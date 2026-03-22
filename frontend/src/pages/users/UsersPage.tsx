import { Box, Typography, CircularProgress, TextField, IconButton, Menu, MenuItem, Chip, Paper } from "@mui/material";
import { Header } from '../../widgets/header';
import { useEffect, useState } from "react";
import { getUsers, changeUserRole } from "../../api/admin/users";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import type { CurrentUserResponse } from "../../api/users/users";

export const UsersPage = () => {
    const [users, setUsers] = useState<CurrentUserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(searchText);
    
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setLoading(true);
        setError(false);
        getUsers()
            .then(data => {
                setUsers(data);
                setError(false);
            })
            .catch(err => {
                console.error("Failed to fetch users", err);
                setError(true);
                setErrorMessage(typeof err === 'string' ? err : "Ошибка загрузки пользователей");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchText]);

    const filteredUsers = users.filter(user => {
        const matchesSearch = !debouncedSearch || 
            user.username.toLowerCase().includes(debouncedSearch.toLowerCase());
        return matchesSearch;
    });

    const handleEditClick = (event: React.MouseEvent<HTMLElement>, user: CurrentUserResponse) => {
        setAnchorEl(event.currentTarget);
        setEditingUserId(user.id);
        setSelectedRole(user.role);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setEditingUserId(null);
    };

    const handleSaveRole = async () => {
        if (!editingUserId) return;

        handleMenuClose();
        
        setUpdatingUserId(editingUserId);
        try {
            await changeUserRole(editingUserId, selectedRole);
            
            setUsers(users.map(user => 
                user.id === editingUserId 
                    ? { ...user, role: selectedRole }
                    : user
            ));
        } catch (err) {
            console.error("Failed to change user role", err);
            handleMenuClose();
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getRoleChipColor = (role: string) => {
        switch(role) {
            case 'admin':
                return { bg: '#f1f1ef', color: '#d31111' };
            default:
                return { bg: '#e3f2fd', color: '#1976d2' };
        }
    };

    const getRoleName = (role: string) => {
        switch(role) {
            case 'admin': return 'Админ';
            case 'user': return 'Пользователь';
            default: return role;
        }
    };

    const hasActiveFilters = debouncedSearch !== "";

    return (
        <Box>
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

            <Box sx={{ minHeight: "100vh", width: "100vw", mt: 10, p: 4, backgroundColor: "#FAFAFA" }}>
                {error ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography variant="h6" color="#222222" gutterBottom>
                            {errorMessage}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ cursor: "pointer", textDecoration: "underline" }}
                            onClick={loadUsers}
                        >
                            Попробовать снова
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ mb: 4, width: "95vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h5" sx={{ fontWeight: 500, color: "#222222" }}>
                                Управление пользователями
                            </Typography>
                            <TextField
                                label="Поиск по имени"
                                size="small"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                sx={{ width: 300 }}
                                placeholder="Введите имя пользователя..."
                            />
                        </Box>

                        {filteredUsers.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 8 }}>
                                <Typography variant="h6" color="#222222" gutterBottom>
                                    {hasActiveFilters 
                                        ? "Пользователи не найдены" 
                                        : "Нет пользователей"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {hasActiveFilters 
                                        ? "Попробуйте изменить параметры поиска"
                                        : ""}
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "repeat(2, 1fr)",
                                        md: "repeat(3, 1fr)",
                                        lg: "repeat(4, 1fr)",
                                    },
                                    gap: "20px",
                                }}
                            >
                                {filteredUsers.map(user => {
                                    const roleColors = getRoleChipColor(user.role);
                                    const isUpdating = updatingUserId === user.id;
                                    
                                    return (
                                        <Paper
                                            key={user.id}
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                border: "1px solid #e0e0e0",
                                                transition: "all 0.2s",
                                                position: "relative",
                                                "&:hover": {
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                    borderColor: "#bdbdbd",
                                                },
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 0.5 }} noWrap>
                                                {user.username}
                                            </Typography>
                                            
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        ID: {user.id}
                                                    </Typography>
                                                    <Chip
                                                        label={getRoleName(user.role)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: roleColors.bg,
                                                            color: roleColors.color,
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </Box>
                                                
                                                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                                    {isUpdating ? (
                                                        <CircularProgress size={24} sx={{ color: "#222222" }} />
                                                    ) : (
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleEditClick(e, user)}
                                                            sx={{
                                                                color: "#666",
                                                                "&:hover": {
                                                                    color: "#1976d2",
                                                                    bgcolor: "rgba(25, 118, 210, 0.04)",
                                                                },
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Зарегистрирован на события:{' '}
                                                {user.registered_events && user.registered_events.length > 0 ? (
                                                    <Box component="span" sx={{ display: 'inline' }}>
                                                        {user.registered_events.map((event, index) => (
                                                            <span key={event.id}>
                                                                {event.title}
                                                                {index < user.registered_events.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    '0'
                                                )}
                                            </Typography>
                                        </Paper>
                                    );
                                })}
                            </Box>
                        )}
                    </>
                )}

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <Box sx={{ p: 1, minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Выберите роль
                        </Typography>
                        <MenuItem 
                            onClick={() => setSelectedRole('user')}
                            selected={selectedRole === 'user'}
                            sx={{ 
                                borderRadius: 1,
                                mb: 0.5,
                                bgcolor: selectedRole === 'user' ? '#e3f2fd' : 'transparent',
                            }}
                        >
                            <Typography>Пользователь</Typography>
                        </MenuItem>
                        <MenuItem 
                            onClick={() => setSelectedRole('admin')}
                            selected={selectedRole === 'admin'}
                            sx={{ 
                                borderRadius: 1,
                                bgcolor: selectedRole === 'admin' ? '#fff9c4' : 'transparent',
                            }}
                        >
                            <Typography>Админ</Typography>
                        </MenuItem>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <IconButton size="small" onClick={handleMenuClose} sx={{ color: "#666" }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={handleSaveRole}
                                sx={{ color: "#1976d2" }}
                            >
                                <SaveIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Menu>
            </Box>
        </Box>
    );
};
