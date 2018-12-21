import * as $ from 'jquery';
import Cart from 'components/cart/cart';

import 'components/cart/cart-bonus';
import 'components/cart/cart-item';
import 'components/cart/cart-summary';
import 'components/cart/cart-table';

if ($('.checkout-cart-index').length) {
    new Cart();
}
