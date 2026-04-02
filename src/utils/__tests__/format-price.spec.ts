import { formatPrice } from '../format-price';

describe('formatPrice', () => {
    describe('форматирование целых чисел', () => {
        it('должен форматировать целое число без копеек', () => {
            const result = formatPrice(100);
            expect(result).toEqual({
                integer: '100',
                decimal: '00',
            });
        });

        it('должен форматировать целое число с разделителями тысяч', () => {
            const result = formatPrice(1000);
            expect(result).toEqual({
                integer: '1 000',
                decimal: '00',
            });
        });

        it('должен форматировать большие целые числа', () => {
            const result = formatPrice(1234567);
            expect(result).toEqual({
                integer: '1 234 567',
                decimal: '00',
            });
        });
    });

    describe('форматирование чисел с десятичной частью', () => {
        it('должен форматировать число с двумя знаками после запятой', () => {
            const result = formatPrice(100.5);
            expect(result).toEqual({
                integer: '100',
                decimal: '50',
            });
        });

        it('должен форматировать число с одним знаком после запятой', () => {
            const result = formatPrice(100.5);
            expect(result).toEqual({
                integer: '100',
                decimal: '50',
            });
        });

        it('должен форматировать число с тремя знаками после запятой (округляет до двух)', () => {
            const result = formatPrice(100.555);
            expect(result).toEqual({
                integer: '100',
                decimal: '56',
            });
        });

        it('должен правильно округлять вверх', () => {
            const result = formatPrice(100.999);
            expect(result).toEqual({
                integer: '101',
                decimal: '00',
            });
        });

        it('должен правильно округлять вниз', () => {
            const result = formatPrice(100.444);
            expect(result).toEqual({
                integer: '100',
                decimal: '44',
            });
        });
    });

    describe('форматирование чисел с разделителями тысяч и копейками', () => {
        it('должен форматировать число с тысячами и копейками', () => {
            const result = formatPrice(1234.56);
            expect(result).toEqual({
                integer: '1 234',
                decimal: '56',
            });
        });

        it('должен форматировать большие числа с копейками', () => {
            const result = formatPrice(9876543.21);
            expect(result).toEqual({
                integer: '9 876 543',
                decimal: '21',
            });
        });
    });

    describe('работа с нулем и граничными значениями', () => {
        it('должен форматировать ноль', () => {
            const result = formatPrice(0);
            expect(result).toEqual({
                integer: '0',
                decimal: '00',
            });
        });

        it('должен форматировать 0.01', () => {
            const result = formatPrice(0.01);
            expect(result).toEqual({
                integer: '0',
                decimal: '01',
            });
        });

        it('должен форматировать 0.99', () => {
            const result = formatPrice(0.99);
            expect(result).toEqual({
                integer: '0',
                decimal: '99',
            });
        });
    });

    describe('работа с отрицательными числами', () => {
        it('должен форматировать отрицательное целое число', () => {
            const result = formatPrice(-100);
            expect(result).toEqual({
                integer: '-100',
                decimal: '00',
            });
        });

        it('должен форматировать отрицательное число с копейками', () => {
            const result = formatPrice(-100.5);
            expect(result).toEqual({
                integer: '-100',
                decimal: '50',
            });
        });

        it('должен форматировать отрицательное число с тысячами', () => {
            const result = formatPrice(-1234567.89);
            expect(result).toEqual({
                integer: '-1 234 567',
                decimal: '89',
            });
        });
    });

    describe('работа с очень маленькими числами', () => {
        it('должен форматировать 0.0001 (округляет до 0.00)', () => {
            const result = formatPrice(0.0001);
            expect(result).toEqual({
                integer: '0',
                decimal: '00',
            });
        });

        it('должен форматировать 0.0049 (округляет до 0.00)', () => {
            const result = formatPrice(0.0049);
            expect(result).toEqual({
                integer: '0',
                decimal: '00',
            });
        });

        it('должен форматировать 0.005 (округляет до 0.01)', () => {
            const result = formatPrice(0.005);
            expect(result).toEqual({
                integer: '0',
                decimal: '01',
            });
        });
    });

    describe('проверка типов возвращаемых значений', () => {
        it('должен возвращать integer как строку', () => {
            const result = formatPrice(100);
            expect(typeof result.integer).toBe('string');
        });

        it('должен возвращать decimal как строку', () => {
            const result = formatPrice(100);
            expect(typeof result.decimal).toBe('string');
        });

        it('decimal всегда должен содержать 2 символа', () => {
            expect(formatPrice(100).decimal).toHaveLength(2);
            expect(formatPrice(100.5).decimal).toHaveLength(2);
            expect(formatPrice(100.05).decimal).toHaveLength(2);
            expect(formatPrice(0).decimal).toHaveLength(2);
        });
    });

    describe('разделители тысяч для разных чисел', () => {
        it('должен корректно форматировать тысячи', () => {
            expect(formatPrice(1000).integer).toBe('1 000');
            expect(formatPrice(10000).integer).toBe('10 000');
            expect(formatPrice(100000).integer).toBe('100 000');
            expect(formatPrice(1000000).integer).toBe('1 000 000');
        });

        it('должен корректно форматировать миллионы', () => {
            expect(formatPrice(1234567).integer).toBe('1 234 567');
            expect(formatPrice(9999999).integer).toBe('9 999 999');
        });
    });
});
