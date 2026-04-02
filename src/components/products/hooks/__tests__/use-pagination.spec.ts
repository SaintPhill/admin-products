import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../use-pagination';

describe('usePagination', () => {
    describe('базовая функциональность', () => {
        it('должен возвращать все элементы если их меньше чем itemsPerPage', () => {
            const items = [1, 2, 3];
            const { result } = renderHook(() => usePagination(items, 5));

            expect(result.current.paginatedItems).toEqual([1, 2, 3]);
            expect(result.current.paginationInfo.totalItems).toBe(3);
            expect(result.current.paginationInfo.totalPages).toBe(1);
            expect(result.current.currentPage).toBe(1);
        });

        it('должен правильно разбивать элементы на страницы', () => {
            const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const { result } = renderHook(() => usePagination(items, 5));

            expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5]);
            expect(result.current.paginationInfo.totalItems).toBe(10);
            expect(result.current.paginationInfo.totalPages).toBe(2);
            expect(result.current.currentPage).toBe(1);
        });

        it('должен использовать itemsPerPage по умолчанию (5)', () => {
            const items = [1, 2, 3, 4, 5, 6, 7];
            const { result } = renderHook(() => usePagination(items));

            expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5]);
            expect(result.current.paginationInfo.totalPages).toBe(2);
        });
    });

    describe('навигация по страницам', () => {
        const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

        it('должен переходить на следующую страницу', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            expect(result.current.currentPage).toBe(1);
            expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5]);

            act(() => {
                result.current.nextPage();
            });

            expect(result.current.currentPage).toBe(2);
            expect(result.current.paginatedItems).toEqual([6, 7, 8, 9, 10]);
        });

        it('должен переходить на предыдущую страницу', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            act(() => {
                result.current.goToPage(2);
            });

            expect(result.current.currentPage).toBe(2);
            expect(result.current.paginatedItems).toEqual([6, 7, 8, 9, 10]);

            act(() => {
                result.current.prevPage();
            });

            expect(result.current.currentPage).toBe(1);
            expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5]);
        });

        it('должен переходить на конкретную страницу', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            act(() => {
                result.current.goToPage(3);
            });

            expect(result.current.currentPage).toBe(3);
            expect(result.current.paginatedItems).toEqual([11, 12, 13, 14, 15]);
        });

        it('не должен переходить на следующую страницу если это последняя страница', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            act(() => {
                result.current.goToPage(3);
            });

            expect(result.current.currentPage).toBe(3);

            act(() => {
                result.current.nextPage();
            });

            expect(result.current.currentPage).toBe(3);
        });

        it('не должен переходить на предыдущую страницу если это первая страница', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            act(() => {
                result.current.prevPage();
            });

            expect(result.current.currentPage).toBe(1);
        });

        it('должен сбрасывать страницу на первую', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            act(() => {
                result.current.goToPage(3);
            });

            expect(result.current.currentPage).toBe(3);

            act(() => {
                result.current.resetPage();
            });

            expect(result.current.currentPage).toBe(1);
            expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('paginationInfo', () => {
        const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        it('должен правильно вычислять startIndex и endIndex', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            expect(result.current.paginationInfo.startIndex).toBe(0);
            expect(result.current.paginationInfo.endIndex).toBe(5);

            act(() => {
                result.current.nextPage();
            });

            expect(result.current.paginationInfo.startIndex).toBe(5);
            expect(result.current.paginationInfo.endIndex).toBe(10);
        });

        it('должен правильно вычислять endIndex для последней страницы', () => {
            const itemsPartial = [1, 2, 3, 4, 5, 6, 7];
            const { result } = renderHook(() => usePagination(itemsPartial, 5));

            expect(result.current.paginationInfo.endIndex).toBe(5);

            act(() => {
                result.current.nextPage();
            });

            expect(result.current.paginationInfo.endIndex).toBe(7);
        });

        it('должен возвращать корректную информацию о пагинации', () => {
            const { result } = renderHook(() => usePagination(items, 5));

            expect(result.current.paginationInfo).toEqual({
                startIndex: 0,
                endIndex: 5,
                totalItems: 10,
                totalPages: 2,
                currentPage: 1,
            });

            act(() => {
                result.current.goToPage(2);
            });

            expect(result.current.paginationInfo).toEqual({
                startIndex: 5,
                endIndex: 10,
                totalItems: 10,
                totalPages: 2,
                currentPage: 2,
            });
        });
    });

    describe('корректировка текущей страницы', () => {
        it('должен корректировать currentPage если он больше totalPages', () => {
            const items = [1, 2, 3, 4, 5];
            const { result } = renderHook(() => usePagination(items, 5));

            act(() => {
                result.current.goToPage(10);
            });

            expect(result.current.currentPage).toBe(1);
        });

        it('должен корректировать currentPage если items стали пустыми', () => {
            const { result, rerender } = renderHook(({ items }) => usePagination(items, 5), {
                initialProps: { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
            });

            act(() => {
                result.current.goToPage(2);
            });
            expect(result.current.currentPage).toBe(2);

            rerender({ items: [] });

            expect(result.current.currentPage).toBe(1);
            expect(result.current.paginationInfo.totalPages).toBe(0);
            expect(result.current.paginatedItems).toEqual([]);
        });
    });

    describe('разные типы данных', () => {
        it('должен работать с массивом строк', () => {
            const items = ['a', 'b', 'c', 'd', 'e', 'f'];
            const { result } = renderHook(() => usePagination(items, 3));

            expect(result.current.paginatedItems).toEqual(['a', 'b', 'c']);

            act(() => {
                result.current.nextPage();
            });

            expect(result.current.paginatedItems).toEqual(['d', 'e', 'f']);
        });

        it('должен работать с массивом объектов', () => {
            const items = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' },
                { id: 4, name: 'Item 4' },
            ];
            const { result } = renderHook(() => usePagination(items, 2));

            expect(result.current.paginatedItems).toEqual([
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
            ]);

            act(() => {
                result.current.nextPage();
            });

            expect(result.current.paginatedItems).toEqual([
                { id: 3, name: 'Item 3' },
                { id: 4, name: 'Item 4' },
            ]);
        });
    });

    describe('разные значения itemsPerPage', () => {
        const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        it('должен работать с itemsPerPage = 1', () => {
            const { result } = renderHook(() => usePagination(items, 1));

            expect(result.current.paginatedItems).toEqual([1]);
            expect(result.current.paginationInfo.totalPages).toBe(10);

            act(() => {
                result.current.nextPage();
            });
            expect(result.current.paginatedItems).toEqual([2]);

            act(() => {
                result.current.nextPage();
            });
            expect(result.current.paginatedItems).toEqual([3]);
        });

        it('должен работать с itemsPerPage = 10', () => {
            const { result } = renderHook(() => usePagination(items, 10));

            expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            expect(result.current.paginationInfo.totalPages).toBe(1);
        });

        it('должен работать с itemsPerPage больше чем количество элементов', () => {
            const { result } = renderHook(() => usePagination(items, 20));

            expect(result.current.paginatedItems).toEqual(items);
            expect(result.current.paginationInfo.totalPages).toBe(1);
        });
    });

    describe('мемоизация', () => {
        it('не должен пересоздавать paginatedItems если items не изменились (ссылка)', () => {
            const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const { result, rerender } = renderHook(({ items }) => usePagination(items, 5), {
                initialProps: { items },
            });

            const firstRenderItems = result.current.paginatedItems;

            rerender({ items });

            const secondRenderItems = result.current.paginatedItems;

            expect(firstRenderItems).toBe(secondRenderItems);
        });

        it('должен пересоздавать paginatedItems при изменении currentPage', () => {
            const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const { result } = renderHook(() => usePagination(items, 5));

            const firstPageItems = result.current.paginatedItems;

            act(() => {
                result.current.nextPage();
            });

            const secondPageItems = result.current.paginatedItems;

            expect(firstPageItems).not.toBe(secondPageItems);
            expect(firstPageItems).toEqual([1, 2, 3, 4, 5]);
            expect(secondPageItems).toEqual([6, 7, 8, 9, 10]);
        });
    });

    describe('краевые случаи', () => {
        it('должен работать с пустым массивом', () => {
            const { result } = renderHook(() => usePagination([], 5));

            expect(result.current.paginatedItems).toEqual([]);
            expect(result.current.paginationInfo.totalItems).toBe(0);
            expect(result.current.paginationInfo.totalPages).toBe(0);
            expect(result.current.currentPage).toBe(1);
        });

        it('должен работать с itemsPerPage = 0', () => {
            const items = [1, 2, 3];
            const { result } = renderHook(() => usePagination(items, 0));

            expect(result.current.paginatedItems).toEqual([]);
            expect(result.current.paginationInfo.totalPages).toBe(Infinity);
        });

        it('должен работать с отрицательным itemsPerPage', () => {
            const items = [1, 2, 3];
            const { result } = renderHook(() => usePagination(items, -5));

            expect(result.current.paginatedItems).toEqual([]);
            expect(Object.is(result.current.paginationInfo.totalPages, -0)).toBe(true);
        });

        it('должен корректно обрабатывать goToPage с числом больше totalPages', () => {
            const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const { result } = renderHook(() => usePagination(items, 5));

            act(() => {
                result.current.goToPage(100);
            });

            expect(result.current.currentPage).toBe(2);
        });
    });
});
