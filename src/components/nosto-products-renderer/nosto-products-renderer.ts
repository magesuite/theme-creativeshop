import * as $ from 'jquery';
import ProductsCarousel, {
    ProductsCarouselOptions,
} from 'components/products-carousel/products-carousel';

/**
 * Component options interface.
 */
export interface NostoProductsOptions {
    componentClass?: string;
    contentSelector?: string;
    productIdSelector?: string;
    productCarouselOptions?: ProductsCarouselOptions;
}

/**
 * Nosto Product component that renders magesuite carousels for nosto product recommendations.
 * Only to use with:
 * - installed magesuite-nosto-products extension (providing endpoint for getting carousel html)
 * - proper structure of nosto template, containing <span> elements with rendered product ids and contaier for the carousel
 */
class NostoProducts {
    protected _$element: JQuery;
    protected _options: NostoProductsOptions;
    protected _rendererEndpoint: string;

    /**
     * Creates new NostoProducts component with optional settings.
     * @param {JQuery} $element Optional, element to be initialized on.
     * @param {NostoProductsOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: NostoProductsOptions) {
        this._options = options;

        this._$element = $element;

        if (this._$element.length === 0) {
            return;
        }

        this._rendererEndpoint = this._$element.attr('data-renderer-url')
            ? this._$element.data('renderer-url')
            : '';

        this._initialize();
    }

    /**
     * Initializes script sequence.
     * Checks if:
     * - renderEndpoint is available
     * - nosto template contains elements with product ids
     * If both true, reloads recommendations and initializes _runProductFetch
     */
    protected _initialize(): void {
        if (
            this._rendererEndpoint.length &&
            this._$element.find(this._options.productIdSelector).length
        ) {
            this._runProductFetch();
        }
    }

    /**
     * Initializes products rendering process
     * After fetching products from BE it:
     * - removes loading modifier from component
     * - puts markup to the contentSelector defined in options
     */
    protected _runProductFetch(): void {
        this._collectIds()
            .then((ids: any): any => this._getProducts(ids))
            .then(
                (response: string): void => {
                    const $dataTarget: JQuery = this._$element.find(
                        this._options.contentSelector
                    );
                    this._$element.removeClass(
                        `${this._options.componentClass}--loading`
                    );

                    if (!$.isEmptyObject(response) && $dataTarget.length) {
                        $dataTarget.html(response);

                        // Initializes the product carousel for rendered html
                        new ProductsCarousel(
                            this._$element
                                .find('.cs-products-carousel')
                                .first(),
                            this._options.productCarouselOptions
                        );
                    }
                }
            );
    }

    /**
     * Collects information (products IDs) from template that nosto provided.
     * Then iterates through those IDs and pushes them all into Array
     * @return {Promise<Array>} Promise that resolves data collecting and as prop it returns this IDs array
     */
    protected _collectIds(): Promise<any> {
        return new Promise(resolve => {
            const ids = [];
            const $items: JQuery = this._$element.find(
                this._options.productIdSelector
            );

            for (let i: number = 0; i < $items.length; i++) {
                ids.push($items[i].innerText.trim());
            }

            resolve(ids);
        });
    }

    /**
     * Fetches HTML markup with all products that IDs was in array nosto provided using $.GET
     * @param ids {Array} Array with products IDs
     * @return {any} AJAX response with html markup of products (including PG/PC wrappers)
     */
    protected _getProducts(ids: any): any {
        return $.get(this._rendererEndpoint, {
            id: ids,
        });
    }
}

// Initializes carousels for nosto products recommendation on nosto postrender event
export default function initializeNostoProductsRenderer(
    config?: NostoProductsOptions
) {
    if (typeof nostojs !== 'undefined') {
        const options = $.extend(
            {
                componentClass: 'cs-nosto-products',
                contentSelector: `.cs-nosto-products__content`,
                productIdSelector: `.cs-nosto-products__product-id`,
            },
            config
        );

        nostojs(
            (api: any): void => {
                api.listen(
                    'postrender',
                    (nostoPostRenderEvent: any): void => {
                        $(`.${options.componentClass}`).each(function() {
                            new NostoProducts($(this), options);
                        });
                    }
                );
                // As our scripts are loaded later,
                // recommendations need to be reloaded to trigger the postrender event.
                api.loadRecommendations();
            }
        );
    }
}
