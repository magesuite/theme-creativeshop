/**
 * Teaser component handling carousels/sliders.
 * Using http://idangero.us/swiper/ library.
 */

import * as $ from 'jquery';
import * as Swiper from 'Swiper';

/**
 * Creates new teaser object on given element with provided settings.
 * @param  {jQuery} $element jQuery element that contains complete outline for teaser.
 * Provided element should contain ".{teaserName}__wrapper" element.
 * @param  {Object} settings Custom settings that will be passed along to Swiper.
 * @return {Object} New teaser object instance.
 */
const csTeaser: any = function($element: any, settings: any): void {
    /**
     * Required variables initialization.
     */
    settings = settings || {};
    const teaser: any = this;
    const teaserName: string = settings.teaserName
        ? settings.teaserName
        : 'cs-teaser';
    const teaserClass: string = `.${teaserName}`;
    const $teaserWrapper: any = $element.find(`${teaserClass}__wrapper`);
    const paginationName: string = settings.paginationName
        ? settings.paginationName
        : `${teaserName}__pagination`;
    const fractionPaginationSeparator: string = settings.fractionPaginationSeparator
        ? settings.fractionPaginationSeparator
        : '/';
    const scrollbarName: string = settings.scrollbarName
        ? settings.scrollbarName
        : `${teaserName}__scrollbar`;

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
    $element.data(teaserName, this);

    /**
     * Tells if teaser should have dynamic or fixed number of visible slides.
     * By default teaser will adjust number of visible slides according to it's
     * parrent width. You can change this behaviour by specyfying custom settings.slidesPerView
     * value, e.g. when settings.slidesPerView = 1 teaser will always show only one slide.
     * @type {Boolean}
     */
    const dynamicNumOfSlides: any =
        !settings.slidesPerView || settings.slidesPerView === 'auto';

    /**
     * Contains current settings of slider.
     */
    let currentSettings: any;

    /**
     * Default settings for Teaser
     * @type {Object}
     */
    const defaultSettings: any = {
        /**
         * Swiper API options (http://idangero.us/swiper/api/)
         */
        slideClass: `${teaserName}__slide`,
        slideActiveClass: `${teaserName}__slide--active`,
        slideVisibleClass: `${teaserName}__slide--visible`,
        slideDuplicateClass: `${teaserName}__slide--clone`,
        slideNextClass: `${teaserName}__slide--next`,
        slidePrevClass: `${teaserName}__slide--prev`,
        wrapperClass: `${teaserName}__slides`,
        spaceBetween: 20,
        watchSlidesVisibility: true,
        navigation: {
            nextEl: $element.find(`${teaserClass}__nav--next`)[0],
            prevEl: $element.find(`${teaserClass}__nav--prev`)[0],
            disabledClass: `${teaserName}__nav--disabled`,
        },
        pagination: {
            el: $element.find(`.${paginationName}`),
            renderBullet: (index: number, className: string): {} => `
                <li class="${className}">
                    <button class="${paginationName}-button">${index +
                1}</button>
                </li>
            `,
            renderFraction: (
                currentClassName: string,
                totalClassName: string
            ): {} => `
                <span class="${teaserName}__number ${currentClassName}"></span>
                ${fractionPaginationSeparator}
                <span class="${teaserName}__number ${totalClassName}"></span>
            `,
            bulletClass: `${paginationName}-item`,
            bulletActiveClass: `${paginationName}-item--active`,
            currentClass: `${teaserName}__number--current`,
            totalClass: `${teaserName}__number--total`,
            clickable: true,
        },
        scrollbar: {
            el: $element.find(`.${scrollbarName}`),
            dragClass: `${scrollbarName}--drag`,
            hide: true,
        },
        /**
         * Teaser custom default options
         */
        onlyBulletPagination: false,
        slideMinWidth: 200,
        calculateSlides: true,
        maxSlidesPerView: null,
        /**
         * Maximum number of groups that will be still visible as dots.
         * If you want pagination to always be dots you can either don't add
         * .${teaserName}__numbers element in HTML or set this to something big.
         * @type {number}
         */
        paginationBreakpoint: 5,
    };

    currentSettings = $.extend(true, {}, defaultSettings, settings);

    /**
     * Calculates number of slides that should be visible according to teaser's wrapper width.
     * @return {number} Number of slides.
     */
    const calculateSlidesNumber: any = (): number => {
        const slidesNumber: number = Math.floor(
            $teaserWrapper.innerWidth() /
                (currentSettings.slideMinWidth + currentSettings.spaceBetween)
        );

        const maxSlidesAllowed: number = parseInt(
            currentSettings.maxSlidesPerView,
            10
        );

        if (slidesNumber < maxSlidesAllowed) {
            return slidesNumber;
        } else {
            return maxSlidesAllowed;
        }
    };

    if (dynamicNumOfSlides && currentSettings.calculateSlides) {
        currentSettings.slidesPerView = currentSettings.slidesPerGroup = calculateSlidesNumber();
    }

    /**
     * Updates slider sizing by adjusting number of visible slides and pagination.
     */
    const updateSliderSizing: any = (): void => {
        if (
            $element.is(':visible') &&
            dynamicNumOfSlides &&
            currentSettings.calculateSlides
        ) {
            currentSettings.slidesPerView = currentSettings.slidesPerGroup = calculateSlidesNumber();

            swiperInstance.params = $.extend(
                true,
                swiperInstance.params,
                currentSettings
            );
        }
    };

    const postInit = (): void => {
        $element.addClass(`${currentSettings.teaserName}--ready`);

        if (
            (swiperInstance.originalParams.slidesPerView !== 1 ||
                swiperInstance.params.calculateSlides) &&
            !swiperInstance.params.onlyBulletPagination
        ) {
            const totalSlidesNumber: number = swiperInstance.slides.length;
            const totalGroupNumber: number = Math.ceil(
                totalSlidesNumber / swiperInstance.params.slidesPerGroup
            );

            totalGroupNumber > swiperInstance.params.paginationBreakpoint
                ? (swiperInstance.params.pagination.type = 'fraction')
                : (swiperInstance.params.pagination.type = 'bullets');
            swiperInstance.pagination.render();
            swiperInstance.pagination.update();
        }
    };

    swiperInstance = new Swiper(
        $element.find(`${teaserClass}__wrapper`),
        currentSettings
    );

    destroyed = false;
    postInit();
    swiperInstance.update();

    let currentWindowWidth = $(window).width();
    $(window).on(
        'resize',
        (): void => {
            const newWindowWidth = $(window).width();
            if (!destroyed && newWindowWidth !== currentWindowWidth) {
                updateSliderSizing();
                postInit();
                swiperInstance.update();
                currentWindowWidth = newWindowWidth;
            }
        }
    );

    /**
     * Returns Swiper object.
     * @return {Swiper} Swiper object.
     */
    teaser.getSwiper = (): void => {
        return swiperInstance;
    };

    /**
     * Destroyes teaser.
     */
    teaser.destroy = (): void => {
        swiperInstance.destroy();
        destroyed = true;
    };
};

export default csTeaser;
