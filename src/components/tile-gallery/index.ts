import * as $ from 'jquery';

import TileGallery from 'components/tile-gallery/tile-gallery';
import 'components/tile-gallery/tile-gallery.scss';

const ns: string = 'cs-';

/**
 * TileGallery component initialization
 * NOTE: Gallery shall not be visible with products having active DailyDeal countdown
 */

const $productTile: JQuery = $(`.${ns}product-tile`);

$productTile.each(function(): void {
    const $tile: JQuery<HTMLElement> = $(this);
    const $dailyDeal: JQuery<HTMLElement> = $tile.find(
        $(`.${ns}dailydeal--tile`)
    );
    const $gallery: JQuery<HTMLElement> = $tile.find($(`.${ns}tile-gallery`));

    if ($gallery.length && !$dailyDeal.length) {
        $tile.one('mouseenter', () => {
            new TileGallery($gallery);
        });
    }
});
