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
     * Defines the target element to observe to display / hide scroll button
     * @default {'.cs-container--top-bar'}
     * @type {String}
     */
    targetElementSelector?: string;

    /**
     * Defines offset on target element on mobiles / tablet devices
     * @default {0}
     * @type {number}
     */
    targetElementOffsetMobile?: any;

    /**
     * Defines offset on target element on desktop devices
     * @default {0}
     * @type {number}
     */
    targetElementOffsetDesktop?: any;

    /**
     * Defines `top` value for scrollTo method
     * @default {0}
     * @type {number}
     */
    scrollTopPos?: number;

    /**
     * Defines `behavior` value for scrollTo method
     * @default {smooth}
     * @type {String}
     */
    scrollTopBehavior?: string;

    /**
     * Defines breakpoint when change offset value between mobile / desktop
     * @default {laptop}
     * @type {String}
     */
    breakpoint?: number;
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
    private _offset: string;
    private _options?: IPageScrollSettings;
    private _observer?: IntersectionObserver;

    /**
     * Creates and initiates new PageScroll component with given settings.
     * @param {IPageScrollSettings} options Optional component settings.
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
                targetElementSelector: '.cs-container--top-bar',
                targetElementOffsetMobile: '0px',
                targetElementOffsetDesktop: '0px',
                scrollTopPos: 0,
                scrollTopBehavior: 'smooth',
                breakpoint: 'laptop',
            },
            options
        );

        this._init();
    }

    /**
     * Initiates component.
     */
    protected _init(): void {
        if (
            !('IntersectionObserver' in window) ||
            $(`.${this._options.componentClass}`).length <= 0
        ) {
            return;
        }

        this._$component = $(`.${this._options.componentClass}`);
        this._$button = $(`.${this._options.componentButtonClass}`);

        if (this._$button.length) {
            this._$component.removeClass(
                `${this._options.componentHiddenClass}`
            );
            this._offset = this._setOffset(window.breakpoint.current);
            this._setObserver(window.breakpoint.current);
            this._setEvent();
        }

        if (
            this._options.targetElementOffsetMobile !==
            this._options.targetElementOffsetDesktop
        ) {
            this._watch();
        }
    }

    /**
     * Return offset value (targetElementOffsetMobile/targetElementOffsetDesktop) depends on current breakpoint value
     * @param breakpointValue
     * @returns {String}
     */
    protected _setOffset(breakpointValue): string {
        return breakpointValue >= window.breakpoint[this._options.breakpoint]
            ? this._options.targetElementOffsetDesktop
            : this._options.targetElementOffsetMobile;
    }

    /**
     * Set & enable observer
     * @param breakpointValue {Number} breakpoint value
     */
    protected _setObserver(breakpointValue): void {
        const observeOptions = {
            root: null,
            rootMargin: this._setOffset(breakpointValue),
            treshold: 1,
        };

        this._observer = new IntersectionObserver(e => {
            !e[0].isIntersecting ? this._showButton() : this._hideButton();
        }, observeOptions);

        this._observer.observe($(this._options.targetElementSelector)[0]);
    }

    /**
     * Remove observer
     */
    protected _unsetObserver(): void {
        this._observer.unobserve($(this._options.targetElementSelector)[0]);
    }

    /**
     * Reinitialize observer on breakpoint change if targetElementOffsetMobile and targetElementOffsetDesktop options has different value
     */
    protected _watch(): void {
        $(window).on(
            'breakpointChange',
            (e: JQuery.Event, newBreakpoint: number): void => {
                if (
                    this._offset.toLowerCase() !==
                    this._setOffset(newBreakpoint).toLowerCase()
                ) {
                    this._unsetObserver();
                    this._setObserver(newBreakpoint);
                    this._offset = this._setOffset(newBreakpoint);
                }
            }
        );
    }

    /**
     * Show button.
     * Shows button by adding component button class with `--visible` modifier
     */
    protected _showButton(): void {
        this._$button.addClass(
            `${this._options.componentButtonClass}--visible`
        );
    }

    /**
     * Hide button.
     * Hides button by removing component button class with `--visible` modifier
     */
    protected _hideButton(): void {
        this._$button.removeClass(
            `${this._options.componentButtonClass}--visible`
        );
    }

    /**
     * Scrolls page up using scrollTo.
     * @param e {Event} - event emitted by `this._options.actionEvent`
     */
    protected _scrollToTop(e: JQuery.Event): void {
        e.preventDefault();

        const rootElement = document.documentElement;

        rootElement.scrollTo({
            top: this._options.scrollTopPos,
            behavior: this._options.scrollTopBehavior,
        });
    }

    /**
     * Monitors `click` event on button.
     */
    protected _setEvent(): void {
        this._$button.on(this._options.actionEvent, (e: JQuery.Event): void =>
            this._scrollToTop(e)
        );
    }
}
