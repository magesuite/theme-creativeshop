import $ from 'jquery';
import OffcanvasNavigation from 'components/offcanvas-navigation/offcanvas-navigation';

import contentSetter from './content-setter';

const offNavClassName: string = 'cs-offcanvas-navigation';

const navigaiton: any = new OffcanvasNavigation(null, {
    className: offNavClassName,
    contentSetter: contentSetter,
    showCategoryIcon: false,
    showProductsCount: false,
});

export default navigaiton;
