import * as $ from 'jquery';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

export interface ProductTileOptions {
    /**
     * Class on tile to attach click event
     * @default '.cs-product-tile--clickable'
     */
    tileModifier?: string;
    /**
     * Depends on project, there can be a lot of different links on tile.
     * Point to this element, wchich provide url to product page.
     * @default '.cs-product-tile__thumbnail-link';
     */
    tileLinkElement?: string;
    /**
     * List of elements on which redirect should be ignored
     * @default '.cs-product-tile__addtocart-button, .cs-product-tile__addto'
     */
    ignoredSelectors?: string;
}

export default class ProductTile {
    protected _options: ProductTileOptions;
    protected _$element?: JQuery;

    public constructor(
        $element?: JQuery<HTMLElement>,
        options?: ProductTileOptions
    ) {
        const areSwatchesConfigurable = deepGet(
            viewXml,
            'vars.Magento_Catalog.configurable_tile_swatches.enabled'
        );

        this._$element = $element || $('.cs-product-tile');
        this._options = $.extend(
            {
                tileModifier: '.cs-product-tile--clickable',
                tileLinkElement: '.cs-product-tile__thumbnail-link',
                ignoredSelectors: areSwatchesConfigurable
                    ? '.cs-product-tile__addtocart-button, .cs-product-tile__addto, .cs-product-tile__qty, .cs-product-tile__swatches'
                    : '.cs-product-tile__addtocart-button, .cs-product-tile__addto, .cs-product-tile__qty',
            },
            options
        );

        this._attachEvent();
    }

    protected _attachEvent() {
        let $target: any;

        $(document).on('click', this._options.tileModifier, event => {
            event.stopPropagation();
            $target = $(event.target);

            if ($target.closest('a', this._options.tileModifier).length) {
                return;
            }

            if (!$target.closest(this._options.ignoredSelectors).length) {
                const $productTile = $target.closest(
                    this._options.tileModifier
                );

                window.location = $productTile
                    .find(`${this._options.tileLinkElement}`)
                    .attr('href');
            }
        });
    }
}
