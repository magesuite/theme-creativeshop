import 'components/products-grid';
import {
    ProductsGridOptions,
    ProductsGrid,
} from 'components/products-grid/products-grid';

export function ccProductsGrid(
    config: ProductsGridOptions,
    element: HTMLElement
) {
    new ProductsGrid(element, config);
}
