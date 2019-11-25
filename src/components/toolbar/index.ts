import * as $ from 'jquery';

import 'components/toolbar/toolbar.scss';

import Pagination from 'components/toolbar/pagination';

const $paginationInput: JQuery<HTMLInputElement> = $(
    '.cs-pagination__page-provider-input'
);
$paginationInput.each(function() {
    new Pagination($(this));
});
