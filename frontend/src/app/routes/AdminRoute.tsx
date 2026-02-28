import { type ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { getCurrentUser } from '../../api/users/users';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'admin';
    redirectTo?: string;
}

export const AdminRoute = ({ 
    children,
    redirectTo = '/events' 
}: ProtectedRouteProps) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const user = await getCurrentUser();
                setIsAdmin(user.role === 'admin');
            } catch {
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, []);

    if (isAdmin === null) {
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
    }

    if (!isAdmin) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};