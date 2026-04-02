import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://dummyjson.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('Токен отсутствует!');
        }

        return config;
    },
    (error) => {
        console.error('Ошибка в интерсепторе:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Ошибка ответа:', error.config?.url, error.response?.status, error.message);
        return Promise.reject(error);
    }
);
