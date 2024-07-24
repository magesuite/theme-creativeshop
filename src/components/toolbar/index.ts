import * as $ from 'jquery';

import 'components/toolbar/toolbar.scss';

import Pagination from 'components/toolbar/pagination';

const $paginationInput: JQuery<HTMLInputElement> = $(
    '.cs-pagination__page-provider-input'
);
$paginationInput.each(function () {
    new Pagination($(this));
});

$('.cs-limiter__pagination-number').on('click', function() {
    var $limiter = $('.cs-limiter select');
    var chosenVal = $(this).data('value');
    if (/^([1-9]\d*|all)$/.test(chosenVal)) {
        $limiter.val(chosenVal).trigger('change');
    }
});
