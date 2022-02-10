import * as $ from 'jquery';

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

    public constructor(options?: CartOptions) {
        this._options = $.extend(
            {
                minQtyValue: 1,
                cartTableSelector: '#shopping-cart-table',
                qtyIncrementButtonSelector: '.cs-qty-increment__button',
                qtyIncrementInputSelector: '.cs-qty-increment__input',
                cartUpdateButtonSelector: '#update-cart-button',
                updateCartActionTimeout: 1500,
            },
            options
        );

        this._cartTable = document.querySelector(
            `${this._options.cartTableSelector}`
        );
        this._updateTimeout = null;

        this._attachEvents();
    }

    protected _triggerUpdate(
        delay: number = this._options.updateCartActionTimeout
    ): void {
        this._destroyRunningTimeouts();

        this._updateTimeout = setTimeout((): void => {
            $(`${this._options.cartUpdateButtonSelector}`).trigger('click');
        }, delay);
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
                    this._triggerUpdate();
                }
            }
        );

        $(`${this._options.qtyIncrementInputSelector}`).on(
            'input change',
            (e): void => {
                const newValue = $(e.target).val();

                if (
                    Number(newValue) < this._options.minQtyValue ||
                    newValue === ''
                ) {
                    this._removeItem($(e.target));
                } else {
                    this._triggerUpdate();
                }
            }
        );
    }
}
