import * as $ from 'jquery';
import ProductsCarousel, {
    ProductsCarouselOptions,
} from 'components/products-carousel/products-carousel';
import requireAsync from 'utils/require-async';

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
 * Typing for Nosto product data retreived from the template
 */
interface NostoProductsData {
    ids: string[];
    urls: string[];
}

/**
 * Nosto Product component that renders magesuite carousels for Nosto recommendation integration.
 * Replaces product urls and attaches events for proper Nosto analytics tracking
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
        const productsData = this._collectNostoProductsData();

        this._getProductsCarousel(productsData).then(
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
                        this._$element.find('.cs-products-carousel').first(),
                        this._options.productCarouselOptions
                    );
                }
            }
        );
    }

    /**
     * Collects products' IDs and URLs from the Nosto template.
     * @return {NostoProductsData}
     */
    protected _collectNostoProductsData(): NostoProductsData {
        const ids = [];
        const urls = [];
        const $items: JQuery = this._$element.find(
            this._options.productIdSelector
        );

        for (let i: number = 0; i < $items.length; i++) {
            ids.push($items[i].dataset.productId.trim());
            urls.push($items[i].dataset.productUrl.trim());
        }

        return {
            ids: ids,
            urls: urls,
        };
    }

    /**
     * Fetches HTML markup with all products that IDs was in array nosto provided using $.GET
     * also replacing product urls
     * @param productsData {NostoProductsData} Array with products IDs
     * @return {string} AJAX response with html markup of products
     */
    protected _getProductsCarousel(productsData: NostoProductsData): any {
        return $.get(this._rendererEndpoint, {
            id: productsData.ids,
        }).then((response: string) => {
            const productsCarouselHTML = this._replaceProductsUrlWithNosto(
                response,
                productsData.urls
            );

            return productsCarouselHTML;
        });
    }

    /**
     * Replaces product urls in product tile anchors with the ones retreived from nosto
     * @param productsCarouselHTML {string} html of the products carousel
     * @param urls {array} array containing urls for nosto products, retreived from Nosto template
     * @return {string} html markup with replaced product urls
     */
    protected _replaceProductsUrlWithNosto(
        productsCarouselHTML: string,
        urls: string[]
    ): string {
        const $output = $(productsCarouselHTML);

        $output
            .find('a.cs-product-tile__thumbnail-link')
            .each((index, element) => {
                $(element).attr('href', urls[index]);
            });

        $output.find('a.cs-product-tile__name-link').each((index, element) => {
            $(element).attr('href', urls[index]);
        });

        return $output.html();
    }
}

// Initializes carousels for nosto products recommendation on nosto postrender event
export default function initializeNostoProductsRenderer(
    config?: NostoProductsOptions
) {
    const options = $.extend(
        {
            componentClass: 'cs-nosto-products',
            contentSelector: `.cs-nosto-products__content`,
            productIdSelector: `.cs-nosto-products__product-id`,
        },
        config
    );

    const $nostoElements = $(`.${options.componentClass}`);

    if ($nostoElements.length) {
        $nostoElements.each(function() {
            new NostoProducts($(this), options);
        });
    }

    requireAsync(['nostojs']).then(([nostojs]) => {
        // Init the carousels on every nosto postrender event
        nostojs((api): void => {
            api.listen('postrender', (nostoPostRenderEvent): void => {
                $(`.${options.componentClass}`).each(function() {
                    new NostoProducts($(this), options);
                });
            });
        });

        // Adds nosto add to cart action tracking to every add to cart comming from recommendation
        $(document).on('ajax:addToCart', function(event, data) {
            const slotId = data.form
                .closest(`.${options.componentClass}`)
                .attr('id');

            if (slotId) {
                data.productIds.forEach(function(productId) {
                    nostojs(function(api) {
                        api.recommendedProductAddedToCart(productId, slotId);
                    });
                });
            }
        });
    });
}
