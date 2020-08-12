import * as $ from 'jquery';
import { ProductFinder } from 'components/product-finder';

export function ccProductFinder(config, element) {
    new ProductFinder($(element), config);
}
