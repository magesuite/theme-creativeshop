import * as $ from 'jquery';
import Swiper from 'Swiper';

/*
* Product teaser
*/
/**
 * Creates new teaser object on given element with provided settings.
 * @param  {jQuery} $element jQuery element that contains complete outline for teaser.
 * Provided element should contain ".{teaserName}__wrapper" element.
 * @param  {Object} settings Custom settings that will be passed along to Swiper.
 * @return {Object} New teaser object instance.
 */
const csTeaser: any = function( $element: any, settings: any ): void {
    /**
     * Required variables initialization.
     */
    settings = settings || {};
    const teaser: any = this;
    const teaserName: string = settings.teaserName ? settings.teaserName : 'cs-teaser';
    const teaserClass: string = `.${teaserName}`;
    const $teaserWrapper: any = $element.find( `${teaserClass}__wrapper` );
    const paginationName: string = settings.paginationName ? settings.paginationName : `${teaserName}__pagination`;
    const fractionPaginationSeparator: string = settings.fractionPaginationSeparator ? settings.fractionPaginationSeparator : '/';
    /**
     * Holds current Swiper instance.
     */
    let swiperInstance: any;

    /**
     * Tells if swiper was destroyed.
     */
    let destroyed: any;

    /**
     * Attaches component to HTML element.
     */
    $element.data( teaserName, this );

    /**
     * Tells if teaser should have dynamic or fixed number of visible slides.
     * By default teaser will adjust number of visible slides according to it's
     * parrent width. You can change this behaviour by specyfying custom settings.slidesPerView
     * value, e.g. when settings.slidesPerView = 1 teaser will always show only one slide.
     * @type {Boolean}
     */
    let dynamicNumOfSlides: any = !settings.slidesPerView || settings.slidesPerView === 'auto';

    /**
     * Contains current settings of slider.
     */
    let currentSettings: any;
    /**
     * Default settings for Swiper.
     * @type {Object}
     */
    const defaultSettings: any = {
        slideClass: `${teaserName}__slide`,
        slideActiveClass: `${teaserName}__slide--active`,
        slideVisibleClass: `${teaserName}__slide--visible`,
        slideDuplicateClass: `${teaserName}__slide--clone`,
        slideNextClass: `${teaserName}__slide--next`,
        slidePrevClass: `${teaserName}__slide--prev`,
        wrapperClass: `${teaserName}__slides`,
        nextButton: $element.find( `${teaserClass}__nav--next` )[ 0 ],
        prevButton: $element.find( `${teaserClass}__nav--prev` )[ 0 ],
        buttonDisabledClass: `${teaserName}__nav--disabled`,
        pagination: $element.find( `.${paginationName}` ),
        /**
         * Maximum number of groups that will be still visible as dots.
         * If you want pagination to always be dots you can either don't add
         * .${teaserName}__numbers element in HTML or set this to something big.
         * @type {number}
         */
        paginationBreakpoint: 5,
        onlyBulletPagination: false,
        bulletClass: `${paginationName}-item`,
        bulletActiveClass: `${paginationName}-item--active`,
        paginationCurrentClass: `${teaserName}__number--current`,
        paginationTotalClass: `${teaserName}__number--total`,
        paginationClickable: true,
        spaceBetween: 20,   // Gap between slides.
        slideMinWidth: 200,  // Minimum width of a slider.
        calculateSlides: true,
        maxSlidesPerView: null,
        watchSlidesVisibility: true,
        paginationBulletRender( swiper: any, index: number, className: string ): Object {
            return `<li class="${className}">
                <button class="${paginationName}-button">${( index + 1 )}</button></li>`;
        },
        paginationFractionRender( swiper: any, currentClassName: string, totalClassName: string ): Object {
            return `<span class="${teaserName}__number ${currentClassName}"></span> ${fractionPaginationSeparator} <span class="${teaserName}__number ${totalClassName}"></span>`;
        },
    };

    currentSettings = $.extend( defaultSettings, settings );

    /**
     * Calculates number of slides that should be visible according to teaser's wrapper width.
     * @return {number} Number of slides.
     */
    const calculateSlidesNumber: any = function(): number {
        const slidesNumber: number = Math.floor( $teaserWrapper.innerWidth() / ( currentSettings.slideMinWidth + currentSettings.spaceBetween ) );

        const maxSlidesAllowed: number = parseInt( currentSettings.maxSlidesPerView, 10 );

        if ( slidesNumber < maxSlidesAllowed ) {
            return slidesNumber;
        } else {
            return maxSlidesAllowed;
        }
    };

    if ( dynamicNumOfSlides && currentSettings.calculateSlides ) {
        currentSettings.slidesPerView =
            currentSettings.slidesPerGroup = calculateSlidesNumber();
    }

    /**
     * Updates slider sizing by adjusting number of visible slides and pagination.
     */
    const updateSliderSizing: any = function(): void {
        if ( !$element.is( ':visible' ) ) {
            return null;
        }

        if ( dynamicNumOfSlides && currentSettings.calculateSlides ) {
            currentSettings.slidesPerView =
                currentSettings.slidesPerGroup = calculateSlidesNumber();
        }

        swiperInstance.params = $.extend( swiperInstance.params, currentSettings );
    };

    const postInit: any = function(): void {
        if ( ( swiperInstance.originalParams.slidesPerView !== 1 || swiperInstance.params.calculateSlides ) && !swiperInstance.params.onlyBulletPagination ) {

            const totalSlidesNumber: number = swiperInstance.slides.length;
            const totalGroupNumber: number = Math.ceil( totalSlidesNumber / swiperInstance.params.slidesPerGroup );

            if ( totalGroupNumber > swiperInstance.params.paginationBreakpoint ) {
                swiperInstance.params.paginationType = 'fraction';
            } else {
                swiperInstance.params.paginationType = 'bullets';
            }
        }
    };

    swiperInstance = new Swiper( $element.find( `${teaserClass}__wrapper` ), currentSettings );
    destroyed = false;
    postInit();
    swiperInstance.update();

    $( window ).on( 'resize', function(): void {
        if ( !destroyed ) {
            updateSliderSizing();
            postInit();
            swiperInstance.update();
        }
    } );

    /**
     * Returns Swiper object.
     * @return {Swiper} Swiper object.
     */
    teaser.getSwiper = function(): void {
        return swiperInstance;
    };

    /**
     * Destroyes teaser.
     */
    teaser.destroy = function(): void {
        swiperInstance.destroy();
        destroyed = true;
    };
};

export default csTeaser;
