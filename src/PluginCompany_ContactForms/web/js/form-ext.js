/**
 * Original script map "css" as "PluginCompany_ContactForms/lib/require-css/css" Because of this it is not
 * possible to load our own styles that are placed in css folder. css is mapped again to css, and cssLib is a path to plugin folder
 * Because of this change require path in some places must be overwritten (compare with original scripts).
 */
define(['jquery', 'underscore'], function($, _) {
    'use strict';

    return function(Form) {
        return Form.extend({
            loadTheme: function() {
                var dfd = $.Deferred();
                /**
                 * Check URL of the first stylesheet in the head to know if we should
                 * link to the minified resource or not.
                 */
                var isMinified = $('head link[rel="stylesheet"]')
                    .attr('href')
                    .match(/\.min.css$/);
                var cssUrl =
                    requirejs.toUrl('') + // Pass empty string to get the base URL while preventing "css" => "lib/require-css/css" mapping.
                    'css/plugincompany-form' +
                    (isMinified ? '.min.css' : '.css');

                $('<link>')
                    .attr({
                        rel: 'stylesheet',
                        href: cssUrl,
                    })
                    .on(
                        'load',
                        _.bind(function() {
                            dfd.resolveWith(this);
                        }, this)
                    )
                    .appendTo('head');

                return dfd.promise();
            },
        });
    };
});
