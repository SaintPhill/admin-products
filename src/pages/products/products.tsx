import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from '../../hooks/use-debounce.ts';
import { useProducts } from './hooks/use-product.ts';
import { useProductForm } from './hooks/use-product-form.ts';
import { Header } from './components/header.tsx';
import { Toaster } from '../../components/products/components/toaster.tsx';
import { Toolbar } from './components/toolbar.tsx';
import { LoadingProgress } from './components/loading-progress.tsx';
import { ErrorMessage } from './components/error-message.tsx';
import { ProductsTable } from '../../components/products/products-table.tsx';
import { ProductFormModal } from './components/form-modal.tsx';

export const Products = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'price' | 'rating' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const debouncedSearch = useDebounce(searchQuery, 500);

    const { products, loading, progress, error, refresh, updateProduct, addProduct } =
        useProducts(debouncedSearch);

    const {
        form: { handleSubmit, register },
        isModalOpen,
        editingProduct,
        openAddModal,
        openEditModal,
        closeModal,
        errors,
        isSubmitting,
    } = useProductForm((product, isEdit) => {
        if (isEdit) {
            updateProduct(product);
        } else {
            addProduct(product);
        }
    });

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
            return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
        });
    }

    const getRatingColor = (rating: number): string => {
        return rating < 3.5 ? 'text-red-600' : 'text-green-600';
    };

    const handleRefresh = () => {
        refresh();
        toast.success('Таблица обновлена');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Товары" searchValue={searchQuery} onSearchChange={setSearchQuery} />

            <div className="pt-8">
                <Toaster />

                <div className="bg-white">
                    <Toolbar onRefresh={handleRefresh} onAdd={openAddModal} isLoading={loading} />

                    <div className="p-[30px] pt-0">
                        {loading && <LoadingProgress progress={progress} />}
                        {error && <ErrorMessage message={error} onRetry={handleRefresh} />}

                        <ProductsTable
                            products={sortedProducts}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                            onEdit={openEditModal}
                            getRatingColor={getRatingColor}
                        />

                        {!loading && !error && sortedProducts.length === 0 && (
                            <div className="text-center py-8 text-gray-500">Товары не найдены</div>
                        )}
                    </div>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
                editingProduct={editingProduct}
            />
        </div>
    );
};
