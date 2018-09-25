import * as $ from 'jquery';

import 'components/navigation/teaser';

import Navigation from 'components/navigation/navigation';
import 'components/navigation/navigation.scss';

const namespace: string = 'cs-';
/**
 * Navigation component initialization
 */
new Navigation($(`.${namespace}navigation`), {});
