import * as $ from 'jquery';

import TileGallery from 'components/tile-gallery/tile-gallery';
import 'components/tile-gallery/tile-gallery.scss';

const ns: string = 'cs-';

/**
 * TileGallery component initialization
 */

const $productTile: JQuery = $(
    `.${ns}product-tile`
);

$productTile.each(function(): void {
    const $tile: JQuery<HTMLElement> = $(this);
    const $gallery: JQuery<HTMLElement> = $tile.find($(
        `.${ns}tile-gallery`
    ));
    let isInitialized: boolean = false;

    if ($gallery.length) {
        $tile.on({
            mouseenter: function(): void {
                if (!isInitialized) {
                    new TileGallery($gallery);
                    isInitialized = true;
                }
            }
        });
    }
});
