import * as $ from 'jquery';

import Dailydeal from 'components/dailydeal/dailydeal';
import 'components/dailydeal/dailydeal.scss';

const ns: string = 'cs-';

/**
 * Dailydeal component initialization
 */

// PDP sale block
setTimeout(() => {
    new Dailydeal($(`.product-info-main .${ns}dailydeal`), {
        namespace: ns,
        updateLabels: true,
    });
});

// Carousels, categories, grids
$(`.${ns}dailydeal--tile`).each(function(): void {
    setTimeout(() => {
        new Dailydeal($(this), {
            namespace: ns,
            updateLabels: false,
        });
    });
});
