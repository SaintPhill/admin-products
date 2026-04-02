import { AxiosError } from 'axios';
import { getErrorMessage } from '../get-error-message';

describe('getErrorMessage', () => {
    describe('обработка AxiosError', () => {
        it('должен вернуть message из response.data', () => {
            const error = new AxiosError();
            error.response = {
                data: { message: 'Ошибка авторизации' },
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                config: {} as any,
            };

            expect(getErrorMessage(error)).toBe('Ошибка авторизации');
        });

        it('должен вернуть err.message если response.data.message отсутствует', () => {
            const error = new AxiosError('Network Error');
            error.response = {
                data: {},
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                config: {} as any,
            };

            expect(getErrorMessage(error)).toBe('Network Error');
        });

        it('должен вернуть "Ошибка запроса" если нет ни message, ни response', () => {
            const error = new AxiosError();
            expect(getErrorMessage(error)).toBe('Ошибка запроса');
        });

        it('должен вернуть "Ошибка запроса" если response.data.message пустая строка', () => {
            const error = new AxiosError();
            error.response = {
                data: { message: '' },
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: {} as any,
            };

            expect(getErrorMessage(error)).toBe('Ошибка запроса');
        });

        it('должен обрабатывать AxiosError без config', () => {
            const error = new AxiosError('Timeout Error');
            expect(getErrorMessage(error)).toBe('Timeout Error');
        });
    });

    describe('обработка обычных Error', () => {
        it('должен вернуть message из обычной ошибки', () => {
            const error = new Error('Что-то пошло не так');
            expect(getErrorMessage(error)).toBe('Что-то пошло не так');
        });

        it('должен обрабатывать Error с пустым message', () => {
            const error = new Error('');
            expect(getErrorMessage(error)).toBe('');
        });

        it('должен обрабатывать Error с длинным message', () => {
            const longMessage = 'Очень длинное сообщение об ошибке '.repeat(10);
            const error = new Error(longMessage);
            expect(getErrorMessage(error)).toBe(longMessage);
        });
    });

    describe('обработка объектов с полем message', () => {
        it('должен вернуть message из объекта', () => {
            const error = { message: 'Пользователь не найден' };
            expect(getErrorMessage(error)).toBe('Пользователь не найден');
        });

        it('должен вернуть "Неизвестная ошибка" если message в объекте пустой', () => {
            const error = { message: '' };
            expect(getErrorMessage(error)).toBe('Неизвестная ошибка');
        });

        it('должен обрабатывать объект с message как null', () => {
            const error = { message: null };
            expect(getErrorMessage(error)).toBe('Неизвестная ошибка');
        });

        it('должен обрабатывать объект с message как undefined', () => {
            const error = { message: undefined };
            expect(getErrorMessage(error)).toBe('Неизвестная ошибка');
        });
    });

    describe('обработка других типов ошибок', () => {
        it('должен вернуть "Произошла неизвестная ошибка" для строки', () => {
            expect(getErrorMessage('string error')).toBe('Произошла неизвестная ошибка');
        });

        it('должен вернуть "Произошла неизвестная ошибка" для числа', () => {
            expect(getErrorMessage(404)).toBe('Произошла неизвестная ошибка');
        });

        it('должен вернуть "Произошла неизвестная ошибка" для null', () => {
            expect(getErrorMessage(null)).toBe('Произошла неизвестная ошибка');
        });

        it('должен вернуть "Произошла неизвестная ошибка" для undefined', () => {
            expect(getErrorMessage(undefined)).toBe('Произошла неизвестная ошибка');
        });

        it('должен вернуть "Произошла неизвестная ошибка" для boolean', () => {
            expect(getErrorMessage(true)).toBe('Произошла неизвестная ошибка');
            expect(getErrorMessage(false)).toBe('Произошла неизвестная ошибка');
        });

        it('должен обрабатывать массив', () => {
            expect(getErrorMessage(['error'])).toBe('Произошла неизвестная ошибка');
        });

        it('должен обрабатывать Date объект', () => {
            expect(getErrorMessage(new Date())).toBe('Произошла неизвестная ошибка');
        });
    });

    describe('сложные сценарии', () => {
        it('должен приоритетно обрабатывать AxiosError перед обычным объектом', () => {
            const axiosError = new AxiosError('Network Error');
            axiosError.response = {
                data: { message: 'Сервер недоступен' },
                status: 503,
                statusText: 'Service Unavailable',
                headers: {},
                config: {} as any,
            };

            expect(getErrorMessage(axiosError)).toBe('Сервер недоступен');
        });

        it('должен правильно обрабатывать вложенные ошибки', () => {
            const error = new Error('Original error');
            const wrapperError = new Error(`Wrapper: ${error.message}`);
            expect(getErrorMessage(wrapperError)).toBe(`Wrapper: Original error`);
        });

        it('должен обрабатывать AxiosError с response.data как строкой', () => {
            const error = new AxiosError();
            error.response = {
                data: 'Server error message',
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                config: {} as any,
            };

            expect(getErrorMessage(error)).toBe('Ошибка запроса');
        });

        it('должен обрабатывать AxiosError с response.data как null', () => {
            const error = new AxiosError();
            error.response = {
                data: null,
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                config: {} as any,
            };

            expect(getErrorMessage(error)).toBe('Ошибка запроса');
        });
    });

    describe('проверка возвращаемых типов', () => {
        it('всегда возвращает строку', () => {
            expect(typeof getErrorMessage(new Error('test'))).toBe('string');
            expect(typeof getErrorMessage(new AxiosError())).toBe('string');
            expect(typeof getErrorMessage({ message: 'test' })).toBe('string');
            expect(typeof getErrorMessage(null)).toBe('string');
            expect(typeof getErrorMessage(undefined)).toBe('string');
            expect(typeof getErrorMessage('test')).toBe('string');
        });
    });
});
