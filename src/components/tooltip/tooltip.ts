import * as $ from 'jquery';
import breakpoint from 'utils/breakpoint/breakpoint';

/**
 * Component options interface
 */
interface TooltipOptions {
    /**
     * Class of the single tooltip element
     * @default 'cs-tooltip'
     * @type {string}
     */
    tooltipClass?: string;

    /**
     * Trigger class of the tooltip
     * @default 'cs-tooltip__trigger'
     * @type {string}
     */
    triggerClass?: string;

    /**
     * Content class of the tooltip
     * @default 'cs-tooltip__content'
     * @type {string}
     */
    contentClass?: string;

    /**
     * Modal will be displayed instead of standard tooltip if window width is less than given value
     * @default 1023
     * @type {number}
     */
    maxModalBreakpoint?: number;

    /**
     * Classname of overlay (will be displayed on mobiles if mobileScenario is set to 'modal')
     * @default 'cs-tooltip__overlay'
     * @type {string}
     */
    overlayClass?: string;
}

export default class Tooltip {
    protected options?: TooltipOptions;
    protected _$trigger: JQuery;
    protected _$content: JQuery;
    protected _$overlay: JQuery;
    protected _$activeTooltip: JQuery;
    protected _$clone: JQuery;
    protected clickListener?: ($trigger: JQuery) => void;
    protected _errorHandler?: () => void;
    protected _options: TooltipOptions;

    /**
     * Creates new Tooltip component with optional settings.
     * @param  {TooltipOptions} options  Optional settings object.
     */
    public constructor(options?: TooltipOptions) {
        this._options = $.extend(
            {},
            {
                tooltipClass: 'cs-tooltip',
                triggerClass: 'cs-tooltip__trigger',
                contentClass: 'cs-tooltip__content',
                overlayClass: 'cs-tooltip__overlay',
                maxModalBreakpoint: breakpoint.laptop,
            },
            options
        );

        this._$clone = undefined;

        this._setEvents();
    }

    protected _getCurrentScenario(): string {
        if (breakpoint.current >= this._options.maxModalBreakpoint) {
            return 'tooltip';
        }

        return 'modal';
    }

    protected _createOverlay(): void {
        if ($(`.${this._options.overlayClass}`).length) {
            this._$overlay = $(`.${this._options.overlayClass}`);
        } else {
            this._$overlay = $(
                `<div class="${this._options.overlayClass}"></div>`
            );
            $('body').append(this._$overlay);
        }
    }

    protected _toggleOverlay(): void {
        if (this._$overlay.length) {
            this._$overlay.toggleClass(
                `${this._options.overlayClass}--visible`
            );
        }
    }

    protected _cloneTooltip($tooltip: any): void {
        const $clone = $tooltip
            .clone()
            .addClass(`${this._options.tooltipClass}--clone`);
        $('body').append($clone);
        $clone
            .find(`.${this._options.contentClass}`)
            .append(
                `<span class="${
                    this._options.tooltipClass
                }__close" aria-label="${$.mage.__('Close tooltip')}"></span>`
            );
        this._$clone = $clone;
    }

    protected _showTooltip($tooltip: any): void {
        if (this._getCurrentScenario() === 'tooltip') {
            $tooltip.addClass(`${this._options.tooltipClass}--active`);
            this._setCloseListener();
            return;
        }

        this._createOverlay();
        this._toggleOverlay();
        this._cloneTooltip($tooltip);
    }

    protected _hideTooltip($target): void {
        if (this._getCurrentScenario() === 'tooltip') {
            $target.removeClass(`${this._options.tooltipClass}--active`);
            this._removeCloseListener();
            return;
        }

        this._toggleOverlay();
        if (this._$clone) {
            this._$clone.remove();
            this._$clone = undefined;
        }
    }

    protected _setEvents(): void {
        const _obj: any = this;

        $(document).on('click', `.${this._options.triggerClass}`, function(
            e
        ): void {
            e.stopPropagation();

            const $target: any = $(this).closest(
                `.${_obj._options.tooltipClass}`
            );

            if (!$target.length) {
                return;
            }

            const isClickedActive: boolean = $target.hasClass(
                `${_obj._options.tooltipClass}--active`
            );

            if (isClickedActive) {
                if (_obj._getCurrentScenario() === 'tooltip') {
                    _obj._hideTooltip($target);
                } else if (!_obj._$clone) {
                    _obj._showTooltip($target);
                }
            } else {
                _obj._showTooltip($target);
            }
        });

        $(document).on(
            'click',
            `.${this._options.overlayClass}, .${this._options.tooltipClass}__close`,
            function(): void {
                if (_obj._$clone) {
                    _obj._hideTooltip(_obj._$clone);
                }
            }
        );
    }

    protected _setCloseListener(): void {
        const _obj: any = this;

        $(document).on('click.hideTooltip', function(e: Event): void {
            if (
                !$(e.target).hasClass(`${_obj._options.tooltipClass}`) &&
                !$(e.target).parents(`.${_obj._options.tooltipClass}`).length
            ) {
                const $target = $(`.${_obj._options.tooltipClass}--active`);
                if (_obj._getCurrentScenario() === 'tooltip') {
                    _obj._hideTooltip($target);
                }
            }
        });
    }

    protected _removeCloseListener(): void {
        $(document).off('.hideTooltip');
    }
}
