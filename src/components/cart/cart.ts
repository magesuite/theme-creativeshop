import * as $ from 'jquery';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

/**
 * Component options interface.
 */
export interface CartOptions {
    minQtyValue?: number;
    cartTableSelector?: string;
    qtyIncrementButtonSelector?: string;
    qtyIncrementInputSelector?: string;
    cartUpdateButtonSelector?: string;
    updateCartActionTimeout?: number; // in ms
    inputChangeAction: 'reload' | 'show_update_button';
    visuallyHiddenClass?: string;
    actionsContainerSelector?: string;
    activeActionsClass?: string;
}
/**
 * Cart component to modify default M2 behavior
 * See Magento_Checkout/templates/cart/form.phtml for more details
 */
export default class Cart {
    protected _options: CartOptions;
    protected _cartTable: HTMLElement;
    protected _updateTimeout: any;
    protected _removeTimeout: any;
    protected _initValue: number;
    protected updateButtonShown: boolean = false;

    public constructor(options?: CartOptions) {
        this._options = $.extend(
            {
                minQtyValue: 1,
                cartTableSelector: '#shopping-cart-table',
                qtyIncrementButtonSelector: '.cs-qty-increment__button',
                qtyIncrementInputSelector: '.cs-qty-increment__input',
                cartUpdateButtonSelector: '#update-cart-button',
                updateCartActionTimeout: 1500,
                inputChangeAction: deepGet(
                    viewXml,
                    'vars.Magento_Checkout.cart.qty_input_change_action'
                ),
                visuallyHiddenClass: 'cs-visually-hidden',
                actionsContainerSelector: '.cart.main.actions',
                activeActionsClass: 'active',
            },
            options
        );

        this._cartTable = document.querySelector(
            `${this._options.cartTableSelector}`
        );
        this._updateTimeout = null;
        this._initValue = 0;

        this._attachEvents();
    }

    protected _triggerUpdate(
        item: JQuery = null,
        delay: number = this._options.updateCartActionTimeout
    ): void {
        this._destroyRunningTimeouts();

        this._initValue = Number(item.val());
        this._updateTimeout = setTimeout((): void => {
            $(`${this._options.cartUpdateButtonSelector}`).trigger('click');
        }, delay);
    }

    protected _showUpdateButton(item: JQuery = null) {
        if (this.updateButtonShown) {
            return;
        }
        this._destroyRunningTimeouts();

        this._initValue = Number(item.val());
        const cartUpdateButtonElement = document.querySelector(
            this._options.cartUpdateButtonSelector
        );
        if (cartUpdateButtonElement) {
            cartUpdateButtonElement.removeAttribute('aria-hidden');
            cartUpdateButtonElement.removeAttribute('tabindex');
            cartUpdateButtonElement.classList.remove(
                this._options.visuallyHiddenClass
            );
            cartUpdateButtonElement
                .closest(this._options.actionsContainerSelector)
                .classList.add(this._options.activeActionsClass);
            this.updateButtonShown = true;
        }
    }

    protected _removeItem(
        item: JQuery,
        delay: number = this._options.updateCartActionTimeout
    ): void {
        this._destroyRunningTimeouts();

        this._removeTimeout = setTimeout((): void => {
            const removeTrigger: JQuery = item
                .parents('.item-info')
                .find('.cs-cart-item__link--remove > a');

            if (removeTrigger) {
                removeTrigger.trigger('click');
            }
        }, delay);
    }

    protected _destroyRunningTimeouts(): void {
        if (this._removeTimeout) {
            clearTimeout(this._removeTimeout);
            this._removeTimeout = false;
        } else if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = false;
        }
    }

    protected _attachEvents(): void {
        const _this = this;

        window.addEventListener('orientationchange', (): void => {
            const cartTableStyle: string = getComputedStyle(
                this._cartTable
            ).getPropertyValue('display');
            this._cartTable.style.display = 'none';
            setTimeout((): void => {
                this._cartTable.style.display = cartTableStyle;
            }, 10);
        });

        $(`${this._options.qtyIncrementButtonSelector}`).on(
            'click',
            (e): void => {
                if (
                    !$(e.target)
                        .parents('.cs-qty-increment__button')
                        .hasClass('cs-qty-increment__button--disabled') &&
                    !$(e.target).hasClass('cs-qty-increment__button--disabled')
                ) {
                    this._triggerUpdate($(e.target));
                }
            }
        );

        $(`${this._options.qtyIncrementInputSelector}`).on(
            'input change',
            (e, data): void => {
                if (
                    _this._options.inputChangeAction !== 'reload' &&
                    data?.trigger === 'qty-increment'
                ) {
                    return;
                }
                const newValue = $(e.target).val();

                // Don't perform any action when input is empty (e.g. when user hits backspace) or value doesn't change (to prevent duplicated error (NKD-3292))
                if (
                    newValue === '' ||
                    Number(this._initValue) === Number(newValue)
                ) {
                    return;
                }

                if (this._options.inputChangeAction === 'reload') {
                    if (Number(newValue) < _this._options.minQtyValue) {
                        this._removeItem($(e.target));
                    } else {
                        this._triggerUpdate($(e.target));
                    }
                } else {
                    this._showUpdateButton($(e.target));
                }
            }
        );
    }
}
