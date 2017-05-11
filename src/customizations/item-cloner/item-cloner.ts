/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import ItemCloner from '../../../node_modules/creative-patterns/packages/components/item-cloner/src/item-cloner';
import $ from 'jquery';

new ItemCloner( $( '.cs-grid-product:not(.cs-grid-product--static)' ), {
    originHoverClass: 'cs-grid-product--hidden',
    cloneContentHoverClass: 'cs-grid-product--show-details',
    touch: {
        disableAnimations: false,
    }
} );
