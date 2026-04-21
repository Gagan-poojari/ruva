"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import api from '@/utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrapAuth = async () => {
            const storedUser = localStorage.getItem('userInfo');
            if (!storedUser) {
                setLoading(false);
                return;
            }

            try {
                const parsed = JSON.parse(storedUser);
                // Show cached user immediately, then refresh from backend.
                setUser(parsed);
                const { data } = await api.get('/auth/me');
                const merged = { ...parsed, ...data, token: parsed.token };
                setUser(merged);
                localStorage.setItem('userInfo', JSON.stringify(merged));
            } catch {
                localStorage.removeItem('userInfo');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrapAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response && error.response.data.message 
                    ? error.response.data.message 
                    : error.message 
            };
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password, phone });
            
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response && error.response.data.message 
                    ? error.response.data.message 
                    : error.message 
            };
        }
    };

    const googleLogin = async (credential) => {
        try {
            const { data } = await api.post('/auth/google', { credential });
            
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response && error.response.data.message 
                    ? error.response.data.message 
                    : error.message 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
