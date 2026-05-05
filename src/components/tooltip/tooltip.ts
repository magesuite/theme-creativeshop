import * as $ from 'jquery';

/**
 * Component options interface
 */
export interface TooltipOptions {
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

    /**
     * Close button class of the tooltip
     * @default 'cs-tooltip__close'
     * @type {string}
     */
    closeClass?: string;

    /**
     * Close button accessible label
     * @default $.mage.__('Close tooltip')
     * @type {string}
     */
    closeLabel?: string;
}

export default class Tooltip {
    protected options?: TooltipOptions;
    protected _$trigger: JQuery;
    protected _$content: JQuery;
    protected _$overlay: JQuery;
    protected _$activeTooltip?: JQuery;
    protected _$activeTrigger?: JQuery;
    protected _$clone?: JQuery;
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
                closeClass: 'cs-tooltip__close',
                closeLabel: $.mage.__('Close tooltip'),
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

    protected _cloneTooltip($tooltip: JQuery): void {
        const $clone = $tooltip
            .clone()
            .addClass(`${this._options.tooltipClass}--clone`);

        // Force LazyLoad to process images in cloned
        // content one more time in order to set proper
        // class and attributes
        const llImgs = $clone.find('[data-ll-status]');
        if (llImgs) {
            $(llImgs).each(function (idx) {
                $(this).removeAttr('data-ll-status');
            });
        }

        $('body').append($clone);

        const $cloneContent = $clone
            .find(`.${this._options.contentClass}`)
            .first();
        const contentId = $cloneContent.attr('id');

        if (contentId) {
            $cloneContent.attr('id', `${contentId}-clone`);
        }

        $cloneContent.attr('aria-hidden', 'false');

        if (!$cloneContent.children(`.${this._options.closeClass}`).length) {
            $('<button/>', {
                type: 'button',
                class: this._options.closeClass,
                'aria-label': this._options.closeLabel,
            }).appendTo($cloneContent);
        }

        this._$clone = $clone;
    }

    protected _showTooltip($tooltip: JQuery, $trigger?: JQuery): void {
        this._$activeTooltip = $tooltip;
        this._$activeTrigger = $trigger || this._getTrigger($tooltip);

        if (this._getCurrentScenario() === 'tooltip') {
            this._setTooltipState($tooltip, true);
            $tooltip.addClass(`${this._options.tooltipClass}--active`);
            this._setCloseListener();
            return;
        }

        this._getTrigger($tooltip).attr('aria-expanded', 'true');
        this._createOverlay();
        this._toggleOverlay();
        this._cloneTooltip($tooltip);
        this._focusCloneCloseButton();
    }

    protected _hideTooltip(
        $target: JQuery,
        shouldRestoreFocus: boolean = false
    ): void {
        if (this._getCurrentScenario() === 'tooltip') {
            this._setTooltipState($target, false);
            $target.removeClass(`${this._options.tooltipClass}--active`);
            this._removeCloseListener();
            this._clearActiveTooltip(shouldRestoreFocus);
            return;
        }

        if (this._$activeTooltip) {
            this._setTooltipState(this._$activeTooltip, false);
        }

        this._toggleOverlay();
        if (this._$clone) {
            this._$clone.remove();
            this._$clone = undefined;
        }

        this._clearActiveTooltip(shouldRestoreFocus);
    }

    protected _getTrigger($tooltip: JQuery): JQuery {
        return $tooltip.find(`.${this._options.triggerClass}`).first();
    }

    protected _setTooltipState($tooltip: JQuery, isActive: boolean): void {
        this._getTrigger($tooltip).attr(
            'aria-expanded',
            isActive ? 'true' : 'false'
        );
        $tooltip
            .find(`.${this._options.contentClass}`)
            .first()
            .attr('aria-hidden', isActive ? 'false' : 'true');
    }

    protected _clearActiveTooltip(shouldRestoreFocus: boolean): void {
        if (shouldRestoreFocus && this._$activeTrigger) {
            this._$activeTrigger.trigger('focus');
        }

        this._$activeTooltip = undefined;
        this._$activeTrigger = undefined;
    }

    protected _focusCloneCloseButton(): void {
        if (!this._$clone) {
            return;
        }

        this._$clone
            .find(`.${this._options.closeClass}`)
            .first()
            .trigger('focus');
    }

    protected _isToggleKey(e: JQuery.Event): boolean {
        return e.which === 13 || e.which === 32;
    }

    protected _isEscapeKey(e: JQuery.Event): boolean {
        return e.which === 27;
    }

    protected _toggleTooltip($trigger: JQuery): void {
        const $target: JQuery = $trigger.closest(
            `.${this._options.tooltipClass}`
        );

        if (!$target.length) {
            return;
        }

        const isClickedActive: boolean = $target.hasClass(
            `${this._options.tooltipClass}--active`
        );

        if (isClickedActive) {
            if (this._getCurrentScenario() === 'tooltip') {
                this._hideTooltip($target);
            } else if (!this._$clone) {
                this._showTooltip($target, $trigger);
            }

            return;
        }

        this._showTooltip($target, $trigger);
    }

    protected _hideActiveTooltip(shouldRestoreFocus: boolean = false): void {
        if (this._$clone) {
            this._hideTooltip(this._$clone, shouldRestoreFocus);
            return;
        }

        if (this._$activeTooltip) {
            this._hideTooltip(this._$activeTooltip, shouldRestoreFocus);
        }
    }

    protected _setEvents(): void {
        const _obj: any = this;

        $(document).on(
            'click',
            `.${this._options.triggerClass}`,
            function (e): void {
                e.preventDefault();
                e.stopPropagation();

                _obj._toggleTooltip($(this));
            }
        );

        $(document).on(
            'keydown',
            `.${this._options.triggerClass}, .${this._options.closeClass}`,
            function (e): void {
                if ($(this).is('button') || !_obj._isToggleKey(e)) {
                    return;
                }

                e.preventDefault();
                $(this).trigger('click');
            }
        );

        $(document).on(
            'click',
            `.${this._options.overlayClass}, .${this._options.closeClass}`,
            function (): void {
                if (_obj._$clone) {
                    _obj._hideTooltip(
                        _obj._$clone,
                        $(this).hasClass(_obj._options.closeClass)
                    );
                    return;
                }

                const $target = $(this).closest(
                    `.${_obj._options.tooltipClass}`
                );
                _obj._hideTooltip($target, true);
            }
        );

        $(document).on('keydown', function (e): void {
            if (!_obj._isEscapeKey(e)) {
                return;
            }

            _obj._hideActiveTooltip(true);
        });
    }

    protected _setCloseListener(): void {
        const _obj: any = this;

        $(document).on('click.hideTooltip', function (e: Event): void {
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
