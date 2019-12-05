define(['jquery'], function ($) {
    'use strict';

    // Check if address is Packstation or Post Office
    var mixin = {
        isAdressPackstation: function(streetLine) {
            var packstationTranslation = 'packstation';

            return streetLine.toLowerCase().indexOf(packstationTranslation) >= 0;
        },
        isAdressPostOffice: function(streetLine) {
            var postOfficeTranslation = ['post office', 'postfiliale'];

            return postOfficeTranslation.some(function (translation) {
                return streetLine.toLowerCase().indexOf(translation) >= 0;
            });
        },
    };

    return function (target) {
        return target.extend(mixin);
    };
});
