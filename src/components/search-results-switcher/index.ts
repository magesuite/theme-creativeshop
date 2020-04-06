import SearchResultsSwitcher from 'components/search-results-switcher/search-results-switcher';

import 'components/search-results-switcher/search-results-switcher.scss';

if (document.getElementsByClassName('cs-search-results-switcher').length) {
    new SearchResultsSwitcher();
}
