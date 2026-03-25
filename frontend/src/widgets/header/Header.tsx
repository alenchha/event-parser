import { Box, Typography, Dialog, DialogTitle, DialogActions, DialogContent,
    Button, Menu, MenuItem, TextField, Snackbar, Alert, Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../../../public/logo.png';
import { changePassword, deleteMyAccount, uploadAvatar, deleteAvatar } from "../../api/users/users";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout, isLoading, refreshUser } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/");
        }
    }, [user, isLoading, navigate]);


    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        setOpenLogoutConfirm(true);
        handleMenuClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage("Файл слишком большой (макс 5MB)");
                setSnackbarOpen(true);
                return;
            }
            setSelectedFile(file);
        }
    };

const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    
    setUploadingAvatar(true);
    try {
        await uploadAvatar(selectedFile);
        await refreshUser();
        setOpenAvatarDialog(false);
    } catch (err) {
        setErrorMessage(getErrorMessage(err, "Ошибка загрузки аватарки"));
        setSnackbarOpen(true);
    } finally {
        setUploadingAvatar(false);
    }
};

const handleDeleteAvatar = async () => {
    try {
        await deleteAvatar();
        await refreshUser();
        setOpenAvatarDialog(false);
    } catch (err) {
        setErrorMessage(getErrorMessage(err, "Ошибка удаления аватарки"));
        setSnackbarOpen(true);
    }
};

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

    const confirmLogout = async () => {
        await logout();
        setOpenLogoutConfirm(false);
        navigate("/");
    };

    const submitDelete = async () => {
        try {
            await deleteMyAccount();
            await logout();
            window.location.href = "/";
        } catch (e: unknown) {
            setErrorMessage(getErrorMessage(e, "Не удалось удалить аккаунт"));
            setSnackbarOpen(true);
        }
    };

    const submitChangePassword = async () => {
        try {
            await changePassword(oldPass, newPass);
            setOpenChangePassword(false);
            setOldPass("");
            setNewPass("");
        } catch (e: unknown) {
            setErrorMessage(getErrorMessage(e, "Не удалось сменить пароль"));
            setSnackbarOpen(true);
        }
    };

    return (
        <Box sx={{ width: "100vw", position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
            <Box sx={{
                width: "100%",
                height: 80,
                bgcolor: "#FAFAFA",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 4,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <img
                        src={logo}
                        alt="Logo"
                        width={142}
                        height={28}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/events")}
                    />

                    <Typography sx={{ cursor: "pointer", fontSize: 18 }} onClick={() => navigate("/events")}>
                        События
                    </Typography>

                    <Typography sx={{ cursor: "pointer", fontSize: 18 }} onClick={() => navigate("/profile")}>
                        Аккаунт
                    </Typography>

                    {user?.role === "admin" &&
                        <Typography sx={{ cursor: "pointer", fontSize: 18 }} onClick={() => navigate("/upload")}>
                            Загрузить постер & Создать событие
                        </Typography>
                    }

                    {user?.role === "admin" &&
                        <Typography sx={{ cursor: "pointer", fontSize: 18 }} onClick={() => navigate("/users")}>
                            Все пользователи
                        </Typography>
                    }
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 1 }} onClick={handleMenuOpen}>
                    <Typography sx={{ fontSize: 18 }}>{user?.username}</Typography>
                    <Avatar 
                        src={user?.avatar_url} 
                        sx={{ width: 40, height: 40, bgcolor: "#222222" }}
                    >
                        {!user?.avatar_url && user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                </Box>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                    <MenuItem onClick={() => { setOpenAvatarDialog(true); handleMenuClose(); }}>
                        Сменить аватар
                    </MenuItem>
                    <MenuItem onClick={() => { setOpenChangePassword(true); handleMenuClose(); }}>Сменить пароль</MenuItem>
                    <MenuItem onClick={() => { setOpenDelete(true); handleMenuClose(); }}>Удалить аккаунт</MenuItem>
                </Menu>
            </Box>

            <Box sx={{
                height: "2px",
                width: "100%",
                background: "linear-gradient(0.322turn, rgba(214,255,0,1) 0%, rgba(255,0,127,1) 100%)",
            }} />

            <Dialog
                open={openAvatarDialog}
                onClose={() => {
                    setOpenAvatarDialog(false);
                    setSelectedFile(null);
                }}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ textAlign: "center" }}>
                    Сменить аватар
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 2 }}>
                    <Avatar 
                        src={user?.avatar_url} 
                        sx={{ width: 100, height: 100, bgcolor: "#222222" }}
                    >
                        {!user?.avatar_url && user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        disabled={uploadingAvatar}
                    >
                        Выбрать файл
                        <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                        />
                    </Button>
                    
                    {selectedFile && (
                        <Typography variant="body2" color="text.secondary">
                            {selectedFile.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
                    <Button onClick={() => setOpenAvatarDialog(false)}>
                        Отмена
                    </Button>
                    {selectedFile && (
                        <Button
                            variant="contained"
                            onClick={handleUploadAvatar}
                            disabled={uploadingAvatar}
                            sx={{ bgcolor: "#222222" }}
                        >
                            {uploadingAvatar ? "Ожидание..." : "Загрузить"}
                        </Button>
                    )}
                    {user?.avatar_url && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDeleteAvatar}
                            disabled={uploadingAvatar}
                        >
                            Удалить
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={openLogoutConfirm} onClose={() => setOpenLogoutConfirm(false)}>
                <DialogTitle sx={{ fontWeight: 300 }}>Вы уверены, что хотите выйти?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenLogoutConfirm(false)}>Отмена</Button>
                    <Button color="error" onClick={confirmLogout}>Выйти</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Удалить аккаунт?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ opacity: 0.8 }}>Это действие необратимо</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Отмена</Button>
                    <Button color="error" onClick={submitDelete}>
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openChangePassword}
                onClose={() => setOpenChangePassword(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Сменить пароль</DialogTitle>
                <DialogContent
                    sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <TextField
                        sx={{ mt: 1 }}
                        label="Старый пароль"
                        type="password"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Новый пароль"
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenChangePassword(false)}>Отмена</Button>
                    <Button onClick={submitChangePassword}>Сохранить</Button>
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
        </Box>
    );
};
