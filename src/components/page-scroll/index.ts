import * as $ from 'jquery';
import PageScroll from 'components/page-scroll/page-scroll';
import 'components/page-scroll/page-scroll.scss';

/**
 * PageScroll component initialization
 */
if ($('.brands-index-all').length > 0) {
    new PageScroll({
        targetElementSelector: '.cs-brands-index__icons',
        hideAfterSelector: '.cs-brands-index__list',
    });
} else {
    new PageScroll();
}
