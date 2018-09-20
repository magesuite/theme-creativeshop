import * as $ from 'jquery';
import Aftersearch from 'components/aftersearch-nav/aftersearch-nav';

/**
 * component options interface.
 */
interface aftersearchNavOptions {
    esPriceFrom?: string;
    esPriceTo?: string;
    $priceFrom?: JQuery;
    $priceTo?: JQuery;
    lockWhileLoading?: boolean;
    $loader?: JQuery;
}

export default class aftersearchNav extends Aftersearch {
    protected _$element: JQuery;
    protected _options: aftersearchNavOptions;
    protected $priceFrom: JQuery;
    protected $priceTo: JQuery;
    protected $loader: JQuery;
    protected ElasticSearchRangeSlider: any;

    public constructor($element: JQuery, options?: aftersearchNavOptions) {
        // Don't throw errors if there is no navigation on the website.
        if ($element.length === 0) {
            return;
        }

        this._options = options;
        this.$priceFrom = $('#price_from');
        this.$priceTo = $('#price_to');
        this.$loader = this._options.$loader;

        this._waitForElasticSearch();

        if (this._options.lockWhileLoading && this.$loader.length) {
            this._initializeLoader();
        }

        super($element);
    }

    protected _waitForElasticSearch(): void {
        const _this: any = this;

        const interval: any = setInterval((): boolean => {
            _this.ElasticSearchRangeSlider = $(
                '[data-role=range-price-slider-price]'
            ).data('smileEsRangeSlider');

            if (typeof _this.ElasticSearchRangeSlider === 'undefined') {
                return;
            }

            clearInterval(interval);

            _this._setInitialValues();
            _this._setInputEvents();
        }, 100);
    }

    protected _setInitialValues(): void {
        this.$priceFrom.val(this.ElasticSearchRangeSlider.from);
        this.$priceTo.val(this.ElasticSearchRangeSlider.to);
    }

    protected _setInputEvents(): void {
        const _this: any = this;

        this.$priceFrom.on('keyup', function(): void {
            _this.ElasticSearchRangeSlider.from = _this.$priceFrom.val();
        });

        this.$priceTo.on('keyup', function(): void {
            _this.ElasticSearchRangeSlider.to = _this.$priceTo.val();
        });
    }

    protected _initializeLoader(): void {
        const _this: any = this;

        $(document).on(
            'click',
            '.cs-aftersearch-nav__price-apply-button, .cs-aftersearch-nav__filter-input, .cs-aftersearch-nav__swatch-link',
            function(): void {
                _this.$loader.show();
            }
        );
    }
}

$('.cs-aftersearch-nav').each((index: number, element: HTMLElement) => {
    new aftersearchNav($(element), {
        lockWhileLoading: true,
        $loader: $('.cs-aftersearch-nav__loader'),
    });
});
