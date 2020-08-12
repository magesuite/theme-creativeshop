import * as $ from 'jquery';
import { GridLayout } from 'components/grid-layout';

export function mgsGridLayout(config, element) {
    new GridLayout($(element), config);
}
