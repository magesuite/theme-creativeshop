/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import QtyIncrement from 'components/qty-increment/qty-increment';
import * as $ from 'jquery';

/**
 * Initializes all flyouts on the page.
 */
class QtyIncrementCollection {
    public constructor() {
        $('.cs-qty-increment').each((index: number, element: any) => {
            new QtyIncrement($(element));
        });
    }
}

export { QtyIncrementCollection };
