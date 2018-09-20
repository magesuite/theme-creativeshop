import $ from 'jquery';

/**
 * component options interface.
 */
interface QtyIncrementOptions {
    /**
     * Namespace of the component. Default is 'cs-'
     * @type {string}
     */
    namespace?: string;

    /**
     * Minimum input value that can be provided. Default is 1
     * @type {number}
     */
    minValue?: number;

    /**
     * Maximum input value that can be provided. Default is 10
     * @type {number}
     */
    maxValue?: number;

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
    protected _eventListeners: {
        clickListener?: ( $btn: JQuery ) => void;
        keydownListener?: ( e: Event ) => void;
        keyupListener?: () => void;
        blurListener?: () => void;
    } = {};
    protected _errorHandler?: () => void;
    protected _options: QtyIncrementOptions;

    /**
     * Creates new QtyIncrement component with optional settings.
     * @param  {QtyIncrementOptions} options  Optional settings object.
     */
    public constructor( $element?: JQuery, options?: QtyIncrementOptions ) {
        this._options           = $.extend( this._options, options );
        this._options.namespace = this._options.namespace || 'cs-';

        this._$container        = $element || $( `.${this._options.namespace}qty-increment` );
        this._$input            = this._$container.find( `.${this._options.namespace}qty-increment__input` );
        this._$decrementBtn     = this._$container.find( `.${this._options.namespace}qty-increment__button--decrement` );
        this._$incrementBtn     = this._$container.find( `.${this._options.namespace}qty-increment__button--increment` );

        const minValue = this._$input.data( 'min-value' );
        this._minValue          = typeof minValue === 'number' ? minValue : 1;
        this._maxValue          = parseInt( this._$input.data( 'max-value' ) ) || null;

        this._errorHandler      = this._options.errorHandler || this._defaultErrorHandler;

        this._attachEvents();
        this._updateButtonsState();
    }

    /**
     * Upddate button state (disable / enable)
     */
    protected _updateButtonsState(): void {
        const currentValue: any = this._$input.val();

        // If value of input is less than minimum, disable decrease button, otherwise, enable button
        if ( currentValue <= this._minValue ) {
            this._$container.find( $( `.${this._options.namespace}qty-increment__button--decrement` ) ).attr( 'disabled', 'disabled' ).addClass( `${this._options.namespace}qty-increment__button--disabled` );
        } else {
            this._$container.find( $( `.${this._options.namespace}qty-increment__button--decrement` ) ).removeAttr( 'disabled' ).removeClass( `${this._options.namespace}qty-increment__button--disabled` );
        }

        // If value of input is less than minimum, disable increase button, otherwise, enable button
        if ( this._maxValue &&currentValue >= this._maxValue ) {
            this._$container.find( $( `.${this._options.namespace}qty-increment__button--increment` ) ).attr( 'disabled', 'disabled' ).addClass( `${this._options.namespace}qty-increment__button--disabled` );
        } else {
            this._$container.find( $( `.${this._options.namespace}qty-increment__button--increment` ) ).removeAttr( 'disabled' ).removeClass( `${this._options.namespace}qty-increment__button--disabled` );
        }
    }

    protected _defaultErrorHandler(): void {
        if ( this._maxValue && parseFloat( this._$input.val() ) > this._maxValue ) {
            alert( `The maximum value is ${this._maxValue}.` );
        } else if ( parseFloat( this._$input.val() ) < this._minValue ) {
            alert( `The minimum value is ${this._minValue}.` );
        }
    }

    /**
     * Shows error message and fixes value of input to min/max
     */
    protected _validate(): boolean {
        let isValid: boolean = false;

        if ( parseFloat( this._$input.val() ) < this._minValue || ( this._maxValue && parseFloat( this._$input.val() )  > this._maxValue ) ) {

            // trigger errorHandler method to show error
            this._errorHandler();

            // Set minimum/maximum after error appeared
            if ( ( this._maxValue && parseFloat( this._$input.val() )  > this._maxValue ) && parseFloat( this._$input.val() ) > this._maxValue ) {
                this._$input.val( this._maxValue );
            } else if ( parseFloat( this._$input.val() ) < this._minValue ) {
                this._$input.val( this._minValue );
            }

            isValid = false;
        } else {
            $( document ).trigger( `.${this._options.namespace}qty-increment:change`, this._$input );
            isValid = true;
        }

        return isValid;
    }

    /**
     * Attaches events needed by component.
     */
    protected _attachEvents(): void {
        const component: any = this;

        this._eventListeners.clickListener = ( $btn: JQuery ): void => {
            const oldValue: any = this._$input.val();
            let newVal: any;

            if ( $btn.get( 0 ) === this._$incrementBtn.get( 0 ) ) {
                newVal = parseFloat( oldValue ) + 1;

                // Don't allow incrementing above maxValue
                if ( this._maxValue && oldValue < this._maxValue ) {
                    newVal = parseFloat( oldValue ) + 1;
                } else if ( this._maxValue && oldValue >= this._maxValue ) {
                    newVal = this._maxValue;
                }

            } else {

                // Don't allow decrementing below minValue
                if ( oldValue > this._minValue ) {
                    newVal = parseFloat( oldValue ) - 1;
                } else {
                    newVal = this._minValue;
                }
            }

            this._$input.val( newVal );

            // Run buttons state update function
            this._updateButtonsState();

            // If previous value of input is different than the one after user click, trigger change event.
            if ( oldValue !== newVal ) {
                $( document ).trigger( `.${this._options.namespace}qty-increment:change`, this._$input );
                this._$input.trigger( 'change' );
            }
        };

        this._eventListeners.keydownListener = ( e: KeyboardEvent ): void => {
            // Allow: backspace, delete, tab, escape, enter and .
            if ( $.inArray( e.keyCode, [ 46, 8, 9, 27, 13, 110, 190 ] ) !== -1 ||

                // Allow: Ctrl+A
                ( e.keyCode === 65 && e.ctrlKey === true ) ||

                // Allow: Ctrl+C
                ( e.keyCode === 67 && e.ctrlKey === true ) ||

                // Allow: Ctrl+X
                ( e.keyCode === 88 && e.ctrlKey === true ) ||

                // Allow: home, end, left, right
                ( e.keyCode >= 35 && e.keyCode <= 39 ) ) {

                // Let it happen, don't do anything
                return;
            }

            // Ensure that it is a number and stop the keypress
            if ( ( e.shiftKey || ( e.keyCode < 48 || e.keyCode > 57 ) ) && ( e.keyCode < 96 || e.keyCode > 105 ) ) {
                e.preventDefault();
            }
        };

        this._eventListeners.keyupListener = (): void => {
            this._validate();
            this._updateButtonsState();
        };

        this._eventListeners.blurListener = (): void => {
            if ( this._$input.val() === '' ) {
                this._$input.val( this._minValue );
            }
            this._updateButtonsState();
        };

        this._$decrementBtn.on( 'click', function(): void {
            component._eventListeners.clickListener( $( this ) );
        } );
        this._$incrementBtn.on( 'click', function(): void {
            component._eventListeners.clickListener( $( this ) );
        } );
        this._$input.on( 'keydown', this._eventListeners.keydownListener );
        this._$input.on( 'keyup', this._eventListeners.keyupListener );
        this._$input.on( 'blur', this._eventListeners.blurListener );
    }
}
