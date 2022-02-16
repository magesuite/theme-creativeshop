import * as $ from 'jquery';
import 'mage/translate';

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
    countdownTemplate?: string;
    /**
     * Countdown DOM selector
     * @type {string}
     */
    countdownSelector?: string;
    /**
     * Default price DOM selector
     * @type {string}
     */
    defaultPriceSelector?: string;
    /**
     * Dailydeal price DOM selector
     * @type {string}
     */
    dailyDealPriceSelector?: string;
    /**
     * Tile container DOM selector
     * @type {string}
     */
    tileContainerSelector?: string;
    /**
     * Tile price container DOM selector
     * @type {string}
     */
    tilePriceContainerSelector?: string;
    /**
     * PDP price container DOM selector
     * @type {string}
     */
    pdpPriceContainerSelector?: string;
    /**
     * PDP sale block DOM selector
     * @type {string}
     */
    pdpSaleBlockSelector?: string;
    /**
     * Discount badge container DOM selector
     * @type {string}
     */
    badgeContainerSelector?: string;
    /**
     * Default discount badge DOM selector
     * @type {string}
     */
    defaultDiscountBadgeSelector?: string;
    /**
     * Dailydeal discount badge DOM selector
     * @type {string}
     */
    dailyDealDiscountBadgeSelector?: string;

    /**
     * Dailydeal amount info badge DOM selector
     * @type {string}
     */
    dailyDealAmountBadgeSelector?: string;
    /**
     * Precision of the clock to display remaining time. Should "5 minutes" be shown as 5 or 05?
     * Possible, supported values are: 1, 2
     * @type number
     * @default 2
     */
    timeDisplayPrecision?: number;
    /**
     * Dailydeal selector
     * @type string
     */
    dailyDealSelector?: string;
    /**
     * Dailydeal label translations
     * @type object
     */
    labels?: object;
    /**
     * Decides if labels should be dynamically updated every second.
     * Useful if there's 1 second left and you want to show 'second' instead of 'seconds' in this case
     * @type boolean
     * @default false
     */
    updateLabels?: boolean;
    /**
     * Callback function that (if defined) is fired after DD clock is rendered
     * @type Function
     */
    afterRenderCallback?: () => void;
    /**
     * By default when DD has expired during page reading we do nothing - countdown stops on 00:00:00:00.
     * You can pass handler here and do whatever you want with expired DD
     * @type Function
     */
    expiredHandler?: () => void;
}

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
}

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
    protected _$tilePriceContainer: JQuery;
    protected _$pdpPriceContainer: JQuery;
    protected _$badgeContainer: JQuery;
    protected _$tileDefaultPrice: JQuery;
    protected _$tileDailyDealPrice: JQuery;
    protected _$pdpDefaultPrice: JQuery;
    protected _$pdpDailyDealPrice: JQuery;
    protected _$defaultDiscountBadge: JQuery;
    protected _$dailyDealDiscountBadge: JQuery;
    protected _$dailyDealAmountBadge: JQuery;
    protected _clock: any;
    protected _options: DailydealOptions = {
        namespace: 'cs-',
        get countdownTemplate() {
            return `<span class="${this.namespace}dailydeal__countdown-element ${this.namespace}dailydeal__countdown-element--special">
                    <img class="inline-svg ${this.namespace}dailydeal__countdown-icon" data-bind="attr: { src: require.toUrl('./images/icons/clock.svg') }" alt="">
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
        get tileContainerSelector() {
            return `.${this.namespace}product-tile__container`;
        },
        get tilePriceContainerSelector() {
            return `.${this.namespace}product-tile__main`;
        },
        get pdpPriceContainerSelector() {
            return `.${this.namespace}price--pdp`;
        },
        get pdpSaleBlockSelector() {
            return `.${this.namespace}product-sale-block`;
        },
        get defaultPriceSelector() {
            return `.price-final_price_without_daily_deal`;
        },
        get dailyDealPriceSelector() {
            return `.price-final_price`;
        },
        get badgeContainerSelector() {
            return `.${this.namespace}product-tile__badges`;
        },
        get defaultDiscountBadgeSelector() {
            return `.${this.namespace}dailydeal__badge--discount`;
        },
        get dailyDealDiscountBadgeSelector() {
            return `.${this.namespace}dailydeal__badge--dd-discount`;
        },
        get dailyDealAmountBadgeSelector() {
            return `.${this.namespace}dailydeal__badge--amount`;
        },
        dailyDealSelector: '.cs-dailydeal',
        timeDisplayPrecision: 1,
        labels: {
            day: 'Day',
            days: 'Days',
            hour: 'Hour',
            hours: 'Hours',
            minute: 'Min',
            minutes: 'Min',
            second: 'Sec',
            seconds: 'Sec',
        },
        updateLabels: false,
    };

    /**
     * Creates new Dailydeal component on given jQuery element with optional settings.
     * @param  {JQuery}            $element jQuery element to initialize dailydeal on.
     * @param  {NavigationOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: DailydealOptions) {
        // Don't throw errors if there is no dailydeal on the website.
        if ($element.length === 0) {
            return;
        }
        this._$element = $element;
        this._options = $.extend({}, this._options, options);
        this._$countdown = this._$element.find(this._options.countdownSelector);

        // Don't throw errors if there is no $countdown inside $element.
        if (this._$countdown.length === 0) {
            return;
        }

        // Containers (Prices & Badges)
        this._$pdpPriceContainer = this._$element
            .closest(this._options.pdpSaleBlockSelector)
            .find(this._options.pdpPriceContainerSelector);
        this._$tilePriceContainer = this._$element
            .closest(this._options.tileContainerSelector)
            .find(this._options.tilePriceContainerSelector);
        this._$badgeContainer = this._$element
            .closest(this._options.tileContainerSelector)
            .find(this._options.badgeContainerSelector);
        // Prices (@Tiles & PDP).parent
        this._$tileDefaultPrice = this._$tilePriceContainer
            .find(this._options.defaultPriceSelector)
            .first();
        this._$tileDailyDealPrice = this._$tilePriceContainer
            .find(this._options.dailyDealPriceSelector)
            .first();
        this._$pdpDefaultPrice = this._$pdpPriceContainer
            .find(this._options.defaultPriceSelector)
            .first();
        this._$pdpDailyDealPrice = this._$pdpPriceContainer
            .find(this._options.dailyDealPriceSelector)
            .first();
        // Badges (@Tiles)
        this._$defaultDiscountBadge = this._$badgeContainer.find(
            this._options.defaultDiscountBadgeSelector
        );
        this._$dailyDealDiscountBadge = this._$badgeContainer.find(
            this._options.dailyDealDiscountBadgeSelector
        );
        this._$dailyDealAmountBadge = this._$badgeContainer.find(
            this._options.dailyDealAmountBadgeSelector
        );

        this._endTime = this._$countdown.data('dailydeal-end');

        // Don't throw errors if deal has no deadline date provided or has expired
        if (!this._endTime || this._endTime - this._getCurrentTime() <= 0) {
            // If cron hasn't refreshed it yet and page has been refreshed,
            // dailydeal should be hidden.
            this._hideDailydeal(true);

            if (
                this._options.expiredHandler &&
                typeof this._options.expiredHandler === 'function'
            ) {
                this._options.expiredHandler(this);
            }
            return;
        }

        this._template = '';
        this._clock = '';
        this._renderClock();
        this._countdownElements = this._getCountdownElements();
        this._initializeCountdown();
        this._showDailydeal(); // Dailydeal is hidden by CSS, we need to make it visible.
    }

    /**
     * Show dailydeal countdown and display proper price element
     */
    protected _showDailydeal(): void {
        let $dailydealDiscountBadge: JQuery = null;
        let $dailydealAmountBadge: JQuery = null;
        let $defaultDiscountBadge: JQuery = null;
        let $dailydealPrice: JQuery = null;
        let $defaultPrice: JQuery = null;

        if (this._isTile()) {
            $dailydealPrice = this._$tileDailyDealPrice;
            $defaultPrice = this._$tileDefaultPrice;
            $dailydealDiscountBadge = this._$dailyDealDiscountBadge;
            $dailydealAmountBadge = this._$dailyDealAmountBadge;
            $defaultDiscountBadge = this._$defaultDiscountBadge;
        } else {
            $dailydealPrice = this._$pdpDailyDealPrice;
            $defaultPrice = this._$pdpDefaultPrice;
        }

        this._updateContainers();
        this._$element.show();

        // Toggle price elment's.
        $dailydealPrice.addClass('price-box--visible');
        $defaultPrice.hide();

        // Check if discount badges exists.
        if ($dailydealDiscountBadge && $defaultDiscountBadge) {
            // Toggle discount badges.
            $dailydealDiscountBadge.css('display', '');
            $defaultDiscountBadge.hide();
        }
        if ($dailydealAmountBadge && $dailydealAmountBadge.length) {
            $dailydealAmountBadge.css('display', '');
        }
    }

    /**
     * Hide dailydeal countdown and display proper price elment
     * @param showFinalPrice Overrides hiding Dailydeal price block (final-price)
     *                       in case when Dailydeal has expired but it's still
     *                       rendered on PDP - product has only single price block
     *                       (final-price).
     */
    protected _hideDailydeal(showFinalPrice = false): void {
        let $dailydealDiscountBadge: JQuery = null;
        let $dailydealAmountBadge: JQuery = null;
        let $defaultDiscountBadge: JQuery = null;
        let $dailydealPrice: JQuery = null;
        let $defaultPrice: JQuery = null;

        if (this._isTile()) {
            $dailydealPrice = this._$tileDailyDealPrice;
            $defaultPrice = this._$tileDefaultPrice;
            $dailydealDiscountBadge = this._$dailyDealDiscountBadge;
            $dailydealAmountBadge = this._$dailyDealAmountBadge;
            $defaultDiscountBadge = this._$defaultDiscountBadge;
        } else {
            $dailydealPrice = this._$pdpDailyDealPrice;
            $defaultPrice = this._$pdpDefaultPrice;
        }

        this._updateContainers();
        this._$element.hide();

        // Toggle price elment's.
        $dailydealPrice.removeClass('price-box--visible').hide();
        $defaultPrice.addClass('price-box--visible');

        if (!this._isTile() && showFinalPrice) {
            // Dailydeal has expired but it's still rendered on PDP with single
            // price - rare case.
            $dailydealPrice.addClass('price-box--visible');
        }

        // Check if discount badges exists.
        if ($dailydealDiscountBadge && $defaultDiscountBadge) {
            // Toggle discount badges.
            $dailydealDiscountBadge.hide();
            $defaultDiscountBadge.css('display', '');
        }
        if ($dailydealAmountBadge && $dailydealAmountBadge.length) {
            $dailydealAmountBadge.hide();
        }
    }

    /**
     * Update price & badge containers with proper classes
     */
    protected _updateContainers(): void {
        this._updatePdpPriceContainer();
        this._updateBadgeContainer();
    }

    /**
     * Update PDP price container with class
     */
    protected _updatePdpPriceContainer(): void {
        const $pdpPriceContainer: JQuery = this._$pdpPriceContainer;

        if (
            !this._isTile() &&
            !$pdpPriceContainer.hasClass(
                `${this._options.namespace}price--pdp_dailydeal-countdown`
            )
        ) {
            $pdpPriceContainer.addClass(
                `${this._options.namespace}price--pdp_dailydeal-countdown`
            );
        }
    }

    /**
     * Update PDP badge container with class
     */
    protected _updateBadgeContainer(): void {
        const $badgeContainer: JQuery = this._$badgeContainer;
        if (
            this._isTile() &&
            $badgeContainer.find(
                `.${this._options.namespace}product-tile__badge--discount`
            ).length
        ) {
            if (
                !$badgeContainer.hasClass(
                    `${this._options.namespace}product-tile__badges--dailydeal-countdown`
                )
            ) {
                $badgeContainer.addClass(
                    `${this._options.namespace}product-tile__badges--dailydeal-countdown`
                );
            }
        }
    }

    /**
     * Check if dailydeal has been initialized for tile
     */
    protected _isTile(): boolean {
        return this._$element.hasClass(
            `${this._options.namespace}dailydeal--tile`
        );
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
        if (this._options.timeDisplayPrecision === 2) {
            return n > 9 ? `${n}` : `0${n}`;
        } else {
            return `${n}`;
        }
    }

    /**
     * Returns label for corresponding position in countdown
     * Temporarily using data attribute to fix tranlation issue
     * Can be reverted after update to M > 2.3.4-p2
     * based on labels option object
     * @param n {number} number (must know if n > 1 to get correct label)
     * @return label {string} label from this._options.labels object
     */
    protected _getCountdownLabel(n: number, timeUnit: string): any {
        const ddSelector: JQuery = this._$element.closest(
            this._options.dailyDealSelector
        );
        const dataPhrase: string = 'data-phrase-';

        if (this._options.updateLabels) {
            return n === 1
                ? ddSelector.attr(dataPhrase + timeUnit)
                : ddSelector.attr(dataPhrase + timeUnit + 's');
        } else {
            return ddSelector.attr(dataPhrase + timeUnit + 's');
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
        template = template.replace(
            '%d%',
            `<span class="csdd-d">${this._getFormattedTimeElement(
                timeRemaining.days
            )}</span>`
        );
        template = template.replace(
            '%h%',
            `<span class="csdd-h">${this._getFormattedTimeElement(
                timeRemaining.hours
            )}</span>`
        );
        template = template.replace(
            '%m%',
            `<span class="csdd-m">${this._getFormattedTimeElement(
                timeRemaining.minutes
            )}</span>`
        );
        template = template.replace(
            '%s%',
            `<span class="csdd-s">${this._getFormattedTimeElement(
                timeRemaining.seconds
            )}</span>`
        );

        // Set labels in countdown template
        template = template.replace(
            '%ld%',
            `<span class="csdd-ld">${this._getCountdownLabel(
                timeRemaining.days,
                'day'
            )}</span>`
        );
        template = template.replace(
            '%lh%',
            `<span class="csdd-lh">${this._getCountdownLabel(
                timeRemaining.hours,
                'hour'
            )}</span>`
        );
        template = template.replace(
            '%lm%',
            `<span class="csdd-lm">${this._getCountdownLabel(
                timeRemaining.minutes,
                'minute'
            )}</span>`
        );
        template = template.replace(
            '%ls%',
            `<span class="csdd-ls">${this._getCountdownLabel(
                timeRemaining.seconds,
                'second'
            )}</span>`
        );

        this._$countdown.html(template);
        this._setUniqueIds();
    }

    protected _setUniqueIds(): void {
        /* tslint:disable-next-line */
        const rdm: number = (Math.random() * (999 - 1 + 1)) << 0;
        this._$countdown.addClass(`countdown-${rdm}-${this._endTime}`);
    }

    protected _daysLeft(days: number): void {
        this._$countdown.attr('data-days', days);
    }

    /**
     * Updates clock
     */
    protected _updateClock(): any {
        const timeRemaining: any = this._getTimeRemaining();

        if (timeRemaining.total < 0) {
            clearInterval(this._clock);

            this._hideDailydeal(); // Hide dailydeal when countdown ends

            if (
                this._options.expiredHandler &&
                typeof this._options.expiredHandler === 'function'
            ) {
                this._options.expiredHandler(this);
            }

            return;
        }

        this._countdownElements.days.valueHolder.text(
            this._getFormattedTimeElement(timeRemaining.days)
        );
        this._countdownElements.hours.valueHolder.text(
            this._getFormattedTimeElement(timeRemaining.hours)
        );
        this._countdownElements.minutes.valueHolder.text(
            this._getFormattedTimeElement(timeRemaining.minutes)
        );
        this._countdownElements.seconds.valueHolder.text(
            this._getFormattedTimeElement(timeRemaining.seconds)
        );

        if (this._options.updateLabels) {
            this._countdownElements.days.labelHolder.html(
                this._getCountdownLabel(timeRemaining.days, 'day')
            );
            this._countdownElements.hours.labelHolder.html(
                this._getCountdownLabel(timeRemaining.hours, 'hour')
            );
            this._countdownElements.minutes.labelHolder.html(
                this._getCountdownLabel(timeRemaining.minutes, 'minute')
            );
            this._countdownElements.seconds.labelHolder.html(
                this._getCountdownLabel(timeRemaining.seconds, 'second')
            );
        }

        const countdownsUniqueClass: string = this._$countdown
            .attr('class')
            .split(' ')
            .pop();
        if ($(`.${countdownsUniqueClass}`).length > 1) {
            $(`.${countdownsUniqueClass}`)
                .last()
                .html(this._$countdown.html());
        }

        this._daysLeft(timeRemaining.days);
    }

    /**
     * Initializes countdown
     */
    protected _initializeCountdown(): void {
        const component: any = this;
        this._clock = setInterval((): void => {
            component._updateClock();
        }, 1000);

        if (
            this._options.afterRenderCallback &&
            typeof this._options.afterRenderCallback === 'function'
        ) {
            this._options.afterRenderCallback(this);
        }
    }
}
