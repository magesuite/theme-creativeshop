/* tslint:disable:no-unused-new */

import $ from 'jquery';

import Dailydeal from 'components/dailydeal/dailydeal';

const namespace: string = 'cs-';

/**
 * Dailydeal component initialization
 */

// PDP sale block
new Dailydeal($(`.product-info-main .${namespace}dailydeal`), {
    namespace: namespace,
    updateLabels: true,
});

// Carousels, categories, grids
$(`.${namespace}dailydeal--tile`).each(function(): void {
    new Dailydeal($(this), {
        namespace: namespace,
        updateLabels: false,
    });
});
