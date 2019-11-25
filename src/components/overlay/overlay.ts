// Demo

import { IOverlay, Overlay } from './class.cs-overlay';

const overlay: IOverlay = new Overlay({
    $element: $('.cs-overlay'),
    visibleClass: 'cs-overlay--is-visible',
    onShow(): void {
        $('p').css('webkitFilter', 'blur(5px)');
    },
    onHide(): void {
        $('p').css('webkitFilter', 'none');
    },
});

$('#show').on('click', function(): void {
    overlay.show();
});

$('.cs-overlay').on('click', function(): void {
    overlay.hide();
});

export { overlay };
