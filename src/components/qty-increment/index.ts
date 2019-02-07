import * as $ from 'jquery';

import QtyIncrement from 'components/qty-increment/qty-increment';
import 'components/qty-increment/qty-increment.scss';

$('.cs-qty-increment').each(function(): void {
    new QtyIncrement($(this));
});
