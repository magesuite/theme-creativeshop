import $ from 'jquery';

/**
 * Daily Deal component options interface.
 */
interface DailydealOptions {
    /**
     * Component's namespace
     * @type {string}
     * @default cs-
     */
    namespace?: string;
    /**
     * Template of the countdown
     * @type {string}
     */
    countdownTemplate?: string
    /**
     * Countdown DOM selector
     * @type {string}
     */
    countdownSelector?: string,
    /**
     * Precision of the clock to display remaining time. Should "5 minutes" be shown as 5 or 05?
     * Possible, supported values are: 1, 2
     * @type number
     * @default 2
     */
    timeDisplayPrecision?: number,
    /**
     * Decides if labels should be dynamically updated every second.
     * Useful if there's 1 second left and you want to show 'second' instead of 'seconds' in this case
     * @type boolean
     * @default false
     */
    updateLabels?: boolean,
    /**
     * By default when DD has expired during page reading we do nothing - countdown stops on 00:00:00:00.
     * You can pass handler here and do whatever you want with expired DD
     * @type Function
     */
    expiredHandler?: Function,
};

/**
 * Countdown elements interface.
 */
interface ISingleCountdownElement {
    /**
     * JQuery element that holds value for specific countdown element
     * @type {JQuery}
     */
    valueHolder: JQuery;
    /**
     * JQuery element that holds label for specific countdown element
     * @type {JQuery}
     */
    labelHolder: JQuery;
};

/**
 * Component class definition
 */
export default class Dailydeal {
    protected _$element: JQuery;
    protected _endTime: number;
    protected _currentTime: number;
    protected _template: string;
    protected _$countdown: JQuery;
    protected _countdownElements: any;
    protected _labels: any;
    protected _clock: any;
    protected _options: DailydealOptions = {
        namespace: 'cs-',
        get countdownTemplate() { 
            return `<span class="${this.namespace}dailydeal__countdown-element ${this.namespace}dailydeal__countdown-element--special">
                    <svg class="${this.namespace}dailydeal__countdown-icon"><use xlink:href="#clock"></use></svg>
                </span>
                <span class="${this.namespace}dailydeal__countdown-element">
                    <span class="${this.namespace}dailydeal__countdown-value">%d%</span>
                    <span class="${this.namespace}dailydeal__countdown-label">%ld%</span>
                </span>
                <span class="${this.namespace}dailydeal__countdown-element">
                    <span class="${this.namespace}dailydeal__countdown-value">%h%</span>
                    <span class="${this.namespace}dailydeal__countdown-label">%lh%</span>
                </span>
                <span class="${this.namespace}dailydeal__countdown-element">
                    <span class="${this.namespace}dailydeal__countdown-value">%m%</span>
                    <span class="${this.namespace}dailydeal__countdown-label">%lm%</span>
                </span>
                <span class="${this.namespace}dailydeal__countdown-element">
                    <span class="${this.namespace}dailydeal__countdown-value">%s%</span>
                    <span class="${this.namespace}dailydeal__countdown-label">%ls%</span>
                </span>`;
        },
        get countdownSelector() {
            return `.${this.namespace}dailydeal__countdown`;
        },
        timeDisplayPrecision: 1,
        updateLabels: false,
    };

    /**
     * Creates new Dailydeal component on given jQuery element with optional settings.
     * @param  {JQuery}            $element jQuery element to initialize dailydeal on.
     * @param  {NavigationOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: DailydealOptions) {
        // Don't throw errors if there is no dailydeal on the website.
        if ( $element.length === 0 ) {
            return;
        }
        this._$element = $element;
        this._options = $.extend({}, this._options, options);
        this._$countdown = this._$element.find(this._options.countdownSelector);

        // Don't throw errors if there is no $countdown inside $element.
        if ( this._$countdown.length === 0 ) {
            return;
        }

        this._endTime = this._$countdown.data('dailydeal-end');

        // Don't throw errors if deal has no deadline date provided or has expired
        if ( !this._endTime || this._endTime - this._getCurrentTime() <= 0 ) {
            return;
        }

        this._template = '';
        this._labels = this._getLabelsJSON();
        this._clock = '';
        this._renderClock();
        this._countdownElements = this._getCountdownElements();
        this._initializeCountdown();
    }

    /**
     * Update template if dailydeal expired
     */
    protected _getLabelsJSON(): any {
        const $labelsInput: any = this._$element.find(`.${this._options.namespace}dailydeal__countdown-labels`);
        return $labelsInput.length && $labelsInput.val() !== '' ? JSON.parse($labelsInput.val()) : {};
    }

    /**
     * Returns current Unix time (without muliseconds)
     */
    protected _getCurrentTime(): number {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Returns deal's deadline as an object, splitted to days, hours, minutes and seconds
     */
    protected _getTimeRemaining(): object {
        const timeRemaining: number = this._endTime - this._getCurrentTime();

        return {
            total: timeRemaining,
            days: Math.floor(timeRemaining / (60 * 60 * 24)),
            hours: Math.floor((timeRemaining / (60 * 60)) % 24),
            minutes: Math.floor((timeRemaining / 60) % 60),
            seconds: Math.floor(timeRemaining % 60),
        };
    }

    /**
     * Returns formatted time element. 
     * If time remaining for days is 8 and options.timeDisplayPrecision is 2 it will return "08",
     * otherwise it will simply return "8"
     * @param n {number} number to format
     * @return 'n' {string} formatted number
     */
    protected _getFormattedTimeElement(n: number): string {
        if(this._options.timeDisplayPrecision == 2) {
            return n > 9 ? `${n}`: `0${n}`;
        } else {
            return `${n}`;
        }
    }

    /**
     * Returns label for corresponding position in countdown 
     * based on this._labels object
     * @param n {number} number (must know if n > 1 to get correct label)
     * @return label {string} label from this._labels object
     */
    protected _getCountdownLabel(n: number, timeUnit: string): string {
        if(this._options.updateLabels) {
            return n === 1 ?  `${this._labels[timeUnit]}` : `${this._labels[timeUnit + 's']}`;
        } else {
            return `${this._labels[timeUnit + 's']}`;
        }
    }

    /**
     * Setup this._counterElements object
     * It stores all JQuery elements that can be modified in one object
     */
    protected _getCountdownElements(): object {
        return {
            days: {
                valueHolder: this._$countdown.find('.csdd-d'),
                labelHolder: this._$countdown.find('.csdd-ld'),
            },
            hours: {
                valueHolder: this._$countdown.find('.csdd-h'),
                labelHolder: this._$countdown.find('.csdd-lh'),
            },
            minutes: {
                valueHolder: this._$countdown.find('.csdd-m'),
                labelHolder: this._$countdown.find('.csdd-lm'),
            },
            seconds: {
                valueHolder: this._$countdown.find('.csdd-s'),
                labelHolder: this._$countdown.find('.csdd-ls'),
            },
        };
    }

    /**
     * Prepares clock's template and puts the initial deadline date of the deal
     */
    protected _renderClock(): void {
        let template: string = this._options.countdownTemplate;
        const timeRemaining: any = this._getTimeRemaining();

        // Set time in countdown template
        template = template.replace('%d%', `<span class="csdd-d">${this._getFormattedTimeElement(timeRemaining.days)}</span>`);
        template = template.replace('%h%', `<span class="csdd-h">${this._getFormattedTimeElement(timeRemaining.hours)}</span>`);
        template = template.replace('%m%', `<span class="csdd-m">${this._getFormattedTimeElement(timeRemaining.minutes)}</span>`);
        template = template.replace('%s%', `<span class="csdd-s">${this._getFormattedTimeElement(timeRemaining.seconds)}</span>`);

        // Set labels in countdown template
        template = template.replace('%ld%', `<span class="csdd-ld">${this._getCountdownLabel(timeRemaining.days, 'day')}</span>`);
        template = template.replace('%lh%', `<span class="csdd-lh">${this._getCountdownLabel(timeRemaining.hours, 'hour')}</span>`);
        template = template.replace('%lm%', `<span class="csdd-lm">${this._getCountdownLabel(timeRemaining.minutes, 'minute')}</span>`);
        template = template.replace('%ls%', `<span class="csdd-ls">${this._getCountdownLabel(timeRemaining.seconds, 'second')}</span>`);

        this._$countdown.html(template);
        this._setUniqueIds();
    }

    protected _setUniqueIds(): void {
        const rdm: number = (Math.random() * (999 - 1 + 1)) << 0;
        this._$countdown.addClass(`countdown-${rdm}-${this._endTime}`);
    }

    /**
     * Updates clock
     */
    protected _updateClock(): any {
        const timeRemaining: any = this._getTimeRemaining();

        if(timeRemaining.total < 0) {
            clearInterval(this._clock);
            
            if ( this._options.expiredHandler && typeof( this._options.expiredHandler ) === 'function' ) {
                this._options.expiredHandler();
            }

            return;
        }

        this._countdownElements.days.valueHolder.text(this._getFormattedTimeElement(timeRemaining.days));
        this._countdownElements.hours.valueHolder.text(this._getFormattedTimeElement(timeRemaining.hours));
        this._countdownElements.minutes.valueHolder.text(this._getFormattedTimeElement(timeRemaining.minutes));
        this._countdownElements.seconds.valueHolder.text(this._getFormattedTimeElement(timeRemaining.seconds));

        if(this._options.updateLabels) {
            this._countdownElements.days.labelHolder.html(this._getCountdownLabel(timeRemaining.days, 'day'));
            this._countdownElements.hours.labelHolder.html(this._getCountdownLabel(timeRemaining.hours, 'hour'));
            this._countdownElements.minutes.labelHolder.html(this._getCountdownLabel(timeRemaining.minutes, 'minute'));
            this._countdownElements.seconds.labelHolder.html(this._getCountdownLabel(timeRemaining.seconds, 'second'));
        }

        const countdownsUniqueClass: string = this._$countdown.attr('class').split(' ').pop();
        if($(`.${countdownsUniqueClass}`).length > 1) {
            $(`.${countdownsUniqueClass}`).last().html(this._$countdown.html());
        }
    }

    /**
     * Initializes countdown
     */
    protected _initializeCountdown(): void {
        const component: any = this;
        this._clock = setInterval((): void => { 
            component._updateClock(); 
        }, 1000);
    }
}
