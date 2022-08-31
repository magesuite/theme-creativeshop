/**
 * Our integration of Instant search from ElasticSuite Premium consists of:
 * - slightly overwritten template 'Smile_ElasticsuiteInstantSearch/templates/search/form.mini.phtml'
 * - initialized 'HeaderSearch' JavaScript component with adjusted classes, to support show/hide search as for the default search.
 * - simplified header search styles to support show/hide search on mobile as for the default search
 * - styles for instant search results
 *
 * In order to use the integration, import `Smile_ElasticsuiteInstantSearch` in entries.
 * Also, import of components/header/search component should be removed from entries
 * - as it provides more complex styles for the default search that are redundant when instant search is enabled.
 */
import 'Smile_ElasticsuiteInstantSearch/web/css/instant-search.scss';
import 'Smile_ElasticsuiteInstantSearch/web/css/instant-search-results.scss';

import * as $ from 'jquery';

import HeaderSearch from 'components/header/search/search';

if ($('.cs-header__search').length) {
    new HeaderSearch({
        closeButtonSelector: '.cs-instant-search__close',
        closeElementToggleSearch: true,
        searchInputFocus: true,
    });
}
