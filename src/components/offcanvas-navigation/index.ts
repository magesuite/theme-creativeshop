import OffcanvasNavigation from 'components/offcanvas-navigation/offcanvas-navigation';
import 'components/offcanvas-navigation/offcanvas-navigation.scss';

/**
 * Init offcanvas in a separate task to prevent blocking of main thread.
 */
setTimeout(
    () =>
        new OffcanvasNavigation({
            drawerClassName: 'cs-offcanvas__drawer--navigation',
        })
);
