import React, { useState, useEffect } from 'react';
import { AuthContext } from './auth-context';
import { authAPI } from '../api/auth';
import { getErrorMessage } from '../utils/get-error-message.ts';

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        setIsAuthenticated(!!token);
        setIsChecking(false);
    }, []);

    const login = async (username: string, password: string, rememberMe: boolean) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await authAPI.login(username, password);

            if (rememberMe) {
                localStorage.setItem('auth_token', data.token);
            } else {
                sessionStorage.setItem('auth_token', data.token);
            }

            setIsAuthenticated(true);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setIsAuthenticated(false);
    };

    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};
