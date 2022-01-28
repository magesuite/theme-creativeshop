/**
 * component options interface.
 */
export default interface ISliderAutorotate {
    /**
     * Instance of the navigation of the root component instance
     * @required (should be always delivered by parent component)
     */
    navInstance?: any;
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
     * Node for which a mouseover/mouseleave events should be fired on.
     * Those events will toggle autorotation pause/resume.
     * @required (should be always delivered by parent component)
     */
    pauseNode?: HTMLElement;
    /**
     * Autorotate delay
     */
    delay?: number;
}
