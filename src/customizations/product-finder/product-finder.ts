import ProductFinder from 'components/product-finder/product-finder';
import * as $ from 'jquery';

$('.cs-product-finder').each(
    (index: number, element: HTMLElement): ProductFinder =>
        new ProductFinder($(element))
);
