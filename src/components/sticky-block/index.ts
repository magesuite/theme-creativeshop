import makeSticky from 'components/sticky-block/sticky-block';
import breakpoint from 'utils/breakpoint/breakpoint';

import 'components/sticky-block/sticky-block.scss';

/**
 * Refactored Sticky component initialization for template
 */

const target = document.querySelector('.cs-sticky-block--no-mobile');
const targetWithMobile = document.querySelector('.cs-sticky-block');

if (target) {
    makeSticky(target, { greaterThan: breakpoint.tablet });
} else if (targetWithMobile) {
    makeSticky(target);
}
