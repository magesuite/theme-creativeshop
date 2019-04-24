/**
 * Origin: Native M2 dataPost widget
 * Modification type: dependency
 * Reason: a need to make redirects based on "uenc" property work with full page cache, mainly in tile and offcanvas navigation.
 */
define(['jquery'], function($) {
    'use strict';

    var uenc = btoa(window.location.href);
    var triggers = 'a[data-post], button[data-post], span[data-post]';

    $(triggers).each(function(index, element) {
        var $element = $(element);
        var elementData = $element.data('post');
        var shouldUpdate =
            $element.data('uenc-update') &&
            elementData.data &&
            elementData.data.uenc;

        if (shouldUpdate) {
            elementData.data.uenc = uenc;
            $element.data('post', elementData);
        }
    });
});
