import { renderHook, act } from '@testing-library/react';
import { useSelection } from '../use-selection';

describe('useSelection', () => {
    const mockItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
    ];

    describe('initial state', () => {
        it('должен инициализироваться с пустым набором выбранных элементов', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            expect(result.current.isAllSelected).toBe(false);
            expect(result.current.isSelected(1)).toBe(false);
            expect(result.current.isSelected(2)).toBe(false);
        });
    });

    describe('selectRow', () => {
        it('должен выбирать элемент', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
            });

            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isSelected(2)).toBe(false);
            expect(result.current.isAllSelected).toBe(false);
        });

        it('должен снимать выделение с элемента', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
            });
            expect(result.current.isSelected(1)).toBe(true);

            act(() => {
                result.current.selectRow(1);
            });
            expect(result.current.isSelected(1)).toBe(false);
        });

        it('должен выбирать несколько элементов', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
                result.current.selectRow(3);
                result.current.selectRow(5);
            });

            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isSelected(2)).toBe(false);
            expect(result.current.isSelected(3)).toBe(true);
            expect(result.current.isSelected(4)).toBe(false);
            expect(result.current.isSelected(5)).toBe(true);
            expect(result.current.isAllSelected).toBe(false);
        });

        it('должен корректно работать с несуществующими id', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(999);
            });

            expect(result.current.isSelected(999)).toBe(true);
            expect(result.current.isAllSelected).toBe(false);
        });
    });

    describe('selectAll', () => {
        it('должен выбирать все элементы', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectAll();
            });

            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isSelected(2)).toBe(true);
            expect(result.current.isSelected(3)).toBe(true);
            expect(result.current.isSelected(4)).toBe(true);
            expect(result.current.isSelected(5)).toBe(true);
            expect(result.current.isAllSelected).toBe(true);
        });

        it('должен снимать выделение со всех элементов, если все уже выбраны', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectAll();
            });
            expect(result.current.isAllSelected).toBe(true);

            act(() => {
                result.current.selectAll();
            });

            expect(result.current.isSelected(1)).toBe(false);
            expect(result.current.isSelected(2)).toBe(false);
            expect(result.current.isSelected(3)).toBe(false);
            expect(result.current.isSelected(4)).toBe(false);
            expect(result.current.isSelected(5)).toBe(false);
            expect(result.current.isAllSelected).toBe(false);
        });

        it('должен выбирать все элементы, даже если некоторые уже выбраны', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
            });
            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isAllSelected).toBe(false);

            act(() => {
                result.current.selectAll();
            });

            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isSelected(2)).toBe(true);
            expect(result.current.isSelected(3)).toBe(true);
            expect(result.current.isSelected(4)).toBe(true);
            expect(result.current.isSelected(5)).toBe(true);
            expect(result.current.isAllSelected).toBe(true);
        });

        it('должен корректно работать с пустым массивом items', () => {
            const { result } = renderHook(() => useSelection([]));

            act(() => {
                result.current.selectAll();
            });

            expect(result.current.isAllSelected).toBe(false);
            expect(result.current.isSelected(1)).toBe(false);
        });
    });

    describe('clearSelection', () => {
        it('должен очищать все выбранные элементы', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
                result.current.selectRow(3);
                result.current.selectRow(5);
            });
            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isSelected(3)).toBe(true);
            expect(result.current.isSelected(5)).toBe(true);

            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.isSelected(1)).toBe(false);
            expect(result.current.isSelected(2)).toBe(false);
            expect(result.current.isSelected(3)).toBe(false);
            expect(result.current.isSelected(4)).toBe(false);
            expect(result.current.isSelected(5)).toBe(false);
            expect(result.current.isAllSelected).toBe(false);
        });

        it('должен корректно работать, когда ничего не выбрано', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.isAllSelected).toBe(false);
            expect(result.current.isSelected(1)).toBe(false);
        });

        it('должен корректно работать после selectAll', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectAll();
            });
            expect(result.current.isAllSelected).toBe(true);

            act(() => {
                result.current.clearSelection();
            });
            expect(result.current.isAllSelected).toBe(false);
            expect(result.current.isSelected(1)).toBe(false);
        });
    });

    describe('isAllSelected', () => {
        it('должен возвращать false, когда выбраны не все элементы', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
                result.current.selectRow(2);
            });

            expect(result.current.isAllSelected).toBe(false);
        });

        it('должен возвращать true, когда выбраны все элементы', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
                result.current.selectRow(2);
                result.current.selectRow(3);
                result.current.selectRow(4);
                result.current.selectRow(5);
            });

            expect(result.current.isAllSelected).toBe(true);
        });

        it('должен возвращать false, когда массив items пуст', () => {
            const { result } = renderHook(() => useSelection([]));

            expect(result.current.isAllSelected).toBe(false);

            act(() => {
                result.current.selectAll();
            });

            expect(result.current.isAllSelected).toBe(false);
        });

        it('должен обновляться при изменении выделения', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            expect(result.current.isAllSelected).toBe(false);

            act(() => {
                result.current.selectAll();
            });
            expect(result.current.isAllSelected).toBe(true);

            act(() => {
                result.current.selectRow(1);
            });
            expect(result.current.isAllSelected).toBe(false);

            act(() => {
                result.current.selectRow(1);
            });
            expect(result.current.isAllSelected).toBe(true);
        });
    });

    describe('интеграционные тесты', () => {
        it('должен корректно обрабатывать смешанные операции', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            act(() => {
                result.current.selectRow(1);
                result.current.selectRow(2);
            });
            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isSelected(2)).toBe(true);
            expect(result.current.isSelected(3)).toBe(false);

            act(() => {
                result.current.selectAll();
            });
            expect(result.current.isAllSelected).toBe(true);

            act(() => {
                result.current.selectRow(3);
            });
            expect(result.current.isSelected(3)).toBe(false);
            expect(result.current.isAllSelected).toBe(false);

            act(() => {
                result.current.clearSelection();
            });
            expect(result.current.isSelected(1)).toBe(false);
            expect(result.current.isSelected(2)).toBe(false);
            expect(result.current.isSelected(3)).toBe(false);
            expect(result.current.isAllSelected).toBe(false);
        });

        it('должен корректно работать с разными типами объектов', () => {
            const itemsWithDifferentTypes = [
                { id: 1, title: 'Title 1', value: 100 },
                { id: 2, title: 'Title 2', value: 200 },
                { id: 3, title: 'Title 3', value: 300 },
            ];

            const { result } = renderHook(() => useSelection(itemsWithDifferentTypes));

            act(() => {
                result.current.selectRow(2);
            });

            expect(result.current.isSelected(2)).toBe(true);
            expect(result.current.isSelected(1)).toBe(false);
            expect(result.current.isAllSelected).toBe(false);

            act(() => {
                result.current.selectAll();
            });

            expect(result.current.isAllSelected).toBe(true);
            expect(result.current.isSelected(1)).toBe(true);
            expect(result.current.isSelected(2)).toBe(true);
            expect(result.current.isSelected(3)).toBe(true);
        });
    });

    describe('мемоизация', () => {
        it('функции не должны пересоздаваться при ререндере', () => {
            const { result, rerender } = renderHook(() => useSelection(mockItems));

            const initialSelectRow = result.current.selectRow;
            const initialSelectAll = result.current.selectAll;
            const initialClearSelection = result.current.clearSelection;
            const initialIsSelected = result.current.isSelected;

            rerender();

            expect(result.current.selectRow).toBe(initialSelectRow);
            expect(result.current.selectAll).toBe(initialSelectAll);
            expect(result.current.clearSelection).toBe(initialClearSelection);
            expect(result.current.isSelected).toBe(initialIsSelected);
        });

        it('isSelected должен обновляться при изменении selectedIds', () => {
            const { result } = renderHook(() => useSelection(mockItems));

            const isSelectedForId1 = result.current.isSelected(1);
            expect(isSelectedForId1).toBe(false);

            act(() => {
                result.current.selectRow(1);
            });

            const isSelectedForId1After = result.current.isSelected(1);
            expect(isSelectedForId1After).toBe(true);
        });
    });
});
