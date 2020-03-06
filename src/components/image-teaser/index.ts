import * as $ from 'jquery';

import ImageTeaser from 'components/image-teaser/image-teaser';

import 'components/image-teaser/image-teaser.scss';

$(`.cs-image-teaser`).each(function(): void {
    /**
     * Initialize each image teaser in a separate task to let the browser do its stuff in between.
     */
    setTimeout(() => {
        new ImageTeaser($(this));
    });
});
