import Offcanvas from 'components/offcanvas/offcanvas';
import 'components/offcanvas-filters/offcanvas-filters.scss';

/**
 * Init offcanvas in a separate task to prevent blocking of main thread.
 */
setTimeout(() => {
    new Offcanvas(null, {
        className: 'cs-offcanvas-filters',
        triggerClassName: 'cs-toolbar__filters-button',
        closeButtonClassName: 'cs-offcanvas-filters__close',
        bodyOpenClass: 'navigation-offcanvas-filters-open',
    });
});
