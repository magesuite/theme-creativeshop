import * as $ from 'jquery';

interface IPageScrollSettings {
    /**
     * Defines selector of component
     * @default {'.cs-page-scroll'}
     * @type {String}
     */
    componentSelector?: string;

    /**
     * Defines selector of component's button
     * @default {'.cs-page-scroll__button'}
     * @type {String}
     */
    buttonSelector?: string;

    /**
     * Defines selector of element which observe. It's trigger show / hide function
     * @default {'body'}
     * @type {String}
     */
    observeElementSelector?: string;

    /**
     * Defines event type for scroll action to begin
     * Supported options: click
     * @default {'click'}
     * @type {String}
     */
    actionEvent?: string;

    /**
     * Defines `top` value for scrollTo method
     * @default {0}
     * @type {number}
     */
    scrollTopPos?: number;

    /**
     * Defines `behavior` value for scrollTo method
     * @default {'smooth'}
     * @type {String}
     */
    scrollTopBehavior?: string;

    /**
     * Defines options for IntersectionObserver
     */
    observerOptions?: object;
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
                componentSelector: '.cs-page-scroll',
                buttonSelector: '.cs-page-scroll__button',
                observeElementSelector: 'body',
                actionEvent: 'click',
                scrollTopPos: 0,
                scrollTopBehavior: 'smooth',
                observerOptions: {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.5,
                },
            },
            options
        );

        this._init();
    }

    /**
     * Initiates component.
     */
    protected _init(): void {
        this._$component = $(this._options.componentSelector);
        this._$button = $(this._options.buttonSelector);

        if (!('IntersectionObserver' in window) || !this._$component) {
            return;
        }

        if (this._$component && this._$button) {
            this._setObserver();
            this._setEvent();
        }
    }

    /**
     * Set & enable observer
     */
    protected _setObserver(): void {
        this._observer = new IntersectionObserver(e => {
            !e[0].isIntersecting ? this._showButton() : this._hideButton();
        }, this._options.observerOptions);

        this._observer.observe(
            document.querySelector(this._options.observeElementSelector)
        );
    }

    /**
     * Show button.
     * Shows button by adding component button class with `--visible` modifier
     */
    protected _showButton(): void {
        this._$button.addClass('visible');
    }

    /**
     * Hide button.
     * Hides button by removing component button class with `--visible` modifier
     */
    protected _hideButton(): void {
        this._$button.removeClass('visible');
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
     * Monitors `this._options.actionEvent` event on button and invoke scrollToTop
     */
    protected _setEvent(): void {
        this._$button.on(this._options.actionEvent, (e: JQuery.Event): void =>
            this._scrollToTop(e)
        );
    }
}
