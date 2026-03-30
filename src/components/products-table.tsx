import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '../pages/products.tsx';

interface ProductsTableProps {
    products: Product[];
    sortBy: 'price' | 'rating' | null;
    sortOrder: 'asc' | 'desc';
    onSort: (field: 'price' | 'rating') => void;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
    getRatingColor: (rating: number) => string;
}

export const ProductsTable = ({
    products,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete,
    getRatingColor,
}: ProductsTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-gray-200">
                    <tr className="text-left text-sm font-medium text-gray-500">
                        <th className="pb-3">Наименование</th>
                        <th className="pb-3">
                            <button
                                onClick={() => onSort('price')}
                                className="flex items-center gap-1 hover:text-gray-700"
                            >
                                Цена
                                {sortBy === 'price' && (
                                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </button>
                        </th>
                        <th className="pb-3">Вендор</th>
                        <th className="pb-3">Артикул</th>
                        <th className="pb-3">
                            <button
                                onClick={() => onSort('rating')}
                                className="flex items-center gap-1 hover:text-gray-700"
                            >
                                Рейтинг
                                {sortBy === 'rating' && (
                                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </button>
                        </th>
                        <th className="pb-3 w-20"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            <td className="py-3">
                                <div className="flex items-center gap-3">
                                    {product.thumbnail && (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.title}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{product.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {product.description?.substring(0, 100) ||
                                                'Нет описания'}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3">{product.price.toLocaleString()} ₽</td>
                            <td className="py-3">{product.brand || '-'}</td>
                            <td className="py-3">{product.sku || '-'}</td>
                            <td className="py-3">
                                <span className={getRatingColor(product.rating)}>
                                    {product.rating?.toFixed(1) || '-'}
                                </span>
                            </td>
                            <td className="py-3">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Редактировать"
                                    >
                                        <Pencil className="h-4 w-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title="Удалить"
                                    >
                                        <Trash2 className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
