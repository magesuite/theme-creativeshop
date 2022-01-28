/**
 * component options interface.
 */
export default interface ISliderNavigation {
    /**
     * Elemnent for which navigation should be rendered
     * @required (should be always delivered by parent component)
     */
    rootComponentNode?: HTMLElement;
    /**
     * Selector of the scrollable element
     * @default '.cs-image-teaser__slides'
     */
    scrollableElementSelector?: string;
    /**
     * Selector of the single slide item
     * @default '.cs-image-teaser__slide'
     */
    slideSelector?: string;
    /**
     * Defines how many slides should be scrolled after single click of navigation item.
     * This will come from parent component
     * @optional
     * @default 1
     */
    itemsPerView?: number;
    /**
     * Informs component about overall items count in slider
     * @required (should be always delivered by parent component)
     */
    collectionSize?: number;
    /**
     * Selector of clickable "go to previous slide/group of slides" element
     * @optional
     * @default '.cs-slider-navigation__trigger--prev'
     */
    prevButtonSelector?: string;
    /**
     * Selector of clickable "go to next slide/group of slides" element
     * @optional
     * @default '.cs-slider-navigation__trigger--next'
     */
    nextButtonSelector?: string;
    /**
     * Tells if whole screen should be used when sliding to next/prev slide. Needed for calculation
     * @optional
     * @default false
     */
    useWholeScreen?: boolean;
}
