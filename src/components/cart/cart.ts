import * as $ from 'jquery';

/**
 * Component options interface.
 */
export interface CartOptions {
    cartTableSelector?: string;
    qtyIncrementButtonSelector?: string;
    qtyIncrementInputSelector?: string;
    cartUpdateButtonSelector?: string;
    loadingIndicatorSelector?: string;
    updateCartActionTimeout?: number; // in ms
}
/**
 * Cart component to modify default M2 behavior
 */
export default class Cart {
    protected _options: CartOptions;
    protected _cartTable: HTMLElement;
    protected _updateTimeout: any;

    public constructor(options?: CartOptions) {
        this._options = $.extend(
            {
                cartTableSelector: '#shopping-cart-table',
                qtyIncrementButtonSelector: '.cs-qty-increment__button',
                qtyIncrementInputSelector: '.cs-qty-increment__input',
                cartUpdateButtonSelector: '#update-cart-button',
                loadingIndicatorSelector: '.load.indicator',
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
        if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = false;
        }

        this._updateTimeout = setTimeout((): void => {
            const $updateCartButton = $(
                `${this._options.cartUpdateButtonSelector}`
            );
            $updateCartButton.trigger('click');

            const $qtyInput = $(`${this._options.qtyIncrementInputSelector}`);

            if (
                !(
                    $qtyInput.attr('aria-invalid') ||
                    $qtyInput.attr('aria-invalid') === 'true'
                )
            ) {
                $updateCartButton.prop('disabled', true);
                $(`${this._options.loadingIndicatorSelector}`).removeClass(
                    'cs-no-display'
                );
            }
        }, delay);
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

        $(`${this._options.qtyIncrementButtonSelector}`).on('click', (): void =>
            this._triggerUpdate()
        );

        $(`${this._options.qtyIncrementInputSelector}`).on(
            'keydown',
            (e: KeyboardEvent): void => {
                const delay: number =
                    e.keyCode === 13
                        ? 0
                        : this._options.updateCartActionTimeout;
                this._triggerUpdate(delay);
            }
        );
    }
}
