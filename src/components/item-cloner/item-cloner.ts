/* tslint:disable:no-unused-new object-literal-key-quotes max-classes-per-file */
import $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';

interface IItemClonerTouchSettings {
    /**
     * Turns on/off hover for touch devices
     * @default {true}
     * @type {Boolean}
     */
    enabled?: boolean;
    /**
     * If hover is disabled, show hidden items from the beginning
     * @default false
     * @type {Boolean}
     */
    displayAsStatic?: boolean;
    /**
     * Define class of the $origin that is shown from the beginning
     * Works only if {displayAsStatic} is set to true
     * @default cs-grid-product--static
     * @type {String}
     */
    staticClass?: string;
    /**
     * Defined if animations for touch devices should be available
     * @default false
     * @type {Boolean}
     */
    disableAnimations?: boolean;
}

interface IItemClonerSettings {
    /**
     * Define class of origin element while in hover state
     * @type {String}
     */
    originHoverClass?: string;
    /**
     * Define class of the clone-item.
     * @default cs-item-cloner
     * @type {String}
     */
    clonerClass?: string;
    /**
     * Define class of the clone-item in hover state.
     * @default cs-item-cloner--visible
     * @type {String}
     */
    clonerHoverClass?: string;
    /**
     * Define class of the clone-item's content in hover state.
     * @type {String}
     */
    cloneContentHoverClass?: string;
    /**
     * Define breakpoint above which script should work
     * @type {String}
     */
    breakpoint?: string;
    /**
     * Defined class for $origin if window width is below given breakpoint
     * @type {String}
     */
    belowBreakpointClass?: string;
    /**
     * Define z-index of clone
     * @type {Number}
     */
    cloneZindex?: number;
    /**
     * Defines component behaviour for touch devices
     * @type {Object}
     */

    /**
     * Define delay in miliseconds of hover class added
     * @type {Number}
     * @default {10}
     */
    delay?: number;
    /**
     * Defines component behaviour for touch devices
     * @type {Object}
     */
    touch?: IItemClonerTouchSettings;
    /**
     * On before show callback
     * @default 800
     * @type {any}
     */
    onBeforeShow?: any;
    /**
     * On shown callback
     * @type {any}
     */
    onShown?: any;
    /**
     * On before hide callback
     * @type {any}
     */
    onBeforeHide?: any;
    /**
     * On hidden callback
     * @type {any}
     */
    onHidden?: any;
}

/**
 * ItemCloner clones given item on mouseover and places is on top of hovered element in the same place
 * Clone resides on the bottom of the DOM tree and is positioned absolutely with height z-index ( defined in options )
 */
export default class ItemCloner {
    private settings?: IItemClonerSettings;
    private $origins: JQuery;
    private _animationClassTimeout: any;
    private _isTouch: boolean;
    public isActive: boolean;
    public $wrapper?: JQuery;
    public $origin?: JQuery;
    public $clone?: any;

    /**
     * Creates and initiates new ItemCloner component with given settings.
     * @param  {$origins} jquery object that should be cloned.
     * @param  {IItemClonerSettings} settings Optional component settings.
     */
    public constructor($origins: JQuery, settings?: IItemClonerSettings) {
        if (!$origins.length) {
            return;
        }

        this.settings = $.extend(
            true,
            {},
            {
                clonerClass: 'cs-item-cloner',
                clonerHoverClass: 'cs-item-cloner--visible',
                cloneZindex: 200,
                breakpoint: breakpoint.laptop,
                delay: 10,
                touch: {
                    enabled: true,
                    displayAsStatic: false,
                    staticClass: 'cs-grid-product--static',
                    disableAnimations: false,
                },
            },
            settings
        );

        this._isTouch = 'ontouchstart' in document.documentElement;
        this.$origins = $origins;
        this.isActive = false;
        this.$origin = undefined;
        this.$wrapper = undefined;
        this.$clone = undefined;
        this._animationClassTimeout;
        this._createCloneWrapper();
        this._setEvents();

        if (
            this.settings.belowBreakpointClass &&
            this.settings.belowBreakpointClass !== ''
        ) {
            this._setBelowBreakpointClass();
        }

        if (
            this._isTouch &&
            !this.settings.touch.enabled &&
            this.settings.touch.displayAsStatic
        ) {
            this._setAsStatic();
        }

        if (this._isTouch && this.settings.touch.disableAnimations) {
            this.$origins.addClass('no-transition');
        }
    }

    /**
     * Destroys clone, removes all classes added during cloning, reverts to original state
     */
    public destroy(): void {
        if (this.isActive && this.$wrapper.children().length) {
            if (
                this.settings.onBeforeHide &&
                typeof this.settings.onBeforeHide === 'function'
            ) {
                this.settings.onBeforeHide();
            }

            this.$wrapper
                .html('')
                .removeClass(this.settings.clonerHoverClass)
                .removeAttr('style');
            this.$origins
                .filter(`.${this.settings.originHoverClass}`)
                .removeClass(this.settings.originHoverClass);
            if (this.settings.delay > 0) {
                clearTimeout(this._animationClassTimeout);
            }
            this.isActive = false;
            this.$origin = undefined;
            this.$clone = undefined;

            if (
                this.settings.onHidden &&
                typeof this.settings.onHidden === 'function'
            ) {
                this.settings.onHidden();
            }
        }
    }

    /**
     * Creates wrapper and appends it to the document (before end).
     * Then assigns newly created element to this.$wrapper
     */
    protected _createCloneWrapper(): void {
        if (!$(`.${this.settings.clonerClass}`).length) {
            $('body').append(
                `<div class="${this.settings.clonerClass}"></div>`
            );
        }

        this.$wrapper = $(`.${this.settings.clonerClass}`);
    }

    /**
     * After clone has been created, this method sets it to active
     * @param  {$origin} jquery object that will be cloned.
     */
    protected _setCloneActive(): void {
        this.$clone.addClass(`${this.settings.cloneContentHoverClass}`);
        this.isActive = true;

        if (
            this.settings.onShown &&
            typeof this.settings.onShown === 'function'
        ) {
            this.settings.onShown(this);
        }
    }

    /**
     * Actually clones given element and replaces $wrapper's  HTML with it
     * @param  {$origin} jquery object that will be cloned.
     */
    protected _clone($origin: JQuery): void {
        this.$origin = $origin;

        // Run onBeforeShow callback if defined
        if (
            this.settings.onBeforeShow &&
            typeof this.settings.onBeforeShow === 'function'
        ) {
            this.settings.onBeforeShow();
        }

        // Get data before any action
        const cords: any = $origin.offset();
        const realWidth: number = $origin[0].getBoundingClientRect().width;

        this.$wrapper
            .css({
                top: cords.top - 1,
                left: cords.left - 1,
                zIndex: this.settings.cloneZindex,
                width: realWidth,
            })
            .addClass(this.settings.clonerHoverClass);

        // Clone original element
        this.$clone = $origin.clone(true);

        // Add class to original element
        $origin.addClass(this.settings.originHoverClass);

        // physically replace wrapper's content with $clone
        this.$wrapper.html(this.$clone);

        // Add class to clone after it has been placed in $wrapper
        this.$clone.addClass(`${this.settings.clonerClass}__clone`);

        /* Add another class indicating that cloned element should be in hover state
         * Timeout helps with CSS animations witch didn't run without it.
        */
        if (this.settings.delay > 0) {
            this._animationClassTimeout = setTimeout((): void => {
                this._setCloneActive();
            }, this.settings.delay);
        } else {
            this._setCloneActive();
        }
    }

    /**
     * Setups events
     */
    protected _setEvents(): void {
        let _this: any = this;
        let throttler: any;
        const onEvents: string = this._isTouch ? 'touchstart' : 'mouseenter';
        const offEvents: string = this._isTouch
            ? 'touchend touchcancel'
            : 'mouseleave';

        this.$origins.stop().on(onEvents, function(event: Event): void {
            // Clone only if needed
            if (
                (event.type === 'touchstart' && _this.settings.touch.enabled) ||
                event.type === 'mouseenter'
            ) {
                if (
                    !$(this).hasClass(`${_this.settings.clonerClass}__clone`) &&
                    $(window).width() >= _this.settings.breakpoint &&
                    !document.hidden
                ) {
                    // Emergency destroy
                    if (_this.isActive) {
                        _this.destroy();
                    }
                    _this._clone($(this));
                }
            }
        });

        // Run destroy menthod when mouse leaves the clone
        this.$wrapper.stop().on(offEvents, function(event: Event): void {
            event.stopPropagation();
            _this.destroy();
        });

        // Run destroy menthod when called from outside
        $(document).on('destroyItemClones', function(): void {
            _this.destroy();
        });

        // Run destroy menthod when browser changes focus mode
        document.addEventListener('visibilitychange', function() {
            _this.destroy();
        });

        // On touches destroy when touchstart anywhere in body but not on $wrapper
        if (this.settings.touch.enabled) {
            $(document).on('touchstart', function(event: Event): void {
                if (
                    !$(event.target).hasClass(
                        `${_this.settings.clonerClass}`
                    ) &&
                    !$(event.target).parents(`.${_this.settings.clonerClass}`)
                        .length
                ) {
                    _this.destroy();
                }
            });
        }

        // Resize event to set class for $origins if needed
        if (
            this.settings.belowBreakpointClass &&
            this.settings.belowBreakpointClass !== ''
        ) {
            $(window).on('resize', function(): void {
                clearTimeout(throttler);
                throttler = setTimeout((): void => {
                    _this._setBelowBreakpointClass();
                }, 250);
            });
        }
    }

    /**
     * On touch devices, set this.settings.touch.staticClass *
     * Only if hover is disabled and option to do so is set to true
     */
    protected _setAsStatic(): void {
        if (
            this.settings.touch.staticClass &&
            this.settings.touch.staticClass !== ''
        ) {
            this.$origins.addClass(this.settings.touch.staticClass);
        }
    }

    /**
     * If {this.settings.belowBreakpointClass} is set, add this class
     * Only if window width value is lower than defined breakpoint
     */
    protected _setBelowBreakpointClass(): void {
        if ($(window).width() < this.settings.breakpoint) {
            this.destroy();
            this.$origins.addClass(this.settings.belowBreakpointClass);
        } else {
            this.$origins.removeClass(this.settings.belowBreakpointClass);
        }
    }
}
