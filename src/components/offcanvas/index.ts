import offcanvas from 'components/offcanvas/offcanvas';
import 'components/offcanvas/offcanvas.scss';

export default new offcanvas(null, {
    className: 'cs-offcanvas--navigation',
    triggerClassName: 'cs-offcanvas-toggle',
    bodyOpenClass: 'navigation-offcanvas-open',
});
