import * as $ from 'jquery';

import csTeaser from 'components/teaser/teaser';

/**
 * component options interface.
 * Please refer to swiper documentation and our teaser component for more options and callbacks
 */
interface ProductsPromoOptions {
    /**
     * HTML Class of the component
     * @type {string}
     * @default 'cs-products-promo'
     */
    teaserName?: string;

    /**
     * Slides per viewport
     * @type {string / number}
     * @default 'auto'
     */
    slidesPerView?: any;

    /**
     * Space between slides (in px)
     * @type {number}
     * @default 16
     */
    spaceBetween?: number;

    /**
     * Maximum slides per viewport (for very large screens and dependable on containers max-width)
     * @type {number}
     * @default 5
     */
    maxSlidesPerView?: number;

    /**
     * Maximum width of single slide (in px)
     * @type {number}
     * @default 220
     */
    slideMinWidth?: number;
}

export default class ProductsPromo {
    protected _$element: JQuery;

    /**
     * Creates new ProductsPromo component with optional settings.
     * @param {$element} Optional, element to be initialized as ProductsPromo component
     * @param {options}  Optional settings object.
     */
    public constructor($element?: JQuery, options?: ProductsPromoOptions) {
        this._options = $.extend(
            {
                teaserName: 'cs-products-promo',
                slidesPerView: 'auto',
                spaceBetween: 16,
                maxSlidesPerView: 4,
                slideMinWidth: 210,
                roundLengths: true,
            },
            options
        );

        this._$element = $element || $(`.${this._options.teaserName}`);

        this._init();
    }

    /**
     * Initializes all $element's with previously defined options
     */
    protected _init(): void {
        const _this: any = this;

        if (this._$element.length) {
            this._$element
                .filter(`:not(.${this._options.teaserName}--grid)`)
                .each(function(): any {
                    return new csTeaser($(this), _this._options);
                });
        }
    }
}
