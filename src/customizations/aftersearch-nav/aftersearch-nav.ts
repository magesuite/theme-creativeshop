import $ from 'jquery';

/**
 * component options interface.
 */
interface aftersearchNavOptions {
    esPriceFrom: string;
    esPriceTo: string;
    $priceFrom: JQuery;
    $priceTo: JQuery;
}

export default class aftersearchNav {
    protected _options: aftersearchNavOptions;
    protected $priceFrom: JQuery;
    protected $priceTo: JQuery;
    protected ElasticSearchRangeSlider: any;

    public constructor( options?: aftersearchNavOptions ) {
        this._options = options;

        this.$priceFrom = $( '#price_from' );
        this.$priceTo = $( '#price_to' );
        
        this._waitForElasticSearch();
    }

    protected _waitForElasticSearch(): void {
        const _this: any = this;

        const interval: any = setInterval( (): boolean => {
            _this.ElasticSearchRangeSlider = $( '[data-role=range-price-slider-price]' ).data( 'smileEsRangeSlider' );

            if ( typeof _this.ElasticSearchRangeSlider === 'undefined' ) return;

            clearInterval( interval );

            _this._setInitialValues();
            _this._setInputEvents();
        }, 100 );
    }

    protected _setInitialValues(): void {
        console.log( this.ElasticSearchRangeSlider );

        this.$priceFrom.val( this.ElasticSearchRangeSlider.from );
        this.$priceTo.val( this.ElasticSearchRangeSlider.to );
    }

    protected _setInputEvents(): void {
        const _this: any = this;

        this.$priceFrom.on( 'keyup', function(): void {
            _this.ElasticSearchRangeSlider.from = _this.$priceFrom.val();
        } );

        this.$priceTo.on( 'keyup', function(): void {
            _this.ElasticSearchRangeSlider.to = _this.$priceTo.val();
        } );
    }
}

new aftersearchNav();
