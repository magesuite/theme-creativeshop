import * as $ from 'jquery';

import ImageTeaser from 'components/image-teaser/image-teaser';
import 'components/image-teaser/image-teaser.scss';

$('.cs-image-teaser').each((i, element) => {
    new ImageTeaser($(element));
});
