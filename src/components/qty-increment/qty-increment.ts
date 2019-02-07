import * as $ from 'jquery';

/**
 * component options interface.
 */
interface QtyIncrementOptions {
    /**
     * Namespace of the component
     * @type {string}
     * @default 'cs-'
     */
    namespace?: string;

    /**
     * Minimum input value that can be provided
     * @type {number}
     * @default 1
     */
    minValue?: number;

    /**
     * Maximum input value that can be provided
     * @type {number}
     * @default 1000000
     */
    maxValue?: number;

    /**
     * Parent selector for triggering instance update. 
     * If selector is specified update of any instance will cause trigger('change') for all instances under given selector
     * @type {string}
     * @default ''
     */
    groupParentUpdateSelector?: string;

    /**
     * Error handler method for customization of the error presentation
     * @type {() => void}
     */
    errorHandler?: () => void;
}

export default class QtyIncrement {
    protected _$element: JQuery;
    protected _$container: JQuery;
    protected _$input: JQuery;
    protected _$decrementBtn: JQuery;
    protected _$incrementBtn: JQuery;
    protected _minValue: number;
    protected _maxValue: number;
    protected _errorHandler?: () => void;
    protected _options: QtyIncrementOptions = {
        namespace: 'cs-',
        minValue: 1,
        maxValue: 1000000,
        groupParentUpdateSelector: '',
    };

    /**
     * Creates new QtyIncrement component with optional settings.
     * @param  {JQuery<HTMLElement>} $element single components' element.
     * @param  {QtyIncrementOptions} options  Optional settings object.
     */
    public constructor($element?: JQuery<HTMLElement>, options?: QtyIncrementOptions) {
        this._options = $.extend(this._options, options);
        this._$container = $element.length ? $element : $(`.${this._options.namespace}qty-increment`);
        this._$input = this._$container.find(`.${this._options.namespace}qty-increment__input`);
        this._$decrementBtn = this._$container.find(`.${this._options.namespace}qty-increment__button--decrement`);
        this._$incrementBtn = this._$container.find(`.${this._options.namespace}qty-increment__button--increment`);

        this._minValue = !isNaN(parseInt(this._$input.data('min-value'), 10)) 
            ? parseInt(this._$input.data('min-value'), 10) 
            : this._options.minValue;
        this._maxValue = !isNaN(parseInt(this._$input.data('max-value'), 10)) 
            ? parseInt(this._$input.data('max-value'), 10) 
            : this._options.maxValue;

        this._errorHandler  = this._options.errorHandler || this._defaultErrorHandler;

        if (this._$input.data('update-instances-under-parent')) {
            this._options.groupParentUpdateSelector = this._$input.data('update-instances-under-parent');
        }

        this._attachEvents();
        this._updateButtonsState();
    }

    /**
     * Update button state (disable / enable)
     */
    protected _updateButtonsState(): void {
        const currentVal: number = parseFloat(this._$input.val() as string);

        // If value of input is less than minimum, disable decrease button, otherwise, enable button
        if (currentVal <= this._minValue) {
            this._$decrementBtn
                .attr('disabled', 'disabled')
                .addClass(`${this._options.namespace}qty-increment__button--disabled`);
        } else {
            this._$decrementBtn
                .removeAttr('disabled')
                .removeClass(`${this._options.namespace}qty-increment__button--disabled`);
        }

        // If value of input is less than minimum, disable increase button, otherwise, enable button
        if (this._maxValue && currentVal >= this._maxValue) {
            this._$incrementBtn
                .attr('disabled', 'disabled')
                .addClass(`${this._options.namespace}qty-increment__button--disabled`);
        } else {
            this._$incrementBtn
                .removeAttr('disabled')
                .removeClass(`${this._options.namespace}qty-increment__button--disabled`);
        }
    }

    protected _defaultErrorHandler(): void {
        const currentVal: number = parseFloat(this._$input.val() as string);

        if (this._maxValue && currentVal > this._maxValue) {
            alert(`The maximum value is ${this._maxValue}.`);
        } else if (currentVal < this._minValue) {
            alert(`The minimum value is ${this._minValue}.`);
        }
    }

    /**
     * Shows error message and fixes value of input to min/max
     */
    protected _validate(): boolean {
        let isValid: boolean = false;
        const currentVal: number = parseFloat(this._$input.val() as string);

        if (
            currentVal < this._minValue || 
            (this._maxValue && currentVal > this._maxValue)
        ) {

            // trigger errorHandler method to show error
            this._errorHandler();

            // Set minimum/maximum after error appeared
            if (
                (this._maxValue && currentVal > this._maxValue) && 
                currentVal > this._maxValue
            ) {
                this._$input.val(this._maxValue);
            } else if (currentVal < this._minValue) {
                this._$input.val(this._minValue);
            }

            isValid = false;
        } else {
            isValid = true;
        }

        return isValid;
    }

    /**
     * Update input value if possible
     * @param e {JQuery.ClickEvent} click event
     */
    protected _updateInput(e: JQuery.ClickEvent): void {
        const $btn: JQuery<HTMLElement> = $(e.currentTarget);
        const oldVal: any = this._$input.val();
        let newVal: any;

        if ($btn.hasClass(`${this._options.namespace}qty-increment__button--increment`)) {
            newVal = parseFloat(oldVal) + 1;

            // Don't allow incrementing above maxValue
            if (this._maxValue && oldVal < this._maxValue) {
                newVal = parseFloat(oldVal) + 1;
            } else if (this._maxValue && oldVal >= this._maxValue) {
                newVal = this._maxValue;
            }
        } else {
            // Don't allow decrementing below minValue
            if (oldVal > this._minValue) {
                newVal = parseFloat(oldVal) - 1;
            } else {
                newVal = this._minValue;
            }
        }

        this._$input.val(newVal);

        // Run buttons state update function
        this._updateButtonsState();

        // If previous value of input is different than the one after user click, trigger change event.
        if (oldVal !== newVal) {
            this._triggerChange();
        }
    }

    /**
     * Triggers change on instance's input and optionaly for all instances of given parent selector
     */
    protected _triggerChange(): void {
        if (this._options.groupParentUpdateSelector.length) {
            const $parent: JQuery<HTMLElement> = $(this._options.groupParentUpdateSelector);

            if ($parent.length) {
                $parent.find(`.${this._options.namespace}qty-increment__input`)
                    .trigger('change')
                    .trigger('keyup');
            }
            
        } else {
            this._$input
                .trigger('change')
                .trigger('keyup');
        }
    }

    /**
     * Attaches events needed by component.
     */
    protected _attachEvents(): void {
        const component: any = this;

        this._$decrementBtn.on('click', (e => this._updateInput(e)));
        this._$incrementBtn.on('click', (e => this._updateInput(e)));

        this._$input.on('keyup', (): void => {
            this._validate();
            this._updateButtonsState();
        });

        this._$input.on('blur', (): void => {
            if (this._$input.val() === '') {
                this._$input.val(this._minValue);
            }

            this._updateButtonsState();
        });
    }
}
