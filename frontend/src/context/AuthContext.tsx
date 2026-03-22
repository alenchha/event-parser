/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { loginUser, registerUser, logoutUser } from '../api/auth/auth';
import apiClient from '../api/axiosConfig';

export interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await apiClient.get<User>('/users/me');
                setUser(response.data);
            } catch {
                console.log('Ошибка получения пользователя:', error);
                localStorage.removeItem('access_token');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await loginUser({ username, password });
            localStorage.setItem('access_token', response.access_token);
            const userResponse = await apiClient.get<User>('/users/me');
            setUser(userResponse.data);            
        } catch (err) {
            setError('Ошибка входа');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await registerUser({ username, password });
            await login(username, password);
        } catch (err) {
            setError('Ошибка регистрации');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            error,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
