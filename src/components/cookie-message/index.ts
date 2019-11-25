import 'components/cookie-message/cookie-message.scss';

/* tslint:disable:no-unused-new object-literal-key-quotes max-classes-per-file */
import * as $ from 'jquery';

interface ICookieMessageSettings {
    /**
     * Defines cookie lifetime (in days!)
     * @default {180}
     * @type {number}
     */
    lifetime?: number;

    /**
     * Defines delay of component destroyment (in ms).
     * Useful if there's an animation for hidding component after button is clicked.
     * @default {250}
     * @type {number}
     */
    destroyDelay?: number;

    /**
     * Defines url of Ajax request to set cookie.
     * Value shouldn't contain origin url
     * @default {cookie-message/set-cookie}
     * @type {string}
     */
    ajaxUrl?: string;

    /**
     * On message shown callback
     * @type {any}
     */
    onShown?: any;

    /**
     * On message destroyed callback
     * @type {any}
     */
    onDestroyed?: any;
}

/**
 * CookieMessage displays legal cookie note on the bottom of the page due to EU law.
 */
export default class CookieMessage {
    private _settings?: ICookieMessageSettings;
    public $wrapper: JQuery;
    public status: string;

    /**
     * Creates and initiates new CookieMessage component with given settings.
     * @param  {$wrapper} JQuery components' wrapper.
     * @param  {ICookieMessageSettings} settings Optional component settings.
     */
    public constructor($wrapper: JQuery, settings?: ICookieMessageSettings) {
        this.status = 'not-fired';

        if ($wrapper.length) {
            this._settings = $.extend(
                true,
                {},
                {
                    lifetime: 180,
                    destroyDelay: 250,
                    ajaxUrl: 'cookie-message/set-cookie',
                },
                settings
            );

            this.$wrapper = $wrapper;
            this.showMessage();
            this._setEvents();
        }
    }

    /**
     * Adds class to $wrapper that shows cookie message
     */
    public showMessage(): void {
        this.$wrapper.addClass('cs-cookie-message--shown');
        this.status = 'active';

        if (
            this._settings.onShown &&
            typeof this._settings.onShown === 'function'
        ) {
            this._settings.onShown();
        }
    }

    /**
     * Removes class to $wrapper that shows cookie message (hides it)
     */
    public hideMessage(): void {
        this.$wrapper.removeClass('cs-cookie-message--shown');
        this.status = 'inactive';
    }

    /**
     * Destroys component when it's no longer needed
     */
    public destroyMessage($btn?: any): void {
        this.hideMessage();

        setTimeout((): void => {
            this.$wrapper.remove();
            this.status = 'destroyed';

            if (
                this._settings.onDestroyed &&
                typeof this._settings.onDestroyed === 'function'
            ) {
                this._settings.onDestroyed();
            }
        }, this._settings.destroyDelay);

        if ($btn && $btn.length) {
            $btn.off('click');
        }
    }

    /**
     * Returns base url of current page
     * @return  {string} origin url.
     */
    private _getLocationOrigin(): string {
        if (typeof window.location.origin === 'undefined') {
            return `${window.location.protocol}//${window.location.host}`;
        }

        return window.location.origin;
    }

    /**
     * Sends AJAX request to backend to inform that cookie should be set.
     * Additionally passes lifetime according to settings
     */
    private _setCookie(): void {
        $.ajax({
            method: 'POST',
            url: `${this._getLocationOrigin()}/${this._settings.ajaxUrl}`,
            data: { cookieLifetime: this._settings.lifetime },
        });
    }

    /**
     * Sets click event for agreement button
     */
    private _setEvents(): void {
        let _this: any = this;
        const $btn: any = this.$wrapper.find('button');

        if ($btn.length) {
            $btn.on('click', function(): void {
                _this._setCookie();
                _this.destroyMessage($btn);
            });
        }
    }
}
