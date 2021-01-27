import * as $ from 'jquery';

import HeaderSearch from 'components/header/search/search';
import 'components/header/search/search.scss';

if ($('.cs-header .cs-header__search').length) {
    new HeaderSearch();
}
