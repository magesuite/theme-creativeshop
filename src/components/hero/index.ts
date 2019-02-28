import * as $ from 'jquery';

import Hero from 'components/hero/hero';
import 'components/hero/hero.scss';

$('.cs-hero').each((i, element) => {
    new Hero($(element));
});
