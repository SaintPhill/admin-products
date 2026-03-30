import { api } from '../lib/api';
import type { AuthResponse } from '../types/product';

export const authAPI = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', {
            username,
            password,
        });
        return response.data;
    },
};
