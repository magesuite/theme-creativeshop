import * as $ from 'jquery';
import deepGet from 'utils/deep-get/deep-get';
import viewXml from 'etc/view';
import Dailydeal from 'components/dailydeal/dailydeal';
import 'components/dailydeal/dailydeal.scss';

/**
 * Dailydeal component initialization for static elements: Product Tiles, Product Tile-Teaser and PDP
 */
setTimeout(() => {
    $(`
        .cs-dailydeal--tile,
        .cs-dailydeal--tile-teaser,
        .product-info-main .cs-dailydeal
    `).each((i, ddElement) => {
        new Dailydeal($(ddElement));
    });
});

/**
 * Some components using product tiles are rendered dinamically.
 * In order to initialise daily deal feature properly, the initialization must take place on contentUpdated event
 * triggered on these containers. Selectors List is defined and extensible in view.xml.
 */
const dynamicContainers = Object.values(
    deepGet(viewXml, 'vars.MageSuite_DailyDeal.dynamic_containers')
);

$(dynamicContainers).each((i, container) => {
    $('body').on('contentUpdated', container, function () {
        setTimeout(() => {
            $(this)
                .find(`.cs-dailydeal--tile`)
                .each((i, ddElement) => {
                    new Dailydeal($(ddElement));
                });
        });
    });
});

export { Dailydeal };
