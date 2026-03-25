import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface AdminRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

export const AdminRoute = ({ 
    children,
    redirectTo = '/events' 
}: AdminRouteProps) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
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

    if (!user || user.role !== 'admin') {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};
