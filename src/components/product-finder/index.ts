import * as $ from 'jquery';

import ProductFinder from 'components/product-finder/product-finder';
import 'components/product-finder/product-finder.scss';


$('.cs-product-finder').each(
    (index: number, element: HTMLElement): ProductFinder =>
        new ProductFinder($(element))
);
