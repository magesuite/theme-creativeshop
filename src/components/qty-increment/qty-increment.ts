import * as $ from 'jquery';

/**
 * Component options interface.
 */
interface QtyIncrementOptions {
    /**
     * Minimum input value that can be provided.
     * @default 1
     */
    minValue?: number;

    /**
     * Maximum input value that can be provided.
     * @default Infinity
     */
    maxValue?: number;

    /**
     * How much value should increase or decrease when clicking buttons.
     * @default 1
     */
    step?: number;

    /**
     * Name of the class for input field.
     * @default cs-qty-increment__input
     */
    inputClassName?: string;

    /**
     * Name of the class for increment button.
     * @default cs-qty-increment__button--increment
     */
    incrementButtonClassName?: string;

    /**
     * Name of the class for decrement button.
     * @default cs-qty-increment__button--decrement
     */
    decrementButtonClassName?: string;

    /**
     * Name of the class for disable button.
     * @default cs-qty-increment__button--disabled
     */
    disabledButtonClassName?: string;

    /**
     * Name of the class for distinguishing cart-page view.
     * @default checkout-cart-index
     */
    cartPageClassIdentifier?: string;
}

export default class QtyIncrement {
    protected _$element: JQuery;
    protected _$input: JQuery;
    protected _$decrementBtn: JQuery;
    protected _$incrementBtn: JQuery;

    protected _initialValue: number | string;
    protected _minValue: number;
    protected _maxValue: number;
    protected _step: number;
    protected _isShoppingCart: boolean;

    protected _options: QtyIncrementOptions = {
        minValue: 1,
        maxValue: Infinity,
        step: 1,
        inputClassName: 'cs-qty-increment__input',
        incrementButtonClassName: 'cs-qty-increment__button--increment',
        decrementButtonClassName: 'cs-qty-increment__button--decrement',
        disabledButtonClassName: 'cs-qty-increment__button--disabled',
        cartPageClassIdentifier: 'checkout-cart-index',
    };

    /**
     * Creates new QtyIncrement component with optional settings.
     * @param $element Element to initialize component on.
     * @param options Custom options for the component.
     */
    public constructor(
        $element?: JQuery<HTMLElement>,
        options?: QtyIncrementOptions
    ) {
        this._options = $.extend(this._options, options);

        this._$element = $element || $('.cs-qty-increment');
        this._$input = this._$element.find(`.${this._options.inputClassName}`);
        this._$decrementBtn = this._$element.find(
            `.${this._options.decrementButtonClassName}`
        );
        this._$incrementBtn = this._$element.find(
            `.${this._options.incrementButtonClassName}`
        );

        this._initialValue = this.getValue();

        const minValue = this._$input.attr('min');
        this._minValue =
            minValue !== undefined ? Number(minValue) : this._options.minValue;

        const maxValue = this._$input.attr('max');
        this._maxValue =
            maxValue !== undefined ? Number(maxValue) : this._options.maxValue;

        const step = this._$input.attr('step');
        this._step = step !== undefined ? Number(step) : this._options.step;

        this._isShoppingCart =
            document.body.classList.value.indexOf(
                this._options.cartPageClassIdentifier
            ) !== -1;

        this._attachEvents();
    }

    /**
     * Returns current value of the input.
     */
    public getValue(): number {
        return +this._$input.val();
    }

    /**
     * Sets input value to given number.
     * @param value New input value.
     */
    public setValue(value: number) {
        this._$input.val(value).trigger('input').trigger('change');
    }

    /**
     * Increments input value by specified step if possible.
     */
    public increment(): void {
        const value: number = this.getValue();

        let newValue: number = Math.min(value + this._step, this._maxValue);

        if (newValue > this._maxValue) {
            return;
        }

        if (value === this._minValue - 1) {
            newValue = this._minValue;
        }

        this.setValue(newValue);
    }

    /**
     * Decrements input value by specified step if possible.
     */
    public decrement(): void {
        const value: number = this.getValue();

        let newValue: number = Math.max(value - this._step, this._minValue);

        if (value === this._minValue || value === 0) {
            // Set Qty = 0 (remove product) when user click decrement with current minimum Qty value within cart-page view
            !this._isShoppingCart
                ? (newValue = this._minValue)
                : (newValue = 0);
        }

        this.setValue(newValue);
    }

    /**
     * Reset values on input blur for scenarios:
     * - if input is empty: set minimal value,
     * - if input value < minimal value: set minimal value
     *   or let pass the new value if in cart-page view to remove item,
     * - if input value > maximal value: set the maximal value
     *
     * @protected
     */
    protected _resetValue(): void {
        const value = this._$input.val();

        if (value === '') {
            this.setValue(this._initialValue);
        } else if (value < this._minValue && !this._isShoppingCart) {
            this.setValue(this._minValue);
        } else if (this._maxValue && value > this._maxValue) {
            this.setValue(this._maxValue);
        }
    }

    /**
     * Attaches events needed by component.
     */
    protected _attachEvents(): void {
        this._$decrementBtn.on('click', this.decrement.bind(this));
        this._$incrementBtn.on('click', this.increment.bind(this));

        this._$input.on('blur', this._resetValue.bind(this));
    }
}
