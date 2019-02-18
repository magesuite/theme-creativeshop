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
}

export default class QtyIncrement {
    protected _$element: JQuery;
    protected _$input: JQuery;
    protected _$decrementBtn: JQuery;
    protected _$incrementBtn: JQuery;

    protected _initialValue: number;
    protected _minValue: number;
    protected _maxValue: number;
    protected _step: number;

    protected _options: QtyIncrementOptions = {
        minValue: 1,
        maxValue: Infinity,
        step: 1,
        inputClassName: 'cs-qty-increment__input',
        incrementButtonClassName: 'cs-qty-increment__button--increment',
        decrementButtonClassName: 'cs-qty-increment__button--decrement',
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

        this._toggleButtons();
        this._attachEvents();
    }

    /**
     * Returns current value of the input.
     */
    public getValue(): number {
        return Number(this._$input.val());
    }

    /**
     * Sets input value to given number.
     * @param value New input value.
     */
    public setValue(value: number) {
        this._$input
            .val(value)
            .trigger('input')
            .trigger('change');
    }

    /**
     * Increments input value by specified step if possible.
     */
    public increment(): void {
        const value: number = this.getValue();
        const newValue: number = Math.min(value + this._step, this._maxValue);

        if (newValue === value) {
            return;
        }

        this.setValue(newValue);
        this._toggleButtons();
    }

    /**
     * Decrements input value by specified step if possible.
     */
    public decrement(): void {
        const value: number = this.getValue();
        const newValue: number = Math.max(value - this._step, this._minValue);

        if (newValue === value) {
            return;
        }

        this.setValue(newValue);
        this._toggleButtons();
    }

    /**
     * Toggles buttons disabled state depending on current value of the input.
     */
    protected _toggleButtons(): void {
        const value: number = this.getValue();

        const isDecrementDisabled = value <= this._minValue;
        const isIncrementDisabled = value >= this._maxValue;

        this._$decrementBtn.prop('disabled', isDecrementDisabled);
        this._$incrementBtn.prop('disabled', isIncrementDisabled);
    }

    protected _resetValue(): void {
        if (this._$input.val() === '') {
            this.setValue(this._initialValue);
        }
    }

    /**
     * Attaches events needed by component.
     */
    protected _attachEvents(): void {
        this._$decrementBtn.on('click', this.decrement.bind(this));
        this._$incrementBtn.on('click', this.increment.bind(this));

        this._$input.on('input change', this._toggleButtons.bind(this));
        this._$input.on('blur', this._resetValue.bind(this));
    }
}
