import $ from 'jquery';

$('.cs-pagination__selector-input').each((index: number, element: any) => {
    const _urlPattern: string = $(element).data('url-pattern');
    const _lastPage: number = parseInt($(element).attr('max'), 10);
    const _currentPage: number = parseInt($(element).val(), 10);
    let timeOut: any;
    let _goToPage: number;
    let _url: string;

    $(element).on('keyup', (event: Event): void => {
        _goToPage = parseInt($(element).val(), 10);
        _url = _urlPattern.replace('[page]', _goToPage);

        clearTimeout(timeOut);

        if (
            _goToPage > 0 &&
            _goToPage <= _lastPage &&
            _goToPage !== _currentPage
        ) {
            if (event.keyCode === 13) {
                window.location = _url;
            } else {
                timeOut = setTimeout(() => {
                    window.location = _url;
                }, 2000);
            }
        }
    });
});
