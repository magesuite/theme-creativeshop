import * as $ from 'jquery';
import FastShipping from 'components/indicators/fast-shipping';

import 'components/indicators/low-stock.scss';
import 'components/indicators/fast-shipping.scss';
import 'components/indicators/free-shipping.scss';
import 'components/indicators/recently-bought.scss';

$('.cs-indicator-fast-shipping').each(function(): void {
    new FastShipping($(this));
});
