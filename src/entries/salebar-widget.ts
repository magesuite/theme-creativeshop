import { SalebarWidget } from 'components/salebar-widget';
import * as $ from 'jquery';

export function mgsSalebarWidget(config, element) {
    new SalebarWidget($(element), config);
}
