/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import ItemCloner from 'components/item-cloner/item-cloner';
import * as $ from 'jquery';

new ItemCloner($('.cs-grid-product:not(.cs-grid-product--static)'), {
    cloneContentHoverClass: 'cs-grid-product--show-details',
    touch: {
        disableAnimations: false,
    },
});
