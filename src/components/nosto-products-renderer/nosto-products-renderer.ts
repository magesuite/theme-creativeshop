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
    productDataSelector?: string;
    productCarouselOptions?: ProductsCarouselOptions;
    /**
     * Specifies amount of seconds for which the renderer checks
     * if Nosto loaded its contents
     */
    waitTime?: number;
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
        this._rendererEndpoint = this._$element.attr('data-renderer-url')
            ? this._$element.data('renderer-url')
            : '';

        if (this._rendererEndpoint.length) {
            this._initialize();
        }
    }

    /**
     * Adds nosto postrender listener and reloads recommendations to trigger it.
     * Checks if:
     * - is not already initialized
     * - nosto template contains elements with product data
     * and initializes _runProductFetch
     */
    protected _initialize(): void {
        // Check for max 15s if nosto recommendations are rendered, then fetch the carousels
        let counter = 1;

        const interval = setInterval(() => {
            if (this._$element.find(this._options.productDataSelector).length) {
                this._runProductFetch();
                clearInterval(interval);
            } else if (counter >= this._options.waitTime * 2) {
                clearInterval(interval);
            }

            counter++;
        }, 500);
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

                if (!$.isEmptyObject(response) && $dataTarget.length) {
                    $dataTarget.html(response);

                    requireAsync(['mage/cookies', 'catalogAddToCart']).then(
                        () => {
                            // Refresh the form_key for rendered html.
                            const formKey = $.mage.cookies.get('form_key');
                            $dataTarget
                                .find('input[name="form_key"]')
                                .val(formKey);

                            // Initialize Magento addToCart widget
                            $dataTarget
                                .find('[data-role=tocart-form]')
                                .catalogAddToCart();
                        }
                    );

                    this._$element.removeClass(
                        `${this._options.componentClass}--loading`
                    );

                    // Initializes the product carousel for rendered html
                    new ProductsCarousel(
                        $dataTarget.find('.cs-products-carousel').first(),
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
            this._options.productDataSelector
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
        }).then(({ content }) => {
            const productsCarouselHTML = this._replaceProductsUrlWithNosto(
                content,
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
            productDataSelector: `.cs-nosto-products__product`,
            waitTime: 15,
        },
        config
    );

    const $nostoElements = $(`.${options.componentClass}`);

    if ($nostoElements.length) {
        $nostoElements.each(function() {
            new NostoProducts($(this), options);
        });
    }

    // Adds nosto add to cart action tracking to every add to cart comming from recommendation
    requireAsync(['nostojs']).then(([nostojs]) => {
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

                // Reload the cart page when product is added form recommendation
                if ($('body').hasClass('checkout-cart-index')) {
                    location.reload();
                }
            }
        });
    });
}
