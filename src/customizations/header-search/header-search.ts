export default class AutosuggestFocus {
    protected _$input: JQuery;
    protected wasCalled: boolean;

    public constructor( $input: JQuery ) {
        this._$input = $input;
        this.wasCalled = false;

        const _this: any = this;
        if ( this._$input ) {
            this._$input.addEventListener( 'blur', function( event ): void {
                if ( event.originalEvent === undefined && !_this.wasCalled ) {
                    this.focus();
                    _this.wasCalled = true;
                }
            } );
        }
    }
}

new AutosuggestFocus( document.querySelector( '#search' ) );
