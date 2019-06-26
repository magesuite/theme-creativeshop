import * as $ from 'jquery';

export interface ProductTileOptions {
    /**
     * Class on tile to attach click event
     * @default '.cs-product-tile--clickable'
     */
    tileModifier?: string;
    /**
     * List of elements on which redirect should be ignored
     * @default '.cs-product-tile__swatches, .cs-product-tile__addtocart-button, .cs-product-tile__addto'
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
        this._$element = $element || $('.cs-product-tile');
        this._options = $.extend(
            {
                tileModifier: '.cs-product-tile--clickable',
                ignoredSelectors:
                    '.cs-product-tile__swatches, .cs-product-tile__addtocart-button, .cs-product-tile__addto',
            },
            options
        );

        this._attachEvent();
    }

    protected _attachEvent() {
        let $target: any;

        $(document).on('click', this._options.tileModifier, event => {
            $target = $(event.target);

            if (!$target.closest(this._options.ignoredSelectors).length) {
                const $productTile = $target.closest(
                    this._options.tileModifier
                );
                window.location = $productTile.find('a').attr('href');
            }
        });
    }
}
