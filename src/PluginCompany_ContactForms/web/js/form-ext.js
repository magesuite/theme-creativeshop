/**
 * Original script map "css" as "PluginCompany_ContactForms/lib/require-css/css" Because of this it is not
 * possible to load our own styles that are placed in css folder. css is mapped again to css, and cssLib is a path to plugin folder
 * Because of this change require path in some places must be ovrriden (compare with original scripts)
 */
requirejs.config({
    map: {
        '*': {
            cssLib: 'PluginCompany_ContactForms/lib/require-css/css',
            css: 'css',
        },
    },
});
define([
    'jquery',
    'underscore',
    'cssLib!PluginCompany_ContactForms/css/shared',
    'cssLib!PluginCompany_ContactForms/css/animate.min',
], function($, _) {
    'use strict';

    return function(Form) {
        return Form.extend({
            loadTheme: function() {
                var dfd = $.Deferred();

                require(['cssLib!' + 'css' + '/plugincompany-form'], _.bind(
                    function() {
                        dfd.resolveWith(this);
                    },
                    this
                ));

                return dfd.promise();
            },
            initDateElements: function() {
                if (!this.hasDateFields()) {
                    return this;
                }
                var self = this;
                require([
                    'PluginCompany_ContactForms/js/lib/datetime/moment',
                ], function(moment) {
                    window.moment = moment;
                    require([
                        'PluginCompany_ContactForms/js/lib/datetime/collapse-transitions.min',
                        'PluginCompany_ContactForms/js/lib/datetime/bootstrap-datetimepicker.min',
                        'cssLib!PluginCompany_ContactForms/js/lib/datetime/bootstrap-datetimepicker.min',
                    ], function() {
                        self.renderDateElements();
                    });
                });
                return this;
            },
            initDropZoneElements: function() {
                require([
                    'PluginCompany_ContactForms/js/lib/dropzone/dropzone-amd-module',
                    'cssLib!PluginCompany_ContactForms/js/lib/dropzone/dropzone',
                ], _.bind(function(dropZone) {
                    this.dropZone = dropZone;
                    this.renderDropZoneElements();
                }, this));

                return this;
            },
            initVCaptcha: function() {
                require([
                    'PluginCompany_ContactForms/js/lib/visualcaptcha/js/visualcaptcha.jquery',
                    'cssLib!PluginCompany_ContactForms/js/lib/visualcaptcha/css/visualcaptcha',
                ], _.bind(function() {
                    this.renderVisualCaptcha();
                }, this));
                return this;
            },
        });
    };
});
