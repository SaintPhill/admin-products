import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import { productsAPI } from '../../../../api/products';
import { getErrorMessage } from '../../../../utils/get-error-message';
import type { Product } from '../../../../types/product';
import { useProductForm } from '../use-product-form';

jest.mock('../../../../api/products');
jest.mock('../../../../utils/get-error-message');
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockProductsAPI = productsAPI as jest.Mocked<typeof productsAPI>;
const mockGetErrorMessage = getErrorMessage as jest.MockedFunction<typeof getErrorMessage>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useProductForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockOnSuccess = jest.fn();
    const mockProduct: Product = {
        id: 1,
        title: 'Test Product',
        price: 100,
        brand: 'Test Brand',
        rating: 4.5,
        description: 'Test Description',
        discountPercentage: 10,
        stock: 50,
        category: 'Test Category',
        thumbnail: 'thumb.jpg',
        images: ['img1.jpg'],
        sku: 'SKU123',
    };

    describe('initial state', () => {
        it('должен инициализироваться с закрытым модальным окном', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            expect(result.current.isModalOpen).toBe(false);
            expect(result.current.editingProduct).toBeNull();
            expect(result.current.isSubmitting).toBe(false);
        });

        it('должен иметь правильные значения формы по умолчанию', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            expect(result.current.form.getValues()).toEqual({
                title: '',
                price: 0,
                brand: '',
                sku: '',
            });
        });
    });

    describe('openAddModal', () => {
        it('должен открывать модальное окно для добавления товара', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            expect(result.current.isModalOpen).toBe(true);
            expect(result.current.editingProduct).toBeNull();
        });

        it('должен сбрасывать форму при открытии', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.form.setValue('title', 'Some Title');
                result.current.form.setValue('price', 999);
            });

            act(() => {
                result.current.openAddModal();
            });

            expect(result.current.form.getValues()).toEqual({
                title: '',
                price: 0,
                brand: '',
                sku: '',
            });
        });
    });

    describe('openEditModal', () => {
        it('должен открывать модальное окно для редактирования товара', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openEditModal(mockProduct);
            });

            expect(result.current.isModalOpen).toBe(true);
            expect(result.current.editingProduct).toEqual(mockProduct);
        });

        it('должен заполнять форму данными товара', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openEditModal(mockProduct);
            });

            expect(result.current.form.getValues()).toEqual({
                title: mockProduct.title,
                price: mockProduct.price,
                brand: mockProduct.brand,
                sku: mockProduct.sku,
            });
        });

        it('должен устанавливать sku в пустую строку если его нет', () => {
            const productWithoutSku = { ...mockProduct, sku: undefined };
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openEditModal(productWithoutSku);
            });

            expect(result.current.form.getValues().sku).toBe('');
        });
    });

    describe('closeModal', () => {
        it('должен закрывать модальное окно и сбрасывать состояние', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });
            expect(result.current.isModalOpen).toBe(true);

            act(() => {
                result.current.closeModal();
            });

            expect(result.current.isModalOpen).toBe(false);
            expect(result.current.editingProduct).toBeNull();
        });

        it('должен сбрасывать форму при закрытии', () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openEditModal(mockProduct);
            });
            expect(result.current.form.getValues().title).toBe(mockProduct.title);

            act(() => {
                result.current.closeModal();
            });

            expect(result.current.form.getValues()).toEqual({
                title: '',
                price: 0,
                brand: '',
                sku: '',
            });
        });
    });

    describe('onSubmit - добавление товара', () => {
        const formData = {
            title: 'New Product',
            price: 150,
            brand: 'New Brand',
            sku: 'NEWSKU',
        };

        const mockApiResponse = {
            id: 3,
            title: 'New Product',
            price: 150,
            brand: 'New Brand',
            thumbnail: 'thumb.jpg',
        };

        beforeEach(() => {
            mockProductsAPI.addProduct.mockResolvedValue(mockApiResponse as Product);
        });

        it('должен успешно добавлять новый товар', async () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            act(() => {
                result.current.form.setValue('title', formData.title);
                result.current.form.setValue('price', formData.price);
                result.current.form.setValue('brand', formData.brand);
                result.current.form.setValue('sku', formData.sku);
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(mockProductsAPI.addProduct).toHaveBeenCalledWith({
                title: formData.title,
                price: formData.price,
                brand: formData.brand,
                sku: formData.sku,
                description: formData.title,
                category: 'general',
            });

            expect(mockOnSuccess).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: formData.title,
                    price: formData.price,
                    brand: formData.brand,
                    sku: formData.sku,
                    rating: 0,
                    description: formData.title,
                    thumbnail: 'https://via.placeholder.com/100',
                }),
                false
            );

            expect(mockToast.success).toHaveBeenCalledWith('Товар успешно добавлен');
            expect(result.current.isModalOpen).toBe(false);
        });

        it('должен обрабатывать ошибку при добавлении', async () => {
            const error = new Error('API Error');
            mockProductsAPI.addProduct.mockRejectedValue(error);
            mockGetErrorMessage.mockReturnValue('Ошибка добавления товара');

            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            act(() => {
                result.current.form.setValue('title', formData.title);
                result.current.form.setValue('price', formData.price);
                result.current.form.setValue('brand', formData.brand);
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(mockToast.error).toHaveBeenCalledWith('Ошибка добавления товара');
            expect(mockOnSuccess).not.toHaveBeenCalled();
            expect(result.current.isModalOpen).toBe(true); // Модалка не закрывается
        });
    });

    describe('onSubmit - редактирование товара', () => {
        const formData = {
            title: 'Updated Product',
            price: 200,
            brand: 'Updated Brand',
            sku: 'UPDATEDSKU',
        };

        const mockApiResponse = {
            id: 1,
            title: 'Updated Product',
            price: 200,
            brand: 'Updated Brand',
            thumbnail: 'new-thumb.jpg',
        };

        beforeEach(() => {
            mockProductsAPI.updateProduct.mockResolvedValue(mockApiResponse as Product);
        });

        it('должен успешно обновлять товар', async () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openEditModal(mockProduct);
            });

            act(() => {
                result.current.form.setValue('title', formData.title);
                result.current.form.setValue('price', formData.price);
                result.current.form.setValue('brand', formData.brand);
                result.current.form.setValue('sku', formData.sku);
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(mockProductsAPI.updateProduct).toHaveBeenCalledWith(mockProduct.id, {
                title: formData.title,
                price: formData.price,
                brand: formData.brand,
                sku: formData.sku,
                description: formData.title,
                category: 'general',
            });

            expect(mockOnSuccess).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: formData.title,
                    price: formData.price,
                    brand: formData.brand,
                    sku: formData.sku,
                    thumbnail: mockApiResponse.thumbnail,
                }),
                true
            );

            expect(mockToast.success).toHaveBeenCalledWith('Товар успешно обновлен');
            expect(result.current.isModalOpen).toBe(false);
        });

        it('должен использовать существующий thumbnail если API не вернул новый', async () => {
            const mockApiResponseWithoutThumb = {
                id: 1,
                title: 'Updated Product',
                price: 200,
                brand: 'Updated Brand',
                thumbnail: undefined,
            };

            mockProductsAPI.updateProduct.mockResolvedValue(
                mockApiResponseWithoutThumb as unknown as Product
            );

            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openEditModal(mockProduct);
            });

            act(() => {
                result.current.form.setValue('title', formData.title);
                result.current.form.setValue('price', formData.price);
                result.current.form.setValue('brand', formData.brand);
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(mockOnSuccess).toHaveBeenCalledWith(
                expect.objectContaining({
                    thumbnail: mockProduct.thumbnail,
                }),
                true
            );
        });

        it('должен обрабатывать ошибку при обновлении', async () => {
            const error = new Error('Update Error');
            mockProductsAPI.updateProduct.mockRejectedValue(error);
            mockGetErrorMessage.mockReturnValue('Ошибка обновления товара');

            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openEditModal(mockProduct);
            });

            act(() => {
                result.current.form.setValue('title', formData.title);
                result.current.form.setValue('price', formData.price);
                result.current.form.setValue('brand', formData.brand);
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(mockToast.error).toHaveBeenCalledWith('Ошибка обновления товара');
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    describe('валидация формы', () => {
        it('должен показывать ошибку при пустом наименовании', async () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(result.current.errors.title).toBeDefined();
            expect(result.current.errors.title?.message).toBe('Наименование обязательно');
            expect(mockProductsAPI.addProduct).not.toHaveBeenCalled();
        });

        it('должен показывать ошибку при отрицательной цене', async () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            act(() => {
                result.current.form.setValue('title', 'Test');
                result.current.form.setValue('price', -10);
                result.current.form.setValue('brand', 'Test Brand');
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(result.current.errors.price).toBeDefined();
            expect(result.current.errors.price?.message).toBe('Цена должна быть положительной');
        });

        it('должен показывать ошибку при пустом вендоре', async () => {
            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            act(() => {
                result.current.form.setValue('title', 'Test');
                result.current.form.setValue('price', 100);
                result.current.form.setValue('brand', '');
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(result.current.errors.brand).toBeDefined();
            expect(result.current.errors.brand?.message).toBe('Вендор обязателен');
        });

        it('должен проходить валидацию с корректными данными', async () => {
            mockProductsAPI.addProduct.mockResolvedValue({ id: 1 } as Product);

            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            act(() => {
                result.current.form.setValue('title', 'Test');
                result.current.form.setValue('price', 100);
                result.current.form.setValue('brand', 'Test Brand');
                result.current.form.setValue('sku', 'SKU123');
            });

            await act(async () => {
                await result.current.form.handleSubmit();
            });

            expect(result.current.errors.title).toBeUndefined();
            expect(result.current.errors.price).toBeUndefined();
            expect(result.current.errors.brand).toBeUndefined();
        });
    });

    describe('isSubmitting состояние', () => {
        it('должен устанавливать isSubmitting в true во время отправки', async () => {
            mockProductsAPI.addProduct.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ id: 1 } as Product), 100))
            );

            const { result } = renderHook(() => useProductForm(mockOnSuccess));

            act(() => {
                result.current.openAddModal();
            });

            act(() => {
                result.current.form.setValue('title', 'Test');
                result.current.form.setValue('price', 100);
                result.current.form.setValue('brand', 'Test Brand');
            });

            let submitPromise: Promise<void>;
            act(() => {
                submitPromise = result.current.form.handleSubmit();
            });

            expect(result.current.isSubmitting).toBe(true);

            await act(async () => {
                await submitPromise;
            });

            expect(result.current.isSubmitting).toBe(false);
        });
    });
});
