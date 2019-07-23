import * as $ from 'jquery';

interface IPageScrollSettings {
    /**
     * Defines class of component
     * @default {cs-page-scroll}
     * @type {String}
     */
    componentClass?: string;

    /**
     * Defines class for component by which
     * component is initially hidden
     * Class itself is set in XML config.
     * @default {cs-visually-hidden}
     * @type {String}
     */
    componentHiddenClass?: string;

    /**
     * Defines class of component's button
     * @default {cs-page-scroll__button}
     * @type {String}
     */
    componentButtonClass?: string;

    /**
     * Defines event type for scroll action to begin
     * Supported options: click
     * @default {click}
     * @type {String}
     */
    actionEvent?: string;

    /**
     * Defines the target element to scroll to
     * @default {'.cs-topbar'}
     * @type {String}
     */
    targetElementSelector?: string;

    /**
     * Defines the target element top offset
     * @default {0}
     * @type {number}
     */
    targetElementOffset?: number;

    /**
     * Defines the duration of scrolling to the top of the page
     * @default {500}
     * @type {number}
     */
    scrollingDuration?: number;
}

/**
 * PageScroll scrolls the page to the top.
 * Component will be rendered in footer and has been excluded from cart and checkout.
 * By default component has been added to `category.ts` entry point only
 * and it will remain hidden on other pages until proper entry point is set.
 */
export default class PageScroll {
    private _$component: JQuery<HTMLElement>;
    private _$button: JQuery<HTMLElement>;
    private _$target: JQuery<HTMLElement>;
    private _$window: JQuery<Window>;
    private _$isButtonVisible: boolean;
    private _options?: IPageScrollSettings;

    /**
     * Creates and initiates new PageScroll component with given settings.
     * @param  {IPageScrollSettings} options Optional component settings.
     */
    public constructor(options?: IPageScrollSettings) {
        this._options = $.extend(
            true,
            {},
            {
                componentClass: 'cs-page-scroll',
                componentHiddenClass: 'cs-visually-hidden',
                componentButtonClass: 'cs-page-scroll__button',
                actionEvent: 'click',
                targetElementSelector: '.cs-topbar',
                targetElementOffset: 0,
                scrollingDuration: 500,
            },
            options
        );

        this._$component = null;
        this._$button = null;
        this._$target = null;
        this._$isButtonVisible = false;
        this._$window = $(window);

        this._init();
    }

    /**
     * Monitors `scroll` event on document.
     * The goal is to show button as soon as user starts scrolling.
     */
    protected _bindScrollEvent(): void {
        $(document).on('scroll', (): void => this._setButtonVisibility());
    }

    /**
     * Checks if given element is in viewport
     * @param $el {JQuery<HTMLElement>} element to be checked
     * @return {boolean} is in current viewport
     */
    protected _isElementInViewport($el: JQuery<HTMLElement>): boolean {
        const $window: JQuery<Window> = this._$window;
        const elementTop: number = $el.offset().top;
        const viewportTop: number = $window.scrollTop();

        return (
            elementTop + $el.outerHeight() > viewportTop &&
            elementTop < viewportTop + $window.height()
        );
    }

    /**
     * Sets scroll button visibility
     */
    protected _setButtonVisibility(): void {
        if (!this._isElementInViewport(this._$target)) {
            if (!this._$isButtonVisible) {
                this._showButton();
            }
        } else {
            if (this._$isButtonVisible) {
                this._hideButton();
            }
        }
    }

    /**
     * Show button.
     * Shows button by adding component button class with `--visible` modifier
     */
    protected _showButton(): void {
        this._$isButtonVisible = true;
        const $button: JQuery<HTMLElement> = this._$button;

        $button.addClass(`${this._options.componentButtonClass}--visible`);
    }

    /**
     * Hide button.
     * Hides button by removing component button class with `--visible` modifier
     */
    protected _hideButton(): void {
        this._$isButtonVisible = false;
        const $button: JQuery<HTMLElement> = this._$button;

        $button.removeClass(`${this._options.componentButtonClass}--visible`);
    }

    /**
     * Scrolls page up using animate.
     * @param e {Event} - event emitted by `this._options.actionEvent`
     */
    protected _scrollPage(e: JQuery.Event): void {
        e.preventDefault();

        $('html, body').animate(
            {
                scrollTop:
                    this._$target.offset().top -
                    this._options.targetElementOffset,
            },
            this._options.scrollingDuration
        );
    }

    /**
     * Monitors `click` event on button.
     */
    protected _setEvent(): void {
        this._$button.on(
            this._options.actionEvent,
            (e: JQuery.Event): void => this._scrollPage(e)
        );
    }

    /**
     * Initiates component.
     */
    protected _init(): void {
        this._$component = $(`.${this._options.componentClass}`);
        this._$target = $(this._options.targetElementSelector);

        // Stop execution in case there is no component object
        // or element to scroll
        if (!this._$component.length || !this._$target.length) {
            return;
        }

        this._$component.removeClass(`${this._options.componentHiddenClass}`);
        this._$button = this._$component.find(
            $(`.${this._options.componentButtonClass}`)
        );

        if (this._$button.length) {
            this._bindScrollEvent();
            this._setEvent();
        }
    }
}
