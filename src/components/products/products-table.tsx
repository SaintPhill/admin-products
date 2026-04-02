import { usePagination } from './hooks/use-pagination.ts';
import type { Product } from '../../types/product.ts';
import { useSelection } from './hooks/use-selection.ts';
import { ProductsTableHeader } from './components/products-table-header.tsx';
import { ProductsTableRow } from './components/products-table-row.tsx';
import { Pagination } from './components/pagination.tsx';

interface ProductsTableProps {
    products: Product[];
    sortBy: 'price' | 'rating' | null;
    sortOrder: 'asc' | 'desc';
    onSort: (field: 'price' | 'rating') => void;
    onEdit: (product: Product) => void;
    getRatingColor: (rating: number) => string;
}

export const ProductsTable = ({
    products,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    getRatingColor,
}: ProductsTableProps) => {
    const { paginatedItems, paginationInfo, goToPage, nextPage, prevPage, currentPage } =
        usePagination(products, 5);

    const { isSelected, selectRow, selectAll, isAllSelected } = useSelection(paginatedItems);

    const handleMenuClick = (id: number) => {
        console.log('Menu', id);
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <ProductsTableHeader
                        isAllSelected={isAllSelected}
                        totalItems={paginatedItems.length}
                        onSelectAll={selectAll}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <tbody className="divide-y divide-gray-100">
                        {paginatedItems.map((product) => (
                            <ProductsTableRow
                                key={product.id}
                                product={product}
                                isSelected={isSelected(product.id)}
                                onSelect={selectRow}
                                onEdit={onEdit}
                                onMenu={handleMenuClick}
                                getRatingColor={getRatingColor}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={paginationInfo.totalPages}
                totalItems={paginationInfo.totalItems}
                startIndex={paginationInfo.startIndex}
                endIndex={paginationInfo.endIndex}
                onPageChange={goToPage}
                onPrevPage={prevPage}
                onNextPage={nextPage}
            />
        </div>
    );
};
