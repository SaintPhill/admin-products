import { AxiosError } from 'axios';

interface ApiError {
    message?: string;
}

export const getErrorMessage = (err: unknown): string => {
    if (err instanceof AxiosError) {
        return err.response?.data?.message || err.message || 'Ошибка запроса';
    }

    if (err instanceof Error) {
        return err.message;
    }

    if (typeof err === 'object' && err !== null && 'message' in err) {
        return (err as ApiError).message || 'Неизвестная ошибка';
    }

    return 'Произошла неизвестная ошибка';
};
