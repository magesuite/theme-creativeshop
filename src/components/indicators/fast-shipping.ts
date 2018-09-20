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
     * Defines URL which should be called to check for shipping time/options or whatever is returned.
     * @type {string}
     */
    requestUrl?: string;
    /**
     * Defines parameters for AJAX request (jQuery AJAX)
     * @type {object}
     */
    ajaxParameters?: object;
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
     * Tells if countdown should be updated dynamically every XX seconds
     * @type {boolean}
     * @default false
     */
    updateCountdown?: boolean;
    /**
     * If `updateCountdown` option is turned on, it defines refresh rate of countdown itself (in seconds)
     * @type {number}
     * @default 30
     */
    countdownUpdateInterval?: number;
    /**
     * Tells if countdown should be displayed also for tomorrow's delivery 
     * @type {number}
     * @default false
     */
    showCountdownForTomorrow?: boolean;
};

/**
 * Interface of data returned by AJAX request
 */
interface IAjaxData {
    /**
     * Informs if delivery is possible today
     * it should return one of following values: 'today' / 'tomorrow' / 'other'
     * @type {string}
     */
    day?: string;
    /**
     * If delivery is possible today (IAjaxData.day === 'today')
     * It informs until what time order must happen to make it possible
     * @type {number} Unix-time
     */
    time?: number;
    /**
     * If delivery is not possible either today nor tomorrow (IAjaxData.day !== 'today' && 'IAjaxData.day !== 'tomorrow')
     * It returns day of the week when delivery is expected.
     * Returned string should be already translated and ready to be pasted into template.
     * @type {string}
     */
    deliveryDay?: string;
};

/**
 * Dropdown navigation that supports 3 category level links.
 */
export default class FastShipping {
    protected _$element: JQuery;
    protected _translations: any;
    protected _countdownInterval: any;

    protected _options: FastShippingOptions = {
        namespace: 'cs-',
        requestUrl: typeof location.origin === 'undefined' ? `${location.protocol}//${location.host}/indicators/fastshipping/index` : `${location.origin}/indicators/fastshipping/index`,
        variantClassName: 'cs-indicators__fast-shipping-element',
        timerSelector: '.cs-indicators__fast-shipping-time-left',
        deliveryDaySelector: '.cs-indicators__fast-shipping-delivery-day',
        timerVariant: 'time',
        timeNotation: '24h',
        countdownTemplate: '%d% %dl% %h% %hl% %m% %ml%',
        updateCountdown: false,
        countdownUpdateInterval: 30,
        showCountdownForTomorrow: false,
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
        this._options = $.extend( this._options, options );
        this._translations = this._getTranslationsJSON();
        this._countdownInterval = '';

        if(this._isUpdateRequired()) {
            this._updateFromServer();
        } else {
            this._updateFromCache();
        }
    }

    /**
     * Updates information about time to end of possibility of shipping order today
     * It will either update it with 'countdown' type or 'time' option
     * @param {number} deadline - unix time (when possibility of shipping today expires)
     */
    public updateTimer(deadline: number): void {
        const timeRemaining: any = this._getTimeRemaining(deadline);
        const $deadlinePlaceholder: JQuery = this._$element.find(this._options.timerSelector);

        if(timeRemaining.total > 0) {
            if(this._options.timerVariant === 'countdown') {
                $deadlinePlaceholder.html(this._getFormattedTimeLeft(timeRemaining));
            } else {
                $deadlinePlaceholder.html(this._getFormattedTimeTo(deadline));
            }
        } else {
            this._updateFromServer(true);
        }
    }

    /**
     * If shipping cannot be delivered today, it will update template informing
     * when order can be delivered
     * @param {string} dayName - day of the week when shipping is expected
     */
    public updateShippingDate(dayName: string): void {
        const $dayPlaceholder = this._$element.find(this._options.deliveryDaySelector);

        if($dayPlaceholder.length) {
            $dayPlaceholder.text(dayName);
        }
    }

    /**
     * Phisically show one of variants based on what server returns (or caches holds).
     * It will target element by data-attribute
     * @param {string} variant - variant that should be shown. 'today' / 'tomorrow' / 'other'
     */
    public showVariant(variant: string): void {
        const $allVariants = this._$element.find(`.${this._options.variantClassName}`);
        const $variant = this._$element.find(`.${this._options.variantClassName}[data-fs-scenario="${variant}"]`);

        if($variant.length) {
            $allVariants.removeClass(`${this._options.variantClassName}--visible`);
            $variant.addClass(`${this._options.variantClassName}--visible`);
        } else {
            console.warn(`Fast Shipping: Could not find target element: ${variant}`);
        }
    }

    /**
     * Initializes set of methods to update all areas that has to be updated
     * @param {IAjaxData} data - data returned from server
     */
    public updateTemplate(data: IAjaxData): void {
        if(data.day === 'today' || (this._options.showCountdownForTomorrow && data.day === 'tomorrow')) {
            this.updateTimer(data.time);
            clearInterval(this._countdownInterval);
            this.setCountdownUpdateInterval(data.time);
        } else if(data.day === 'other' && data.deliveryDay !== '') {
            this.updateShippingDate(data.deliveryDay);
        }

        this.showVariant(data.day);
    }

    /** Updates countdown every XX (specified in this._options.countdownUpdateInterval) seconds. 
     * If this._options.updateCountdown option is enabled.
     * @param {number} deadline - unix time (when possibility of shipping today expires)
     */
    public setCountdownUpdateInterval(deadline: number): void {
        if(this._options.timerVariant === 'countdown' && this._options.updateCountdown) {
            this._countdownInterval = setInterval((): void => {
                this.updateTimer(deadline);
            }, this._options.countdownUpdateInterval * 1000);
        }
    }

    /**
     * Checks if update from server is required. By defulat it is. 
     * In creativeshop we extend this functionality checking Magento's storage
     * @return {boolean}
     */
    protected _isUpdateRequired(): boolean {
        return true;
    }

    /**
     * Saves data provided by server to localStorage
     * By default we do nothing here. It's handled in Creativeshop's extending class
     * as we are using Magento's storage
     * @param {IAjaxData} data - data returned from server
     * @return {boolean/void} - By default we return boolean but in Creativeshop there's no return
     */
    protected _saveToCache(data: IAjaxData): any {
        return false;
    }

    /**
     * Collecing all translations needed for component and returns then as object
     * Gets them from hidden input placed in the template
     * @return {number} deadline - unix time (when possibility of shipping today expires)
     */
    protected _getTranslationsJSON(): any {
        const $labelsInput: any = this._$element.find(`.${this._options.namespace}indicators__fast-shipping-labels`);
        return $labelsInput.length && $labelsInput.val() !== '' ? JSON.parse($labelsInput.val()) : {};
    }

    /**
     * Calculates deadline date taking in count local timezones
     * @param {number} unixTime - unix time w/o miliseconds (when possibility of shipping today expires)
     * @return {string} Date - Expire in local timezone
     */
    protected _getAdjustedDeadlineTime(unixTime: number): any {
        const localTimeOffsetInSecs: number = new Date().getTimezoneOffset() * 60;
        const serverTimeOffsetInSecs: number = new Date(unixTime * 1000).getTimezoneOffset() * 60;
        const adjustedUnixTime: number = unixTime + (serverTimeOffsetInSecs - localTimeOffsetInSecs);

        return new Date(adjustedUnixTime * 1000);
    }

    /**
     * Setups AJAX request based on default options and the ones passed in options
     * @param clearCache {boolean} informs server that cache shall be cleared before returning data
     * @return {any} AJAX request
     */
    protected _AjaxRequest(clearCache: boolean): any {
        const defaultParams: object = {
            method: 'POST',
            url: clearCache ? `${this._options.requestUrl}/clear/cache` : this._options.requestUrl,
            dataType: 'json',
        };
        const params: object = $.extend({}, defaultParams, this._options.ajaxParameters);

        return $.ajax(params);
    }

    /**
     * Runs AJAX request. As result initializes template update and saving data to cache
     * Additionally checks if Response is not empty which means something crashed
     * or FastShipping is turned off
     * @param clearCache {boolean} informs server that cache shall be cleared before returning data
     * @return {any} AJAX request
     */
    protected _updateFromServer(clearCache = false): any {
        return this._AjaxRequest(clearCache).then((response: any) => {
            if(!$.isEmptyObject(response)) {
                this.updateTemplate(response);
                this._saveToCache(response);
            }
        });
    }

    /**
     * Runs template update from cache. By default it just forces update from server.
     * in Creativeshop we cover cache usage and then update template directly based on cached data
     */
    protected _updateFromCache(): void {
        this._updateFromServer();
    }

    /**
     * Returns formatted time left until shipping is possible today as object
     * @param {number} deadline - unix time (when possibility of shipping today expires)
     * @return {object} - formatted deadline object
     */
    protected _getTimeRemaining(deadline: number): object {
        const timeRemaining: number = deadline - Math.floor(Date.now() / 1000);

        return {
            total: timeRemaining,
            days: Math.floor(timeRemaining / (60 * 60 * 24)),
            hours: Math.floor((timeRemaining / (60 * 60)) % 24),
            minutes: (timeRemaining < 59 && timeRemaining > 0) ? 1 : Math.floor((timeRemaining / 60) % 60),
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
        return n === 1 ? `${this._translations[timePart]}` : `${this._translations[timePart + 's']}`;
    }

    /**
     * Returns countdown template with updated countdown
     * @param {object} deadline - result of this._getTimeRemaining method
     * @return {string} - countdown template
     */
    protected _getFormattedTimeLeft(deadline: any): string {
        let template = this._options.countdownTemplate;

        // Replaces all dynamic characters
        if(deadline.days > 0) {
            template = template.replace('%d%', deadline.days);
            template = template.replace('%dl%', this._getTimeLabel(deadline.days, 'day'));
        } else {
            template = template.replace('%d%', '');
            template = template.replace('%dl%', '');
        }

        if(deadline.hours > 0) {
            template = template.replace('%h%', deadline.hours);
            template = template.replace('%hl%', this._getTimeLabel(deadline.hours, 'hour'));
        } else {
            template = template.replace('%h%', '');
            template = template.replace('%hl%', '');
        }

        if(deadline.minutes > 0) {
            template = template.replace('%m%', deadline.minutes);
            template = template.replace('%ml%', this._getTimeLabel(deadline.minutes, 'minute'));
        } else {
            template = template.replace('%m%', '');
            template = template.replace('%ml%', '');
        }

        return template;
    }

    /**
     * Returns deadline time as an object, splitted to days, hours and minutes
     * @param {object} deadline - result of this._getTimeRemaining method
     * @return {string} - formatted time left
     */
    protected _getFormattedTimeTo(unixTime: number): string {
        const adjustedTime: any = this._getAdjustedDeadlineTime(unixTime);

        const h: number = adjustedTime.getHours();
        const m: number = adjustedTime.getMinutes();

        if(this._options.timeNotation === '12h') {
            const wording12hClock: string = (h >= 12) ? 'PM' : 'AM';
            if(m > 0) {
                return `${(h + 24) % 12 || 12}.${m} ${wording12hClock}`;
            } else {
                return `${(h + 24) % 12 || 12} ${wording12hClock}`;
            }
        }

        const formattedMinutes: string = m > 9 ? `${m}` : `0${m}`;

        return `${h}:${formattedMinutes}`;
    }
}
