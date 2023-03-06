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
$(`.${ns}dailydeal--tile`).each(function (): void {
    setTimeout(() => {
        new Dailydeal($(this), {
            namespace: ns,
            updateLabels: true,
        });
    });
});

const $minicartCarousel = $('.cs-minicart__carousel');

// Minicart carousel is initialised after ajax call.
// In order to initialize daily deal feature properly, the initialization must take place after contentUpdated event
if ($minicartCarousel.length) {
    $minicartCarousel.on('contentUpdated', function () {
        $minicartCarousel.find(`.${ns}dailydeal--tile`).each(function (): void {
            setTimeout(() => {
                new Dailydeal($(this), {
                    namespace: ns,
                    updateLabels: true,
                });
            });
        });
    });
}

export { Dailydeal };
