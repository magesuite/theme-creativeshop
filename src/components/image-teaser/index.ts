import * as $ from 'jquery';

import ImageTeaser from 'components/image-teaser/image-teaser';

import 'components/image-teaser/image-teaser.scss';

$(`.cs-image-teaser`).each(
    (index: number, element: HTMLElement): void => {
        new ImageTeaser($(element));
    }
);
