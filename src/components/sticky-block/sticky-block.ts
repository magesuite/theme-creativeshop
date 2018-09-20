import $ from 'jquery';
import Stickyfill from 'Stickyfill';

import breakpoint from 'utils/breakpoint/breakpoint';

/**
 * Navigation component options interface.
 */
interface StickyBlockOptions {
    /**
     * Breakpoint number as a border where above this value stickyBlock will be destroyed
     * @type {number}
     */
    breakpoint?: number;
}

export default class StickyBlock {
    protected _$element: JQuery;

    /**
     * Creates new StickyBlock component with optional settings.
     * @param  {StickyBlockOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: StickyBlockOptions) {
        this._$element = $element || $('.cs-sticky-block');
        this._options = $.extend(this._options, options);
        this._options.breakpoint = this._options.breakpoint || 1024;

        if (Stickyfill && this._$element.length) {
            this._initStickyBlock();
            this._setResizeEvent();
        }
    }

    /**
     * Destroys stickyBlock component's functionality.
     * @param  {string} afterDestroyCssPosition  Optional CSS position after polyfill is destroyed.
     */
    public destroy(afterDestroyCssPosition?: string): void {
        Stickyfill.remove(this._$element[0]);
        this._$element.css('position', afterDestroyCssPosition);
    }

    /**
     * Rebuilds stickyBlock component.
     * Call it after layout changes.
     * Plugin launches it automatically after window resizes or device orientations changes.
     */
    public rebuild(): void {
        Stickyfill.rebuild();
    }

    /**
     * Initializes stickyBlock component's functionality.
     */
    protected _initStickyBlock(): void {
        if (breakpoint.current >= this._options.breakpoint) {
            this._$element.Stickyfill();
        }
    }

    /**
     * Toggles init or destroy based on given breakpoint
     */
    protected _setResizeEvent(): void {
        const _this: any = this;

        $(window).on('resize', function(): void {
            if (
                breakpoint.current >= _this._options.breakpoint &&
                !Stickyfill.stickies.length
            ) {
                _this._$element.Stickyfill();
            } else if (
                breakpoint.current < _this._options.breakpoint &&
                Stickyfill.stickies.length
            ) {
                _this.destroy();
            }
        });
    }
}
