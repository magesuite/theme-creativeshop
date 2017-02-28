import $ from 'jquery';

$( '.cs-pagination__selector-input' ).each( ( index: number, element: any ) => {
    $( element ).on( 'keyup', () => {

        const _allPages: Object = $( element ).data('pages');
        const _goToPage: number = $( element ).val() - 1;
        const _lastPage: number = $( element ).attr('max') - 1;

        if(_goToPage <= _lastPage) {
            setTimeout( () => {
                window.location = _allPages[_goToPage];
            }, 1500 );
        }

    } );
} );
