import * as $ from 'jquery';

import csTeaser from 'components/teaser/teaser';

/**
 * component options interface.
 * Please refer to swiper documentation and our teaser component for more options and callbacks
 */
interface BrandCarouselOptions {
    /**
     * HTML Class of the component
     * @type {string}
     * @default 'cs-brand-carousel'
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
     * @default 30
     */
    spaceBetween?: number;

    /**
     * Maximum width of single slide (in px)
     * @type {number}
     * @default 220
     */
    slideMinWidth?: number;
}

export default class BrandCarousel {
    protected _$element: JQuery;

    /**
     * Creates new ProductsPromo component with optional settings.
     * @param {$element} Optional, element to be initialized as ProductsPromo component
     * @param {options}  Optional settings object.
     */
    public constructor($element?: JQuery, options?: BrandsCarouselOptions) {
        this._options = $.extend(
            {
                teaserName: 'cs-brand-carousel',
                slidesPerView: 'auto',
                spaceBetween: 30,
                slideMinWidth: 220,
                roundLengths: true,
                calculateSlides: false,
                loop: true,
                centeredSlides: true,
                lazyLoading: true,
                lazyLoadingOnTransitionStart: true,
            },
            options
        );

        this._$element = $element || $(`.${this._options.teaserName}`);

        if (this._$element.length) {
            this._items = this._$element.find(
                $(`.${this._options.teaserName}__slide`)
            );
        }

        if (this._options.breakpoints) {
            this._breakpointsArray = Object.keys(this._options.breakpoints);
        }

        if (this._$element.length && this._items.length > 1) {
            let throttler: number;
            const _this: any = this;

            $(window).on('resize', function(): void {
                clearTimeout(throttler);
                throttler = setTimeout(function(): void {
                    _this._init();
                }, 250);
            });

            this._init();
        }
    }

    public getInstance(): any {
        return this._instance;
    }

    protected _getSlidesPerView(): number {
        let next: number = Math.max.apply(null, this._breakpointsArray);
        const wWidth: number = $(window).width();

        if (wWidth >= next) {
            return this._options.slidesPerView;
        } else {
            for (let i: number = 0; i < this._breakpointsArray.length; i++) {
                const currentBreakpoint: number = parseInt(
                    this._breakpointsArray[i],
                    10
                );

                if (currentBreakpoint >= wWidth && currentBreakpoint < next) {
                    next = this._breakpointsArray[i];
                }
            }

            return this._options.breakpoints[next].slidesPerView;
        }
    }

    /**
     * Initializes all $element's with previously defined options
     */
    protected _init(): void {
        if (this._breakpointsArray) {
            if (this._items.length > this._getSlidesPerView()) {
                if (!this._instance) {
                    this._$element.addClass(
                        `${this._options.teaserName}--slider`
                    );
                    this._instance = new csTeaser(
                        this._$element,
                        this._options
                    );
                }
            } else {
                if (this._instance) {
                    this._instance.destroy();
                    this._$element
                        .removeClass(`${this._options.teaserName}--slider`)
                        .find(`.${this._options.teaserName}__slides`)
                        .removeAttr('style')
                        .find(`.${this._options.teaserName}__slide`)
                        .removeAttr('style');
                    this._instance = undefined;
                }
            }
        } else {
            this._$element.addClass(`${this._options.teaserName}--slider`);
            this._instance = new csTeaser(this._$element, this._options);
        }
    }
}
