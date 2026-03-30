import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Toaster } from '../components/ui/toaster';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { productsAPI } from '../api/products';
import type { Product, NewProduct } from '../types/product';
import { ProductsTable } from '../components/products-table.tsx';
import { getErrorMessage } from '../utils/get-error-message.ts';

const productSchema = z.object({
    title: z.string().min(1, 'Наименование обязательно'),
    price: z.number().min(0, 'Цена должна быть положительной'),
    brand: z.string().min(1, 'Вендор обязателен'),
    sku: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'price' | 'rating' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    const debouncedSearch = useDebounce(searchQuery, 500);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: '',
            price: 0,
            brand: '',
            sku: '',
        },
    });

    const fetchProducts = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        try {
            let response;
            if (debouncedSearch) {
                response = await productsAPI.searchProducts(debouncedSearch);
            } else {
                response = await productsAPI.getProducts();
            }

            if (isMountedRef.current) {
                setProducts(response.products || []);
                setProgress(100);
            }
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError' && isMountedRef.current) {
                console.error('Error fetching products:', err);
                setError(getErrorMessage(err));
                setProgress(0);
            }
        } finally {
            if (isMountedRef.current) {
                setTimeout(() => {
                    setLoading(false);
                    setTimeout(() => setProgress(0), 300);
                }, 200);
            }
            clearInterval(progressInterval);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;

        const timer = setTimeout(() => {
            if (isMountedRef.current) {
                fetchProducts();
            }
        }, 0);

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearTimeout(timer);
        };
    }, [debouncedSearch]);

    const handleSort = (field: 'price' | 'rating') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const sortedProducts = [...products];

    if (sortBy) {
        sortedProducts.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    const getRatingColor = (rating: number): string => {
        return rating < 3.5 ? 'text-red-600' : 'text-green-600';
    };

    const handleRefresh = () => {
        fetchProducts();
        toast.success('Таблица обновлена');
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        reset({
            title: '',
            price: 0,
            brand: '',
            sku: '',
        });
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setValue('title', product.title);
        setValue('price', product.price);
        setValue('brand', product.brand);
        setValue('sku', product.sku || '');
        setIsModalOpen(true);
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            const newProductData: NewProduct = {
                title: data.title,
                price: data.price,
                brand: data.brand,
                sku: data.sku,
                description: data.title,
                category: 'general',
            };

            if (editingProduct) {
                const updatedProduct = await productsAPI.updateProduct(
                    editingProduct.id,
                    newProductData
                );
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === editingProduct.id
                            ? {
                                  ...updatedProduct,
                                  sku: data.sku || updatedProduct.sku,
                                  brand: data.brand,
                                  price: data.price,
                                  title: data.title,
                                  thumbnail: updatedProduct.thumbnail || p.thumbnail,
                              }
                            : p
                    )
                );
                toast.success('Товар успешно обновлен');
            } else {
                const newProduct = await productsAPI.addProduct(newProductData);
                const fullProduct: Product = {
                    ...newProduct,
                    sku: data.sku,
                    brand: data.brand,
                    price: data.price,
                    title: data.title,
                    rating: 0,
                    description: data.title,
                    thumbnail: 'https://via.placeholder.com/100',
                };
                setProducts((prev) => [fullProduct, ...prev]);
                toast.success('Товар успешно добавлен');
            }

            setIsModalOpen(false);
            reset();
        } catch (err) {
            console.error('Error saving product:', err);
            toast.error(getErrorMessage(err));
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await productsAPI.deleteProduct(id);
                setProducts((prev) => prev.filter((p) => p.id !== id));
                toast.success('Товар удален');
            } catch (err) {
                console.error('Error deleting product:', err);
                toast.error(getErrorMessage(err));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Наименование *
                            </label>
                            <Input {...register('title')} placeholder="Введите наименование" />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Цена *
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('price', { valueAsNumber: true })}
                                placeholder="0"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Вендор *
                            </label>
                            <Input {...register('brand')} placeholder="Введите вендора" />
                            {errors.brand && (
                                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Артикул
                            </label>
                            <Input {...register('sku')} placeholder="Введите артикул" />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? 'Сохранение...'
                                    : editingProduct
                                      ? 'Сохранить'
                                      : 'Добавить'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Товары</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={handleAddProduct} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить
                            </Button>
                            <Button
                                onClick={handleRefresh}
                                variant="outline"
                                size="sm"
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Поиск товаров..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {loading && (
                        <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Загрузка товаров... {progress}%
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600 font-medium">Ошибка: {error}</p>
                            <Button
                                onClick={handleRefresh}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                            >
                                Попробовать снова
                            </Button>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="mb-4 text-sm text-gray-500">
                            Найдено товаров: {sortedProducts.length}
                        </div>
                    )}

                    <ProductsTable
                        products={sortedProducts}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        getRatingColor={getRatingColor}
                    />

                    {!loading && !error && sortedProducts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">Товары не найдены</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
