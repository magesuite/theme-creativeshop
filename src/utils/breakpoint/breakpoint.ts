import * as $ from 'jquery';

// jQuery event triggered for compatibility reasons.
// TODO: Remove with next major release.
document.addEventListener('breakpointChange', (event: CustomEvent) => {
    $(window).trigger('breakpointChange', [event.detail.breakpoint]);
});
