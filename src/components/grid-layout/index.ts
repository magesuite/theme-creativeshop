import * as $ from 'jquery';

import GridLayout from 'components/grid-layout/grid-layout';
import 'components/grid-layout/grid-layout.scss';

const namespace: string = 'cs-';

/**
 * GridLayout component initialization
 */
$(`.${namespace}grid-layout`).each(function(): void {
    new GridLayout($(this));
});
