import offcanvas from 'components/offcanvas/offcanvas';
import 'components/offcanvas/offcanvas.scss';

export default new offcanvas(null, {
    className: 'cs-offcanvas--navigation',
    triggerClassName: 'cs-offcanvas-toggle',
    bodyOpenClass: 'navigation-offcanvas-open',
    initiallyFocusableElement:
        '.cs-offcanvas-navigation__list--current .cs-offcanvas-navigation__link',
});
