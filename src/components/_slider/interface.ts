import ISliderNavigation from 'components/_slider/navigation/interface';
import ISliderPagination from 'components/_slider/pagination/interface';
import ISliderAutorotation from 'components/_slider/autorotation/interface';

import deepGet from 'utils/deep-get/deep-get';

/**
 * component options interface.
 */
export default interface ISlider {
    /**
     * Informs component about overall items count in slider
     * @required
     */
    itemsCount: number;
    /**
     * Informs component about amount of items per view
     * @required
     */
    itemsPerView: number;
    /**
     * Decides if pagination sub-module should be used (module is not even fetched if the value is falsy)
     * @default false
     */
    usePagination?: boolean;
    /**
     * Applying slides-per-view config based on given configuration (used in products carousel or brand carousel)
     * @default null
     */
    columnsConfig: typeof deepGet | null;
    /**
     * Object containing navigation settings
     */
    navigationOptions: ISliderNavigation;
    /**
     * Object containing pagination settings
     */
    paginationOptions: ISliderPagination;
    /**
     * Selector of slides wrapper (scrollable element)
     * @default '.cs-image-teaser__slides'
     */
    slidesWrapperSelector: string;
    /**
     * Selector of single slide
     * @default '.cs-image-teaser__slide'
     */
    slideSelector: string;
    /**
     * Defines if autorotate should be enabled for this instance
     * @default false
     */
    useAutorotation?: boolean;
    /**
     * Decides about autorotate (see autorotate interface)
     */
    autorotationOptions: ISliderAutorotation;
    /**
     * Tells if configuration is set to "use_whole_screen"
     */
    useWholeScreen: boolean;
    /**
     * Tells which CC component the instance is (image_teaser, hero_carouel, brand_carousel, products_carousel...)
     */
    componentType: string;
}
