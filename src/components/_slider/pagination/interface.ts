/**
 * component options interface.
 */
export default interface ISliderPagination {
    /**
     * Elemnent for which pagination should be rendered
     * @required (should be always delivered by parent component)
     */
    rootComponentNode?: HTMLElement;
    /**
     * Informs component about overall items count in slider
     * @required (should be always delivered by parent component)
     */
    collectionSize?: number;
    /**
     * Informs component about amount of items per view
     * @required (should be always delivered by parent component)
     */
    itemsPerView?: number;
    /**
     * Minimum amount of bullets to switch to fraction pagination.
     * Fraction Pagination - number based pagination after pattern {current_view}{separator}{overall_slides} (f.e "3/12")
     * @default 10
     */
    fractionBreakpoint?: number;
    /**
     * Template for the fraction pagination, where:
     * "%currentSlide" will be replaced by current view;
     * "%allSlides" will be replaced by amount of all slides available.
     * Examples: '%currentSlide / %allSlides', '%currentSlide of %allSlides', 'slide %currentSlide from %allSlides'
     * @default '<span class="current">%currentSlide</span> / %allSlides'
     */
    fractionTemplate?: string;
    /**
     * Selector of the wrapper of slides (scrollable element)
     * @default '.cs-image-teaser__slides'
     */
    slidesWrapperSelector?: string;
    /**
     * Selector of the single slide item
     * @default '.cs-image-teaser__slide'
     */
    slideSelector?: string;
}
