import * as $ from 'jquery';
import FastShipping from 'components/indicators/fast-shipping';
import ExpectedDeliveryDate from 'components/indicators/expected-delivery';

import 'components/indicators/low-stock.scss';
import 'components/indicators/fast-shipping.scss';
import 'components/indicators/free-shipping.scss';
import 'components/indicators/recently-bought.scss';
import 'components/indicators/expected-delivery.scss';

$('.cs-indicator-fast-shipping').each(function(): void {
    new FastShipping($(this));
});

// Expected delivery date
$('.cs-indicator-exp-delivery').each(function(): void {
    new ExpectedDeliveryDate($(this));
});
