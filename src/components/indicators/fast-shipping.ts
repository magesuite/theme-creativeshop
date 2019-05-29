import * as $ from 'jquery';

/**
 * This component is part of Indicators, but works standalone.
 * Please remember that it supports caching, but logic needs to be provided separately
 */

/**
 * Fast shipping component options interface.
 */
interface FastShippingOptions {
    /**
     * Component's namespace
     * @type {string}
     * @default 'cs-'
     */
    namespace?: string;
    /**
     * Class name of single variant. All are hidden, the correct one will get modifier class
     * @type {string}
     */
    variantClassName?: string;
    /**
     * Selector of timer placeholder, where time should be displayed
     * @type {string}
     */
    timerSelector?: string;
    /**
     * Selector of delivery day placeholder.
     * If delivery is not possible either today nor tomorrow, it will be filled with expected day of delivery
     * @type {string}
     */
    deliveryDaySelector?: string;
    /**
     * Decides if time should be displayed in countdown form or time when option ends
     * Example of countdown:       'Free shipping if you order within 3h 12min'
     * Example of time: 'Free shipping if you order before {2pm/14:00} depending on option of timeNotation'
     * supported values: 'countdown' / 'time'
     * @type {string}
     * @default 'time'
     */
    timerVariant?: string;
    /**
     * Tells in which format time left should be displayed, 12-hour clock  or 24-hour clock
     * supported values: '12h' / '24h'
     * @type {string}
     * @default '24h'
     */
    timeNotation?: string;
    /**
     * Defines countdown template in case there is an countdown chosen as display type
     * Stick to the format:
     * %d% - days left
     * %dl% - days label
     * %h% - hours left
     * %hl% - hours label
     * %m% - minutes left
     * %ml%' - minutes label
     * @type {string}
     * @default '%d%%dl% %h%%hl% %m%%ml%'
     */
    countdownTemplate?: string;
    /**
     * Defines refresh rate of component (in seconds)
     * @type {number}
     * @default 30
     */
    updateInterval?: number;
}

/**
 * Interface of data object with all info from BE
 */
interface IDeliveryData {
    /**
     * Informs until what time order must happen to make it possible to send order today
     * @type {number} Unix-time
     */
    time: number;
    /**
     * Informs until what time order must happen to make it possible to send order next possible day
     * @type {number} Unix-time
     */
    nextDayTime: number;
    /**
     * If delivery is not possible neither today nor tomorrow
     * It returns day of the week when delivery is expected.
     * Returned string should be already translated and ready to be pasted into template.
     * @type {string}
     */
    deliveryDay: string;
}

/**
 * Dropdown navigation that supports 3 category level links.
 */
export default class FastShipping {
    protected _$element: JQuery;
    protected _$timerPlaceholder: JQuery;
    protected _deliveryData: IDeliveryData;
    protected _translations: any;
    protected _countdownInterval: any;

    protected _options: FastShippingOptions = {
        namespace: 'cs-',
        variantClassName: 'cs-indicator-fast-shipping__element',
        timerSelector: '.cs-indicator-fast-shipping__text-placeholder-today',
        timerVariant: 'time',
        timeNotation: '24h',
        countdownTemplate: '%d% %dl% %h% %hl% %m% %ml%',
        updateInterval: 30,
    };

    /**
     * Creates new Fast Shipping component on given jQuery element with optional settings.
     * @param  {JQuery}              $element jQuery element to initialize script on.
     * @param  {FastShippingOptions} options  Optional settings object. should be sent to check available shipping time/options.
     */
    public constructor($element: JQuery, options?: FastShippingOptions) {
        // Don't throw errors if there is no Fast Shipping on the website.
        if ($element.length === 0) {
            return;
        }

        this._$element = $element;
        this._options = $.extend(this._options, options);
        this._translations = this._getTranslationsJSON();
        this._countdownInterval = null;
        this._$timerPlaceholder = this._$element.find(
            this._options.timerSelector
        );

        this._deliveryData = {
            time: parseInt(
                this._$element
                    .find(
                        `.${
                            this._options.namespace
                        }indicator-fast-shipping__data-time`
                    )
                    .val() as string,
                10
            ),
            nextDayTime: parseInt(
                this._$element
                    .find(
                        `.${
                            this._options.namespace
                        }indicator-fast-shipping__data-time-next`
                    )
                    .val() as string,
                10
            ),
            deliveryDay: this._$element
                .find(
                    `.${
                        this._options.namespace
                    }indicator-fast-shipping__data-delivery-day`
                )
                .val()
                .toString(),
        };

        this.updateTemplate();

        this._$element.removeClass('cs-visually-hidden');
    }

    /**
     * Updates information about time to end of possibility of shipping order today
     * It will either update it with 'countdown' type or 'time' option
     */
    public updateTimer(): void {
        const timeRemaining: any = this._getTimeRemaining();

        if (timeRemaining.total > 0) {
            if (this._options.timerVariant === 'countdown') {
                this._$timerPlaceholder.html(
                    this._getFormattedTimeLeft(timeRemaining)
                );
            } else {
                this._$timerPlaceholder.html(
                    this._getFormattedTimeTo(timeRemaining.total)
                );
            }
        } else {
            this.showVariant(timeRemaining);
        }
    }

    /**
     * Phisically show one of variants based on what server returns (or caches holds).
     * It will target element by data-attribute
     * @param {object} timeRemaining - time object to calculate variant ('today' / 'next')
     */
    public showVariant(timeRemaining): void {
        const variant: string = timeRemaining.total > 0 ? 'today' : 'next';
        const $allVariants = this._$element.find(
            `.${this._options.variantClassName}`
        );
        const $variant = this._$element.find(
            `.${this._options.variantClassName}[data-fs-scenario="${variant}"]`
        );

        if ($variant.length) {
            $allVariants.removeClass(
                `${this._options.variantClassName}--visible`
            );
            $variant.addClass(`${this._options.variantClassName}--visible`);
        } else {
            /* tslint:disable */
            console.warn(
                `Fast Shipping: Could not find target element: ${variant}`
            );
            /* tslint:enable */
        }
    }

    /**
     * Initializes set of methods to update all areas that has to be updated
     */
    public updateTemplate(): void {
        const timeRemaining: any = this._getTimeRemaining();

        if (timeRemaining.total > 0) {
            this.updateTimer();
            this.setCountdownUpdateInterval();
        }

        this.showVariant(timeRemaining);
    }

    /**
     * Updates countdown every XX (specified in this._options.countdownUpdateInterval) seconds.
     */
    public setCountdownUpdateInterval(): void {
        this._countdownInterval = setInterval((): void => {
            this.updateTimer();
        }, this._options.updateInterval * 1000);
    }

    /**
     * Collecing all translations needed for component and returns then as object
     * Gets them from hidden input placed in the template
     * @return {number} deadline - unix time (when possibility of shipping today expires)
     */
    protected _getTranslationsJSON(): any {
        const $labelsInput: any = this._$element.find(
            `.${this._options.namespace}indicator-fast-shipping__labels`
        );

        return $labelsInput.length && $labelsInput.val() !== ''
            ? JSON.parse($labelsInput.val())
            : {};
    }

    /**
     * Returns formatted time left until shipping is possible today as object
     * @return {object} - formatted deadline object
     */
    protected _getTimeRemaining(): object {
        const timeRemaining: number =
            this._deliveryData.time -
            (Math.floor(Date.now() / 1000) -
                new Date().getTimezoneOffset() * 60);

        return {
            total: timeRemaining,
            days: Math.floor(timeRemaining / (60 * 60 * 24)),
            hours: Math.floor((timeRemaining / (60 * 60)) % 24),
            minutes:
                timeRemaining < 59 && timeRemaining > 0
                    ? 1
                    : Math.floor((timeRemaining / 60) % 60),
            totalNextDay:
                this._deliveryData.nextDayTime -
                (Math.floor(Date.now() / 1000) -
                    new Date().getTimezoneOffset() * 60),
        };
    }

    /**
     * Returns label for corresponding position in countdown
     * based on this._translations object
     * @param n {number} number (must know if n > 1 to get correct label)
     * @param timePart {string} 'days' / 'hours' / 'minutes' to taget the correct key in deadline object
     * @return {string} label from this._labels object
     */
    protected _getTimeLabel(n: number, timePart: string): string {
        return n === 1
            ? `${this._translations[timePart]}`
            : `${this._translations[timePart + 's']}`;
    }

    /**
     * Returns countdown template with updated countdown
     * @param {object} deadline - result of this._getTimeRemaining method
     * @return {string} - countdown template
     */
    protected _getFormattedTimeLeft(deadline: any): string {
        let template = this._options.countdownTemplate;

        // Replaces all dynamic characters
        if (deadline.days > 0) {
            template = template.replace('%d%', deadline.days);
            template = template.replace(
                '%dl%',
                this._getTimeLabel(deadline.days, 'day')
            );
        } else {
            template = template.replace('%d%', '');
            template = template.replace('%dl%', '');
        }

        if (deadline.hours > 0) {
            template = template.replace('%h%', deadline.hours);
            template = template.replace(
                '%hl%',
                this._getTimeLabel(deadline.hours, 'hour')
            );
        } else {
            template = template.replace('%h%', '');
            template = template.replace('%hl%', '');
        }

        if (deadline.minutes > 0) {
            template = template.replace('%m%', deadline.minutes);
            template = template.replace(
                '%ml%',
                this._getTimeLabel(deadline.minutes, 'minute')
            );
        } else {
            template = template.replace('%m%', '');
            template = template.replace('%ml%', '');
        }

        return template;
    }

    /**
     * Returns deadline time as an object, splitted to days, hours and minutes
     * @param {object} unixTime - result of this._getTimeRemaining method
     * @return {string} - formatted time left
     */
    protected _getFormattedTimeTo(unixTime: number): string {
        const deadlineTimestamp: any = new Date(
            (this._deliveryData.time + new Date().getTimezoneOffset() * 60) *
                1000
        );

        const h: number = deadlineTimestamp.getHours();
        const m: number = deadlineTimestamp.getMinutes();

        if (this._options.timeNotation === '12h') {
            const wording12hClock: string = h >= 12 ? 'PM' : 'AM';
            if (m > 0) {
                return `${(h + 24) % 12 || 12}.${m} ${wording12hClock}`;
            } else {
                return `${(h + 24) % 12 || 12} ${wording12hClock}`;
            }
        }

        const formattedMinutes: string = m > 9 ? `${m}` : `0${m}`;

        return `${h}:${formattedMinutes}`;
    }
}
