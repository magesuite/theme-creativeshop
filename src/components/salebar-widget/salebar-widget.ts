import * as $ from 'jquery';
import 'mage/translate';

interface SalebarWidgetOptions {
    timerDate?: number;
    relatedElementsSelectors?: string;
    fixedElementsBreakpoint: string;
    countdownPlaceholderClass?: string;
    countdownLabelTranslations: {
        day?: string;
        days?: string;
        hour?: string;
        hours?: string;
        minute?: string;
        minutes?: string;
        second?: string;
        seconds?: string;
    };
}

export default class SalebarWidget {
    protected _$element?: JQuery;
    protected _options: SalebarWidgetOptions;
    protected _$window: JQuery<Window> = $(window);
    protected _timezoneOffset: number;
    protected _cachedElementHeight: number;
    protected _timerInterval: NodeJS.Timeout;

    /**
     * Array elements which rely on salebar height
     * and their default computed top position.
     * Important when there are fixed elements to be handled.
     */
    protected _relatedElements: {
        $element: JQuery<HTMLElement>;
        computedTopProperty: number;
    }[] = [];

    public constructor($element?: JQuery<HTMLElement>, options?: object) {
        this._$element = $element;
        this._options = $.extend(
            {
                /**
                 * String of comma separated query selectors,
                 * for the elements which require top position adjustments
                 * when they're fixed or sticky
                 */
                relatedElementsSelectors: '',
                /**
                 * Breakpoint, below which elements specified in
                 * relatedElementsSelectors become sticky
                 */
                fixedElementsBreakpoint: '1024',
                countdownLabelTranslations: {
                    day: $.mage.__('Day'),
                    days: $.mage.__('Days'),
                    hour: $.mage.__('Hour'),
                    hours: $.mage.__('Hours'),
                    minute: $.mage.__('Min'),
                    minutes: $.mage.__('Min'),
                    second: $.mage.__('Sec'),
                    seconds: $.mage.__('Sec'),
                },
                countdownPlaceholderClass: 'cs-salebar-widget__countdown',
                timerDate: 0,
            },
            options
        );

        if (this._options.relatedElementsSelectors.length) {
            this._relatedElements = this._options.relatedElementsSelectors
                .split(',')
                .reduce((result, element) => {
                    const $element = $(element).first();
                    if ($element.length) {
                        result.push({
                            $element,
                            computedTopProperty: parseInt(
                                window.getComputedStyle($(element).get(0)).top,
                                10
                            ),
                        });
                    } else {
                        // tslint:disable-next-line
                        console.warn(`Salebar: related ${element} not found`);
                    }
                    return result;
                }, []);

            this._$window.on(
                'resize orientationchange salebarLoaded breakpointChange',
                e => this._resizeHandler(e)
            );
        }

        if (this._options.timerDate > 0) {
            this._timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
            this._initTimer();
        }

        this._$window.trigger('salebarLoaded');
    }

    protected _resizeHandler(event): void {
        if (
            breakpoint.current >
                parseInt(this._options.fixedElementsBreakpoint, 10) ||
            !this._cachedElementHeight ||
            this._cachedElementHeight !== this._$element.outerHeight() ||
            event.type === 'breakpointChange'
        ) {
            this._cachedElementHeight = this._$element.outerHeight();
            this._adjustRelatedElementsOffset();
        }
    }

    /**
     * Adjust related fixed elements, which rely on current salebar height
     * by updating their top position based on their default computed value
     * and salebar height
     */
    protected _adjustRelatedElementsOffset(): void {
        this._relatedElements.forEach(relatedElem => {
            relatedElem.$element.css({ top: '' });

            // Double check if elements are fixed
            if (relatedElem.$element.css('position') === 'fixed') {
                relatedElem.$element.css({
                    top:
                        relatedElem.computedTopProperty +
                        this._cachedElementHeight,
                });
            }
        });
    }

    /**
     * Initalize timer
     */
    protected _initTimer(): void {
        this._renderTimer();
        this._$element.addClass('cs-salebar-widget--loaded');
        this._timerInterval = setInterval(this._renderTimer.bind(this), 1000);
    }

    /**
     * Render updated timer
     */
    protected _renderTimer(): void {
        const timeRemaining: any = this._getRemainingTime();

        if (timeRemaining.total < 0) {
            clearInterval(this._timerInterval);
            this._$element.addClass('cs-salebar-widget--finished');
            return;
        }

        const timeValue: any = `${timeRemaining.days} ${this._setCountdownLabel(
            timeRemaining.days,
            'day'
        )} ${timeRemaining.hours} ${this._setCountdownLabel(
            timeRemaining.hours,
            'hour'
        )} ${timeRemaining.minutes} ${this._setCountdownLabel(
            timeRemaining.minutes,
            'minute'
        )} ${timeRemaining.seconds} ${this._setCountdownLabel(
            timeRemaining.seconds,
            'second'
        )}`;

        $(`.${this._options.countdownPlaceholderClass}`).text(timeValue);
    }

    /**
     * Count & return remaining countdown time
     * @return {object} - total time, days, hours, minutes and seconds values
     */
    protected _getRemainingTime(): object {
        const timeRemaining: number =
            this._options.timerDate - this._getCurrentTime();

        return {
            total: timeRemaining,
            days: Math.floor(timeRemaining / (60 * 60 * 24)),
            hours: Math.floor((timeRemaining / (60 * 60)) % 24),
            minutes: Math.floor((timeRemaining / 60) % 60),
            seconds: Math.floor(timeRemaining % 60),
        };
    }

    /**
     * Return current time, considering the time zones
     * @return {number} - current time value in seconds
     */
    protected _getCurrentTime(): number {
        return Math.floor((Date.now() - this._timezoneOffset) / 1000);
    }

    /**
     * Set proper time labels, depends if value is singular or plural
     * @param value {number} - number
     * @param timeUnit {string} - unit of time
     * @return {string} - singular or plural label value
     */
    protected _setCountdownLabel(value: number, timeUnit: string): string {
        return value === 1
            ? this._options.countdownLabelTranslations[timeUnit]
            : this._options.countdownLabelTranslations[timeUnit + 's'];
    }
}
