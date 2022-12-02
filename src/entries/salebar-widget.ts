import { SalebarWidget } from 'MageSuite_WidgetSalebar';
import * as $ from 'jquery';

export function mgsSalebarWidget(config, element) {
    new SalebarWidget($(element), config);
}
