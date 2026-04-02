import { renderHook, act, waitFor } from '@testing-library/react';
import { productsAPI } from '../../../../api/products';
import { getErrorMessage } from '../../../../utils/get-error-message';
import type { Product, ProductsResponse } from '../../../../types/product';
import { useProducts } from '../use-product';

jest.mock('../../../../api/products');
jest.mock('../../../../utils/get-error-message');

const mockProductsAPI = productsAPI as jest.Mocked<typeof productsAPI>;
const mockGetErrorMessage = getErrorMessage as jest.MockedFunction<typeof getErrorMessage>;

describe('useProducts', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const mockProducts: Product[] = [
        {
            id: 1,
            title: 'Product 1',
            price: 100,
            brand: 'Brand 1',
            rating: 4.5,
            description: 'Description 1',
            discountPercentage: 10,
            stock: 50,
            category: 'Category 1',
            thumbnail: 'thumb1.jpg',
            images: ['img1.jpg'],
            sku: 'SKU1',
        },
        {
            id: 2,
            title: 'Product 2',
            price: 200,
            brand: 'Brand 2',
            rating: 3.5,
            description: 'Description 2',
            discountPercentage: 5,
            stock: 30,
            category: 'Category 2',
            thumbnail: 'thumb2.jpg',
            images: ['img2.jpg'],
            sku: 'SKU2',
        },
    ];

    const mockResponse: ProductsResponse = {
        products: mockProducts,
        total: 2,
        skip: 0,
        limit: 100,
    };

    describe('initialization and fetching', () => {
        it('должен загружать товары при монтировании', async () => {
            mockProductsAPI.getProducts.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useProducts(''));

            expect(result.current.loading).toBe(true);
            expect(result.current.products).toEqual([]);
            expect(result.current.progress).toBe(0);

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.products).toEqual(mockProducts);
            expect(result.current.error).toBeNull();
            expect(mockProductsAPI.getProducts).toHaveBeenCalledTimes(1);
        });

        it('должен выполнять поиск при наличии debouncedSearch', async () => {
            mockProductsAPI.searchProducts.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useProducts('test'));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockProductsAPI.searchProducts).toHaveBeenCalledWith('test');
            expect(mockProductsAPI.getProducts).not.toHaveBeenCalled();
        });
    });

    describe('progress', () => {
        it('должен обновлять прогресс во время загрузки', async () => {
            mockProductsAPI.getProducts.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 500))
            );

            const { result } = renderHook(() => useProducts(''));

            expect(result.current.progress).toBe(0);

            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(result.current.progress).toBe(10);

            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(result.current.progress).toBe(20);

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.progress).toBe(0);
            });
        });

        it('должен устанавливать прогресс 100 после успешной загрузки', async () => {
            mockProductsAPI.getProducts.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.progress).toBe(100);
            });
        });
    });

    describe('error handling', () => {
        it('должен обрабатывать ошибку при загрузке', async () => {
            const error = new Error('Network error');
            mockProductsAPI.getProducts.mockRejectedValue(error);
            mockGetErrorMessage.mockReturnValue('Ошибка сети');

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.error).toBe('Ошибка сети');
                expect(result.current.loading).toBe(false);
                expect(result.current.products).toEqual([]);
            });

            expect(mockGetErrorMessage).toHaveBeenCalledWith(error);
        });

        it('должен игнорировать AbortError', async () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            mockProductsAPI.getProducts.mockRejectedValue(abortError);

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.error).toBeNull();
                expect(result.current.loading).toBe(false);
            });

            expect(mockGetErrorMessage).not.toHaveBeenCalled();
        });
    });

    describe('refresh', () => {
        it('должен обновлять товары при вызове refresh', async () => {
            const newMockProducts = [mockProducts[0]];
            const newMockResponse = { ...mockResponse, products: newMockProducts, total: 1 };

            mockProductsAPI.getProducts.mockResolvedValueOnce(mockResponse);
            mockProductsAPI.getProducts.mockResolvedValueOnce(newMockResponse);

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.products).toEqual(mockProducts);
            });

            act(() => {
                result.current.refresh();
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.products).toEqual(newMockProducts);
            });

            expect(mockProductsAPI.getProducts).toHaveBeenCalledTimes(2);
        });
    });

    describe('updateProduct', () => {
        it('должен обновлять товар в списке', async () => {
            mockProductsAPI.getProducts.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.products).toEqual(mockProducts);
            });

            const updatedProduct: Product = {
                ...mockProducts[0],
                title: 'Updated Product',
                price: 150,
            };

            act(() => {
                result.current.updateProduct(updatedProduct);
            });

            expect(result.current.products[0]).toEqual(updatedProduct);
            expect(result.current.products[1]).toEqual(mockProducts[1]);
        });
    });

    describe('addProduct', () => {
        it('должен добавлять новый товар в начало списка', async () => {
            mockProductsAPI.getProducts.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.products).toEqual(mockProducts);
            });

            const newProduct: Product = {
                id: 3,
                title: 'New Product',
                price: 300,
                brand: 'Brand 3',
                rating: 5,
                description: 'New Description',
                discountPercentage: 0,
                stock: 100,
                category: 'New Category',
                thumbnail: 'thumb3.jpg',
                images: ['img3.jpg'],
                sku: 'SKU3',
            };

            act(() => {
                result.current.addProduct(newProduct);
            });

            expect(result.current.products[0]).toEqual(newProduct);
            expect(result.current.products.length).toBe(3);
        });
    });

    describe('deleteProduct', () => {
        it('должен удалять товар из списка', async () => {
            mockProductsAPI.getProducts.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.products).toEqual(mockProducts);
            });

            act(() => {
                result.current.deleteProduct(1);
            });

            expect(result.current.products).toEqual([mockProducts[1]]);
            expect(result.current.products.length).toBe(1);
        });
    });

    describe('abort controller', () => {
        it('должен отменять предыдущий запрос при новом', async () => {
            const abortSpy = jest.spyOn(window.AbortController.prototype, 'abort');

            mockProductsAPI.getProducts.mockImplementationOnce(() => new Promise(() => {}));

            mockProductsAPI.getProducts.mockResolvedValueOnce(mockResponse);

            const { rerender } = renderHook(({ search }) => useProducts(search), {
                initialProps: { search: 'first' },
            });

            act(() => {
                jest.advanceTimersByTime(100);
            });

            rerender({ search: 'second' });

            expect(abortSpy).toHaveBeenCalled();

            abortSpy.mockRestore();
        });
    });

    describe('cleanup', () => {
        it('должен отменять запросы и таймеры при размонтировании', async () => {
            const abortSpy = jest.spyOn(window.AbortController.prototype, 'abort');

            mockProductsAPI.getProducts.mockImplementation(() => new Promise(() => {}));

            const { unmount } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(100);
            });

            unmount();

            expect(abortSpy).toHaveBeenCalled();

            abortSpy.mockRestore();
        });
    });

    describe('setProducts', () => {
        it('должен позволять напрямую устанавливать товары', async () => {
            mockProductsAPI.getProducts.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useProducts(''));

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(result.current.products).toEqual(mockProducts);
            });

            const newProducts: Product[] = [
                {
                    id: 10,
                    title: 'Manual Product',
                    price: 999,
                    brand: 'Manual',
                    rating: 5,
                    description: 'Manual Description',
                    discountPercentage: 0,
                    stock: 1,
                    category: 'Manual Category',
                    thumbnail: 'thumb10.jpg',
                    images: ['img10.jpg'],
                    sku: 'SKU10',
                },
            ];

            act(() => {
                result.current.setProducts(newProducts);
            });

            expect(result.current.products).toEqual(newProducts);
        });
    });
});
