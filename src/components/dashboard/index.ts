import 'components/dashboard/dashboard.scss';
import makeSticky from 'components/sticky/sticky';
import breakpoint from 'utils/breakpoint/breakpoint';

const target = document.querySelectorAll('.cs-sticky-block--no-mobile');
makeSticky(target, { greaterThan: breakpoint.tablet, lessThan: 1200 });
