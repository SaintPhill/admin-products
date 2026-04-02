import { getPageNumbers } from '../get-page-numbers';

describe('getPageNumbers', () => {
    describe('когда общее количество страниц меньше или равно максимальному отображаемому', () => {
        it('должен вернуть все страницы без пропусков', () => {
            expect(getPageNumbers(1, 3, 5)).toEqual([1, 2, 3]);
            expect(getPageNumbers(2, 4, 5)).toEqual([1, 2, 3, 4]);
            expect(getPageNumbers(3, 5, 5)).toEqual([1, 2, 3, 4, 5]);
        });

        it('должен работать с максимальным отображаемым количеством по умолчанию (5)', () => {
            expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
            expect(getPageNumbers(2, 4)).toEqual([1, 2, 3, 4]);
            expect(getPageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('когда общее количество страниц больше максимального отображаемого', () => {
        describe('когда текущая страница в начале (≤ 3)', () => {
            it('должен показать первые N страниц, затем ... и последнюю страницу', () => {
                expect(getPageNumbers(1, 10, 5)).toEqual([1, 2, 3, 4, '...', 10]);
                expect(getPageNumbers(2, 10, 5)).toEqual([1, 2, 3, 4, '...', 10]);
                expect(getPageNumbers(3, 10, 5)).toEqual([1, 2, 3, 4, '...', 10]);
            });
        });

        describe('когда текущая страница в конце (≥ totalPages - 2)', () => {
            it('должен показать первую страницу, затем ... и последние N страниц', () => {
                expect(getPageNumbers(8, 10, 5)).toEqual([1, '...', 7, 8, 9, 10]);
                expect(getPageNumbers(9, 10, 5)).toEqual([1, '...', 7, 8, 9, 10]);
                expect(getPageNumbers(10, 10, 5)).toEqual([1, '...', 7, 8, 9, 10]);
            });
        });

        describe('когда текущая страница в середине', () => {
            it('должен показать первую страницу, затем ..., текущую с соседями, затем ... и последнюю', () => {
                expect(getPageNumbers(5, 10, 5)).toEqual([1, '...', 4, 5, 6, '...', 10]);
                expect(getPageNumbers(6, 10, 5)).toEqual([1, '...', 5, 6, 7, '...', 10]);
                expect(getPageNumbers(7, 10, 5)).toEqual([1, '...', 6, 7, 8, '...', 10]);
            });
        });
    });

    describe('с различными значениями maxVisible', () => {
        it('должен работать с maxVisible = 3', () => {
            expect(getPageNumbers(1, 10, 3)).toEqual([1, 2, '...', 10]);
            expect(getPageNumbers(10, 10, 3)).toEqual([1, '...', 9, 10]);
        });

        it('должен работать с maxVisible = 7', () => {
            expect(getPageNumbers(1, 20, 7)).toEqual([1, 2, 3, 4, 5, 6, '...', 20]);
            expect(getPageNumbers(10, 20, 7)).toEqual([1, '...', 9, 10, 11, '...', 20]);
            expect(getPageNumbers(20, 20, 7)).toEqual([1, '...', 15, 16, 17, 18, 19, 20]);
        });

        it('должен работать с maxVisible = 1', () => {
            expect(getPageNumbers(1, 10, 1)).toEqual([1, '...', 10]);
            expect(getPageNumbers(10, 10, 1)).toEqual([1, '...', 10]);
        });
    });

    describe('граничные случаи', () => {
        it('должен правильно обрабатывать totalPages = 6', () => {
            expect(getPageNumbers(1, 6, 5)).toEqual([1, 2, 3, 4, '...', 6]);
            expect(getPageNumbers(3, 6, 5)).toEqual([1, 2, 3, 4, '...', 6]);
            expect(getPageNumbers(4, 6, 5)).toEqual([1, '...', 3, 4, 5, 6]);
            expect(getPageNumbers(6, 6, 5)).toEqual([1, '...', 3, 4, 5, 6]);
        });

        it('должен правильно обрабатывать totalPages = 7', () => {
            expect(getPageNumbers(1, 7, 5)).toEqual([1, 2, 3, 4, '...', 7]);
            expect(getPageNumbers(3, 7, 5)).toEqual([1, 2, 3, 4, '...', 7]);
            expect(getPageNumbers(4, 7, 5)).toEqual([1, '...', 3, 4, 5, '...', 7]);
            expect(getPageNumbers(7, 7, 5)).toEqual([1, '...', 4, 5, 6, 7]);
        });

        it('должен правильно обрабатывать totalPages = 8', () => {
            expect(getPageNumbers(1, 8, 5)).toEqual([1, 2, 3, 4, '...', 8]);
            expect(getPageNumbers(4, 8, 5)).toEqual([1, '...', 3, 4, 5, '...', 8]);
            expect(getPageNumbers(5, 8, 5)).toEqual([1, '...', 4, 5, 6, '...', 8]);
            expect(getPageNumbers(8, 8, 5)).toEqual([1, '...', 5, 6, 7, 8]);
        });
    });

    describe('защита от некорректных входных данных', () => {
        it('должен обрабатывать currentPage = 0', () => {
            expect(getPageNumbers(0, 10, 5)).toEqual([1, 2, 3, 4, '...', 10]);
        });

        it('должен обрабатывать отрицательный currentPage', () => {
            expect(getPageNumbers(-1, 10, 5)).toEqual([1, 2, 3, 4, '...', 10]);
        });

        it('должен обрабатывать currentPage больше totalPages', () => {
            expect(getPageNumbers(15, 10, 5)).toEqual([1, '...', 7, 8, 9, 10]);
        });

        it('должен обрабатывать maxVisible = 0', () => {
            expect(getPageNumbers(5, 10, 0)).toEqual([1, '...', 10]);
        });

        it('должен обрабатывать отрицательный maxVisible', () => {
            expect(getPageNumbers(5, 10, -1)).toEqual([1, '...', 10]);
        });

        it('должен обрабатывать totalPages = 0', () => {
            expect(getPageNumbers(1, 0, 5)).toEqual([]);
        });

        it('должен обрабатывать totalPages = 1', () => {
            expect(getPageNumbers(1, 1, 5)).toEqual([1]);
        });
    });
});
