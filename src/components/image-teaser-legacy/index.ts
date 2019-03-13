import * as $ from 'jquery';

import ImageTeaserLegacy from 'components/image-teaser-legacy/image-teaser-legacy';
import 'components/image-teaser-legacy/image-teaser-legacy.scss';

$('.cs-image-teaser-legacy').each((i, element) => {
    new ImageTeaserLegacy($(element));
});
