import * as $ from 'jquery';

import ImageTeaserNext from 'components/image-teaser-next/image-teaser-next';

import 'components/image-teaser-next/image-teaser-next.scss';

$(`.cs-image-teaser-next`).each(
    (index: number, element: HTMLElement): void => {
        new ImageTeaserNext($(element));
    }
);
