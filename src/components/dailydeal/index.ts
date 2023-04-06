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

// Carousels, categories, grids and Product teaser
$(`.${ns}dailydeal--tile, .${ns}dailydeal--tile-teaser`).each(
    function (): void {
        setTimeout(() => {
            new Dailydeal($(this), {
                namespace: ns,
                updateLabels: true,
            });
        });
    }
);

// Multiple carousels are rendered dinamically.
// In order to initialise daily deal feature properly, the initialization must take place after contentUpdated event

const minicartCarousel = '.cs-minicart__carousel'; // mgs carousel
const visitorRecommender = '[id^="elasticsuite-recommender-container"]'; // elastic widget
const comparedProductsarousel = '.widget.block-compared-products-grid'; // elastic widget
const viewedProductsarousel = '.admin__data-grid-outer-wrap'; // magento widget
const carouselsRenderedDynamically: any = [];

carouselsRenderedDynamically.push(
    minicartCarousel,
    visitorRecommender,
    comparedProductsarousel,
    viewedProductsarousel
);

$(carouselsRenderedDynamically).each(function (i, element) {
    if ($(element).length) {
        $(element).on('contentUpdated', function () {
            $(element)
                .find(`.${ns}dailydeal--tile`)
                .each(function (): void {
                    setTimeout(() => {
                        new Dailydeal($(this), {
                            namespace: ns,
                            updateLabels: true,
                        });
                    });
                });
        });
    }
});

export { Dailydeal };
