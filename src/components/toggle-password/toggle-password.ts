/**
 * This component adds an accessible toggle password button.
 * It includes an optional mixin (show-password-ext.js), which is disabled by default.
 * To enable, activate the mixin in requirejs-config.js and uncomment the
 * related styles (toggle-password.scss) in customer.ts and checkout.ts entries.
 */

import * as $ from 'jquery';
import 'mage/translate';

export interface TogglePasswordOptions {
    /**
     * Class which is added for a input field, if it has possibility to toggle type
     * @default 'input-toggle'
     */
    togglePasswordInputClass?: string;
    /**
     * Class for button element, by which you can toggle input type field
     * @default 'cs-toggle-password'
     */
    togglePasswordSelector?: string;
    /**
     * Modifier for button element, to show password & proper icon
     * @default 'cs-toggle-password--visible'
     */
    togglePasswordVisibleModifier?: string;
    /**
     * Modifier for button element, to hide password & proper icon
     * @default 'cs-toggle-password--hidden'
     */
    togglePasswordHiddenModifier?: string;
    /**
     * Text for the button to show password
     * @default 'Show Password'
     */
    showPasswordText?: string;
    /**
     * Text for the button to hide password
     * @default 'Hide Password'
     */
    hidePasswordText?: string;
}

export default class TogglePassword {
    protected _$element: JQuery;
    protected _options?: TogglePasswordOptions;

    public constructor($element, options?: TogglePasswordOptions) {
        this._$element = $element;
        this._options = $.extend(
            {
                togglePasswordInputClass: 'input-toggle',
                togglePasswordSelector: 'cs-toggle-password',
                togglePasswordVisibleModifier: 'cs-toggle-password--visible',
                togglePasswordHiddenModifier: 'cs-toggle-password--hidden',
                showPasswordText: $.mage.__('Show Password'),
                hidePasswordText: $.mage.__('Hide Password'),
            },
            options
        );

        this._createElement();
    }

    protected _createElement(): void {
        const _this = this;

        this._$element.addClass(this._options.togglePasswordInputClass);
        this._$element.after(function () {
            return `<button type="button" data-toggle="#${this.id}" class="${_this._options.togglePasswordSelector} ${_this._options.togglePasswordHiddenModifier}">${_this._options.showPasswordText}</button>`;
        });

        this._attachEvents();
    }

    protected _togglePasswordHandler(element: JQuery): void {
        const inputID = $($(element).data('toggle'));
        $(element).toggleClass(
            `${this._options.togglePasswordVisibleModifier} ${this._options.togglePasswordHiddenModifier}`
        );

        if (inputID.attr('type') === 'password') {
            inputID.attr('type', 'text');
            $(element).text(`${this._options.hidePasswordText}`);
        } else {
            inputID.attr('type', 'password');
            $(element).text(`${this._options.showPasswordText}`);
        }
    }

    protected _attachEvents(): void {
        const _this = this;

        this._$element
            .closest('.field')
            .find(`.${this._options.togglePasswordSelector}`)
            .on('click', function () {
                _this._togglePasswordHandler($(this));
            });
    }
}

export { TogglePassword };
