import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('базовая функциональность', () => {
        it('должен вернуть начальное значение сразу', () => {
            const { result } = renderHook(() => useDebounce('initial', 500));
            expect(result.current).toBe('initial');
        });

        it('должен обновить значение после задержки', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'initial', delay: 500 },
                }
            );

            expect(result.current).toBe('initial');

            rerender({ value: 'updated', delay: 500 });

            expect(result.current).toBe('initial');

            act(() => {
                jest.advanceTimersByTime(250);
            });
            expect(result.current).toBe('initial');

            act(() => {
                jest.advanceTimersByTime(250);
            });
            expect(result.current).toBe('updated');
        });
    });

    describe('задержка (delay)', () => {
        it('должен использовать указанную задержку', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'initial', delay: 1000 },
                }
            );

            rerender({ value: 'updated', delay: 1000 });

            act(() => {
                jest.advanceTimersByTime(999);
            });
            expect(result.current).toBe('initial');

            act(() => {
                jest.advanceTimersByTime(1);
            });
            expect(result.current).toBe('updated');
        });

        it('должен работать с нулевой задержкой', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'initial', delay: 0 },
                }
            );

            expect(result.current).toBe('initial');

            rerender({ value: 'updated', delay: 0 });

            act(() => {
                jest.advanceTimersByTime(0);
            });
            expect(result.current).toBe('updated');
        });
    });

    describe('множественные обновления', () => {
        it('должен сбрасывать таймер при быстрых последовательных обновлениях', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'first', delay: 500 },
                }
            );

            rerender({ value: 'second', delay: 500 });

            act(() => {
                jest.advanceTimersByTime(200);
            });

            rerender({ value: 'third', delay: 500 });

            act(() => {
                jest.advanceTimersByTime(400);
            });
            expect(result.current).toBe('first');

            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(result.current).toBe('third');
        });

        it('должен обновляться только последним значением после серии обновлений', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: number; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 1, delay: 500 },
                }
            );

            rerender({ value: 2, delay: 500 });
            rerender({ value: 3, delay: 500 });
            rerender({ value: 4, delay: 500 });
            rerender({ value: 5, delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe(5);
        });
    });

    describe('разные типы данных', () => {
        it('должен работать со строкой', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'hello', delay: 500 },
                }
            );

            rerender({ value: 'world', delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe('world');
        });

        it('должен работать с числом', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: number; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 10, delay: 500 },
                }
            );

            rerender({ value: 20, delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe(20);
        });

        it('должен работать с булевым значением', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: boolean; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: false, delay: 500 },
                }
            );

            rerender({ value: true, delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe(true);
        });

        it('должен работать с объектом', () => {
            interface TestObject {
                name: string;
            }

            const { result, rerender } = renderHook(
                ({ value, delay }: { value: TestObject; delay: number }) =>
                    useDebounce(value, delay),
                {
                    initialProps: { value: { name: 'John' }, delay: 500 },
                }
            );

            const newObject = { name: 'Jane' };
            rerender({ value: newObject, delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe(newObject);
        });

        it('должен работать с массивом', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: number[]; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: [1, 2, 3], delay: 500 },
                }
            );

            rerender({ value: [4, 5, 6], delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toEqual([4, 5, 6]);
        });
    });

    describe('очистка таймера', () => {
        it('должен очищать таймер при размонтировании', () => {
            const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

            const { unmount } = renderHook(() => useDebounce('test', 500));

            unmount();

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
        });

        it('должен очищать предыдущий таймер при новом рендере', () => {
            const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

            const { rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'first', delay: 500 },
                }
            );

            rerender({ value: 'second', delay: 500 });

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
        });
    });

    describe('зависимости', () => {
        it('должен реагировать на изменение delay', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'initial', delay: 500 },
                }
            );

            rerender({ value: 'updated', delay: 1000 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe('initial');

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe('updated');
        });

        it('не должен обновляться если значение не изменилось', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'same', delay: 500 },
                }
            );

            rerender({ value: 'same', delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBe('same');
        });
    });

    describe('краевые случаи', () => {
        it('должен работать с отрицательной задержкой (как с 0)', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'initial', delay: -100 },
                }
            );

            rerender({ value: 'updated', delay: -100 });

            act(() => {
                jest.advanceTimersByTime(0);
            });
            expect(result.current).toBe('updated');
        });

        it('должен работать с очень большой задержкой', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'initial', delay: 1000000 },
                }
            );

            rerender({ value: 'updated', delay: 1000000 });

            act(() => {
                jest.advanceTimersByTime(999999);
            });
            expect(result.current).toBe('initial');

            act(() => {
                jest.advanceTimersByTime(1);
            });
            expect(result.current).toBe('updated');
        });

        it('должен обрабатывать undefined как значение', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string | undefined; delay: number }) =>
                    useDebounce(value, delay),
                {
                    initialProps: { value: 'initial' as string | undefined, delay: 500 },
                }
            );

            rerender({ value: undefined, delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBeUndefined();
        });

        it('должен обрабатывать null как значение', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }: { value: string | null; delay: number }) =>
                    useDebounce(value, delay),
                {
                    initialProps: { value: 'initial' as string | null, delay: 500 },
                }
            );

            rerender({ value: null, delay: 500 });

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(result.current).toBeNull();
        });
    });

    describe('производительность', () => {
        it('не должен создавать лишние таймеры при одинаковых значениях', () => {
            const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

            const { rerender } = renderHook(
                ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'test', delay: 500 },
                }
            );

            const initialCallCount = setTimeoutSpy.mock.calls.length;

            rerender({ value: 'test', delay: 500 });

            expect(setTimeoutSpy.mock.calls.length).toBe(initialCallCount);

            setTimeoutSpy.mockRestore();
        });
    });
});
