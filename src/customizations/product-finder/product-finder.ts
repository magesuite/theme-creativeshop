import ProductFinder from '../../../node_modules/creative-patterns/packages/components/product-finder/src/product-finder';
import $ from 'jquery';

$('.cs-product-finder').each(
    (index: number, element: HTMLElement): ProductFinder =>
        new ProductFinder($(element))
);
