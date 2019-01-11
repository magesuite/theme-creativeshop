import * as $ from 'jquery';

/**
 * Prevents Safari from zooming in a website when input/select font size is less then 16px.
 */
export const preventZoomOnFocus = () => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        $(document).one('mousedown', 'input, textarea, select', () => {
            $('head')
                .append(
                    '<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">'
                )
                .append('<meta name="HandheldFriendly" content="true">')
                .children('meta[name=viewport]')
                .remove();
        });
    }
};
