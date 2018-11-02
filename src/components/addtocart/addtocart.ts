import * as $ from 'jquery';

interface IAddToCartSettings {
    /**
     * Defines Component's class
     * @default {cs-addtocart}
     * @type {String}
     */
    componentClass?: string;

    /**
     * Defines duration of success animation (in ms) so that component can inform CSS that success animation is complete.
     * @default {1000}
     * @type {number}
     */
    successAnimationDuration?: number;

    /**
     * Defines appearance time of "success feedback" on the button before it starts to back to normal state
     * @default {3000}
     * @type {number}
     */
    successVisibilityDuration?: number;

    /**
     * Defines the event which shall be caought by component in order to handle ajax loading customs
     * @default {ajaxAddToCartProcessing}
     * @type {String}
     */
    processingEvent?: string;

    /**
     * Defines the event which shall be caought by component in order to handle ajax finished customs
     * @default {ajax:addToCart}
     * @type {String}
     */
    doneEvent?: any;

    /**
     * Defines custom handler for processing
     * @type {Function}
     */
    onProcessingHandler?: Function;

    /**
     * Defines custom handler for finished
     * @type {Function}
     */
    onDoneHandler?: Function;

    /**
     * Defines if component should animate minicart (make it sticky) after adding product to the cart
     * @default {true}
     * @type {boolean}
     */
    animateMinicart?: boolean;

    /**
     * Defines if there should be animation of increasing qty in minicart flyout even if you chose to have custom onDone handler
     * @default {true}
     * @type {boolean}
     */
    animateMinicartWithCustomDoneHandler?: boolean;

    /**
     * Defines if component should animate badge with product qty in users cart after adding product to the cart.
     * This setting has no effect if `animateMinicart` is set to false.
     * @default {true}
     * @type {boolean}
     */
    animateQtyBadge?: boolean;

    /**
     * Defines minicart css-class
     * @default {'cs-addtocart__minicart'}
     * @type {string}
     */
    minicartClass?: string;

    /**
     * Defines minicart's link css-class
     * @default {'cs-addtocart__minicart-link'}
     * @type {string}
     */
    minicartLinkClass?: string;

    /**
     * Defines minicart's badge css-class
     * @default {'cs-addtocart__minicart-qty-badge'}
     * @type {string}
     */
    minicartQtyBadgeClass?: string;

    /**
     * Defines minicart's qty holder css-class. Content of this element will be replaced with updated qty
     * @default {'cs-addtocart__minicart-qty-text'}
     * @type {string}
     */
    minicartQtyTextClass?: string;

    /**
     * Defines class of the wrapper of cloned qty badge
     * @default {'cs-addtocart__minicart-qty-badge-wrapper'}
     * @type {string}
     */
    clonedQtyBadgeWrapperClass?: string;

    /**
     * Defines the element from which qty-badge animation should start from.
     * Script reads its position and creates qty-badge in this place, then animates it to minicart
     * @default {'.cs-addtocart__button-icon'}
     * @type {string}
     */
    qtyBadgeStartPositionRelationSelector?: string;

    /**
     * Defines selector of minicart dialog element that controls flyout visibility
     * @default {'.block-minicart'}
     * @type {string}
     */
    minicartDialogSelector?: string;
}

/**
 * ItemCloner clones given item on mouseover and places is on top of hovered element in the same place
 * Clone resides on the bottom of the DOM tree and is positioned absolutely with height z-index ( defined in options )
 */
export default class AddToCart {
    private _$source: JQuery<HTMLElement>;
    private _$component: JQuery<HTMLElement>;
    private _animationTimeout: ReturnType<typeof setTimeout>;
    private _visibilityTimeout: ReturnType<typeof setTimeout>;
    private _allDoneTimeout: ReturnType<typeof setTimeout>;
    private _isMinicartSticky: boolean;
    private _options?: IAddToCartSettings;

    /**
     * Creates and initiates new AddToCart component with given settings.
     * @param  {IAddToCartSettings} options Optional component settings.
     */
    public constructor(options?: IAddToCartSettings) {
        this._options = $.extend(
            true,
            {},
            {
                componentClass: 'cs-addtocart',
                successAnimationDuration: 1000,
                successVisibilityDuration: 3000,
                processingEvent: 'ajax:AddToCartProcessing',
                doneEvent: 'ajax:addToCart',
                animateMinicart: true,
                animateMinicartWithCustomDoneHandler: true,
                animateQtyBadge: true,
                minicartClass: 'cs-addtocart__minicart',
                minicartLinkClass: 'cs-addtocart__minicart-link',
                minicartQtyBadgeClass: 'cs-addtocart__minicart-qty-badge',
                minicartQtyTextClass: 'cs-addtocart__minicart-qty-text',
                clonedQtyBadgeWrapperClass:
                    'cs-addtocart__minicart-qty-badge-wrapper',
                qtyBadgeStartPositionRelationSelector:
                    '.cs-addtocart__button-icon',
                minicartDialogSelector: '.block-minicart',
            },
            options
        );

        this._$component = null;
        this._animationTimeout = null;
        this._visibilityTimeout = null;
        this._allDoneTimeout = null;
        this._isMinicartSticky = false;

        this._setEvents();
    }

    /**
      * Fired up when AJAX call is in progress
      *   - Gets the form and assign DOM element as jQuery object to the component scope
      *   - Checks if there's a custom handler passed with component options and initializes it instead of default
      *   - if this._$component exists clears all timeouts used for toggling CSS classes where animations
            are bind to
      * @param e {Event} - event emitted by `this._options.processingEvent`
     **/
    protected _onProcessing(e: JQuery.Event): any {
        this._$component = $('.atc-ajax-processing').parents(
            `.${this._options.componentClass}`
        );

        if (
            this._options.onProcessingHandler &&
            typeof this._options.onProcessingHandler === 'function'
        ) {
            this._options.onProcessingHandler(this, e);
        } else {
            if (this._$component.length) {
                clearTimeout(this._animationTimeout);
                clearTimeout(this._visibilityTimeout);
                clearTimeout(this._allDoneTimeout);
                this._$component.addClass(
                    `${this._options.componentClass}--loading`
                );
            }
        }
    }

    /**
      * Fired up when AJAX call has finished
      *   - Defines `actionFailed` const saying if product wasn't added to the cart because of some error
      *   - Checks if there's a custom handler passed with component options and initializes it instead of default
      *   - Defines `statusModifier` const setting css-class so we know if we should show error or success feedback
      *   - removes `--loading` modifier and adds `--success` instead
      *   - starts `this._startQtyUpdate` method if product was successfully added to the cart
            and `this._options.animateMinicart` is enabled
      *   - adds `--animation-done` modifier (in setTimeout()) so we know when to change easing/animation/transition
      *   - removes all other modifiers except for `--animation-done` that is removed after backward animation
            is finished, assuming that product was successfully added to the cart
      *   - initializes cookie message clearing method assuming that product was successfully added to the cart
      * @param e {JQuery.Event} - event emitted by this._options.processingEvent
      * @param ajaxRes {any} - AJAX call response delivered by Magento's scripts
     **/
    protected _onDone(e: JQuery.Event, ajaxRes: any): void {
        const actionFailed: boolean =
            ajaxRes.response.backUrl || ajaxRes.response.messages;

        if (actionFailed) {
            this._$component.addClass(`${this._options.componentClass}--no-transitions`);
        }

        if (
            this._options.onDoneHandler &&
            typeof this._options.onDoneHandler === 'function'
        ) {
            this._options.onDoneHandler(this, ajaxRes, e);
            if (
                !actionFailed &&
                this._options.animateMinicart &&
                this._options.animateMinicartWithCustomDoneHandler
            ) {
                this._startQtyUpdate(this._$component);
            }
        } else {
            if (this._$component && this._$component.length) {
                const statusModifier: string = actionFailed
                    ? `${this._options.componentClass}--fail`
                    : `${this._options.componentClass}--success`;

                this._$component
                    .removeClass(`${this._options.componentClass}--loading`)
                    .addClass(
                        `${
                            this._options.componentClass
                        }--done ${statusModifier}`
                    );

                if (!actionFailed && this._options.animateMinicart) {
                    this._startQtyUpdate(this._$component);
                }

                this._animationTimeout = setTimeout((): void => {
                    this._$component.addClass(
                        `${this._options.componentClass}--animation-done`
                    );
                }, this._options.successAnimationDuration);

                if (!actionFailed) {
                    this._visibilityTimeout = setTimeout((): void => {
                        this._$component.removeClass(
                            `${
                                this._options.componentClass
                            }--done ${statusModifier}`
                        );
                    }, this._options.successVisibilityDuration);

                    this._allDoneTimeout = setTimeout((): void => {
                        this._$component.removeClass(
                            `${this._options.componentClass}--animation-done`
                        );
                    }, this._options.successAnimationDuration + this._options.successVisibilityDuration);
                }
            }
        }

        if (!actionFailed) {
            this._clearGlobalMessages();
        }
    }

    /**
      * Reads all mage-messages that are currently added to the $.cookieStorage, removes all success messages
        and saves modified array back to $.cookieStorage.
      * Reason: since we have already success feedback provided by this component we don't want to
        display duplicated "you have successfully added {{ product name }} to the cart" message.
     **/
    protected _clearGlobalMessages(): void {
        const messages: Array<any> = $.cookieStorage.get('mage-messages');

        for (let i: number = 0; i < messages.length; i++) {
            if (messages[i].type && messages[i].type === 'success') {
                messages.splice(i, 1);
            }
        }

        $.cookieStorage.set('mage-messages', messages);
    }

    /**
     * Fetches amount of products (including currently added) that are added to the cart at the moment.
     * @return deferred {JQueryDeferred<any>} resolved promise with number of prodcts in cart
     **/
    protected _getCartData(): any {
        const deferred: JQueryDeferred<any> = jQuery.Deferred();
        requirejs(['Magento_Customer/js/customer-data'], customerData => {
            customerData.get('cart').subscribe(
                (data: any): void => {
                    deferred.resolve(data['summary_count']);
                }
            );
        });
        return deferred;
    }

    /**
      * Initializes animation of moving badge and optionally fly-out of sticky minicart after getting
        information  from `this._getCartData` method about amount of products that are in cart
        of the user currently.
      * @param $component {JQuery<HTMLElement>} `cs-addtocart` component instance.
        (parent of button that just sent AJAX requst)
     **/
    protected _startQtyUpdate($component: JQuery<HTMLElement>): void {
        this._getCartData().then(newQty => {
            if (!isNaN(newQty) && $(`.${this._options.minicartClass}`).length) {
                this._animateMinicart('down');

                if (this._options.animateQtyBadge) {
                    this._insertQtyBadge(newQty, $component);
                }
            }
        });
    }

    /**
     * Checks if given element is in viewport
     * @param $el {JQuery<HTMLElement>} element to be checked
     * @return {boolean} is in current viewport
     **/
    protected _isElementInViewport($el: JQuery<HTMLElement>): boolean {
        const $window: JQuery<Window> = $(window);
        const elementTop: number = $el.offset().top;
        const viewportTop: number = $window.scrollTop();

        return (
            elementTop + $el.outerHeight() > viewportTop &&
            elementTop < viewportTop + $window.height()
        );
    }

    /**
      * Animates "stickness" of minicart. If enabled by option (and is out of viewport).
      *   - Defines $minicart (a wrapper of it)
      *   - Defines $minicartLink (:visible <a> element <<there are 2, 1 dedicated for mobile+tablet,
            2nd for desktop>>)
      *   - Defines minicart flyout wrapper to get information about its status
      *   - Closes minicart flyout if possible
      *   - Adds/removes (depending on `direction`) necessary CSS and CSS-Classes to minicart elements to
            animate them in or out
      * @param direction {string} - 'up'/'down' to define if it should show & stick minicart or unstick & hide it
     **/
    protected _animateMinicart(direction: string): void {
        const $minicart: JQuery<HTMLElement> = $(
            `.${this._options.minicartClass}`
        );
        const $minicartLink: JQuery<HTMLElement> = $(
            `.${this._options.minicartLinkClass}:visible`
        );
        const $minicartDialog: JQuery<HTMLElement> = $(
            `${this._options.minicartDialogSelector}`
        );

        if ($minicartDialog.length) {
            const mageDropdownDialog: any = $minicartDialog.data(
                'mageDropdownDialog'
            );

            if (typeof mageDropdownDialog !== 'undefined') {
                mageDropdownDialog.close();
            }
        }

        if (!this._isMinicartSticky && direction === 'down') {
            if (!this._isElementInViewport($minicart)) {
                $minicartLink.css('width', $minicart.outerWidth());
                $minicart.addClass(`${this._options.minicartClass}--sticky`);
                this._isMinicartSticky = true;
            } else {
                this._isMinicartSticky = false;
            }
        } else if (this._isMinicartSticky && direction === 'up') {
            $minicart.one(
                'animationend',
                (): void => {
                    $minicartLink.css('width', '');
                    $minicart
                        .css('position', '')
                        .removeClass(`${this._options.minicartClass}--unstick`);
                    this._isMinicartSticky = false;
                }
            );
            $minicart.css('position', 'fixed');
            $minicart
                .removeClass(`${this._options.minicartClass}--sticky`)
                .addClass(`${this._options.minicartClass}--unstick`);
        }
    }

    /**
      * Inserts (cloned from original) Qty Badge along with custom wrapper to the DOM
      *   - Defines `$clonedBadge`, removes it, creates wrapper from scratch and reassignes to $clonedBadge.
            This method is better than clearing already duplicated badge from classes/styles set by scripts
            in case another product is added to the cart without refresing page after previous action
      *   - Defines `$startingRelation` - JQuery DOM element of which position should cloned badge appear
      *   - Clones original Qty Badge from minicart, replaces text content (with new quantity),
            puts inside newly created wrapper, sets CSS to position cloned badge wrapper according to
            position of the `$startingRelation` element.
      *   - Initializes animation of moving (cloned) badge to the minicart (`this._moveBadgeToStickyCart`)
      * @param direction {string} - 'up'/'down' to define if it should show & stick minicart or unstick & hide it
     **/
    protected _insertQtyBadge(
        newQty: number,
        $component: JQuery<HTMLElement>
    ): any {
        let $clonedBadge: JQuery<HTMLElement> = $(
            `.${this._options.clonedQtyBadgeWrapperClass}`
        );

        if ($clonedBadge.length) {
            $clonedBadge.remove();
        }

        $('body').append(
            `<div class="${this._options.clonedQtyBadgeWrapperClass}"></div>`
        );
        $clonedBadge = $(`.${this._options.clonedQtyBadgeWrapperClass}`);

        const $link: JQuery<HTMLElement> = $(
            `.${this._options.minicartLinkClass}:visible`
        );
        const $badge: JQuery<HTMLElement> = $link.find(
            `.${this._options.minicartQtyBadgeClass}`
        );
        const $startingRelation: JQuery<HTMLElement> = $component.find(
            this._options.qtyBadgeStartPositionRelationSelector
        );

        if (
            !$clonedBadge.length ||
            !$link.length ||
            !$badge.length ||
            !$startingRelation.length
        ) {
            return;
        }

        const startingPosition: any = $startingRelation[0].getBoundingClientRect();
        const $clone: JQuery<HTMLElement> = $badge.clone();
        const $clonedQtyHolder: JQuery<HTMLElement> = $clone.find(
            `.${this._options.minicartQtyTextClass}`
        );

        $clonedQtyHolder.html(`${newQty}`);
        $clonedBadge.append($clone).css({
            top: `${Math.round(parseInt(startingPosition.top))}px`,
            left: `${Math.round(parseInt(startingPosition.left))}px`,
        });

        this._moveBadgeToStickyCart($clonedBadge, $badge);
    }

    /**
      * Animates cloned qty badge from button to the cart. animation of `top` property is based on hardcoded
        CSS setting. Everybody should know `top` position of minciart for all resolution, event if sometimes it's
        sticky and sometimes not.
      *   - sets `transitionend` event to initialize `this._bindScrollEvent` method right after cloned badge
            transition is finished
      *   - if minicart is sticky badge gets additional class to set its CSS `position` prop to `fixed`
      *   - Cloned badge gets `--animating` modifier to start transition and gets `left` cord of
            original badge. `top` is reseted to be read from CSS file
      * @param $clonedBadge {JQuery<HTMLElement>} - cloned qty badge
      * @param $target {JQuery<HTMLElement>} - orignal badge so we can get its x-cord
     **/
    protected _moveBadgeToStickyCart(
        $clonedBadge: JQuery<HTMLElement>,
        $target: JQuery<HTMLElement>
    ): void {
        const cartBadgeRect: any = $target[0].getBoundingClientRect();

        $clonedBadge.one('transitionend', (): void => this._bindScrollEvent());

        if (this._isMinicartSticky) {
            $clonedBadge.addClass(
                `${this._options.clonedQtyBadgeWrapperClass}--minicart-sticky`
            );
        }

        $clonedBadge
            .addClass(`${this._options.clonedQtyBadgeWrapperClass}--animating`)
            .css({
                top: '',
                left: `${Math.round(parseInt(cartBadgeRect.left))}px`,
            });
    }

    /**
      * As soon as cloned badge finishes transitioning we start monitoring `scroll` event on document.
        The goal is to hide minicart as soon as user starts scrolling. `this._animateMinicart` method is
        executed only once and then event is being utilized.
     **/
    protected _bindScrollEvent(): void {
        $(document).one('scroll', (): void => this._animateMinicart('up'));
    }

    /**
     * Starts monitoring for AJAX actions provided by Magento's catalog-add-to-cart.js
     **/
    protected _setEvents(): void {
        $('body').on(
            this._options.processingEvent,
            (e: JQuery.Event): void => this._onProcessing(e)
        );
        $(document).on(
            this._options.doneEvent,
            (e: JQuery.Event, ajaxRes: any): void => this._onDone(e, ajaxRes)
        );
    }
}
