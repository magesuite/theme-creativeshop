import 'components/minicart/minicart.scss';

import * as $ from 'jquery';

import Minicart from 'components/minicart/minicart-offcanvas';

new Minicart({});

// In case of dropdown-minicart minicart functionalities are initialize only after minicart with products is shown
// Empty dropdown-minicart cannot be closed by clicking on X icon as events are nit attached yet.
// In order to close empty minicart click outside dropdown is triggered
if (!$('.cs-minicart-offcanvas__wrapper').length) {
    $('.cs-minicart').on(
        'click touchend',
        '.cs-minicart__close, .cs-minicart__close-icon',
        function() {
            if (!$('.cs-minicart__list-item').length) {
                $('body').trigger('click');
            }
        }
    );
}
