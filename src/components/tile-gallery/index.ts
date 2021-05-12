import * as $ from 'jquery';
import TileGallery from 'components/tile-gallery/tile-gallery';
import 'components/tile-gallery/tile-gallery.scss';

/**
 * Tile Gallery
 *
 * Module: magesuite-product-tile
 * Layout: product_tile.xml
 * Block name: product.tile.gallery
 * Template: fragments/gallery.phtml
 *
 * Component can be enabled in Admin Panel -> Stores -> Configuration -> MageSuite -> Product Tile -> Enable Thumbnail Gallery
 * It will display a thumbnail gallery over main product photo
 * The main product photo will switch to currently hovered thumbnail gallery item
 * Additional project configuration can be set as block arguments (XML) or passed as arguments to new TileGallery($gallery, config)
 * Gallery doesn't initialize for products with DailyDeal
 *
 * NOTE: If you want to use this feature, please add it in your project's entries
 */

const $productTile: JQuery = $('.cs-product-tile');

$productTile.each(function(): void {
    const $tile: JQuery<HTMLElement> = $(this);
    const $dailyDeal: JQuery<HTMLElement> = $tile.find(
        $('.cs-dailydeal--tile')
    );
    const $gallery: JQuery<HTMLElement> = $tile.find($('.cs-tile-gallery'));

    if ($gallery.length && !$dailyDeal.length) {
        $tile.one('mouseenter', () => {
            new TileGallery($gallery);
        });
    }
});
