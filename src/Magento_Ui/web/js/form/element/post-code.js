/**
 * Copyright © 2016 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'underscore',
    'uiRegistry',
    './abstract'
], function (_, registry, Abstract) {
    'use strict';

    return Abstract.extend({
        defaults: {
            imports: {
                update: '${ $.parentName }.country_id:value'
            }
        },

        // REF-PATCH START avoid premature ZIP code validation (by using less strict compare method),
        /**
         * Initializes observable properties of instance
         *
         * @returns {Abstract} Chainable.
         */
        initObservable: function() {
            this._super();
            this.value.equalityComparer = function( a, b ) {
                return (!a && !b) || (a == b);
            };
            return this;
        },
        // REF-PATCH END

        /**
         * @param {String} value
         */
        update: function( value ) {
            var country = registry.get( this.parentName + '.' + 'country_id' ),
                options = country.indexedOptions,
                option;

            if ( !value ) {
                return;
            }

            option = options[ value ];

            if ( option[ 'is_zipcode_optional' ] ) {
                this.error( false );
                this.validation = _.omit( this.validation, 'required-entry' );
            } else {
                this.validation[ 'required-entry' ] = true;
            }

            this.required( !option[ 'is_zipcode_optional' ] );
        }
    });
});
