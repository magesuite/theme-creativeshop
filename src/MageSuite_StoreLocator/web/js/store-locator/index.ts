import 'MageSuite_StoreLocator/web/css/store-locator.scss';

import StoreLocator from 'MageSuite_StoreLocator/web/js/store-locator/store-locator';
import * as $ from 'jquery';

/**
 * StoreLocator component initialization for template
 */
if ($('.cs-store-locator').length) {
    new StoreLocator($('.cs-store-locator'));
}
