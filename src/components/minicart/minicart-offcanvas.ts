import * as $ from 'jquery';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';
import offcanvas from 'components/offcanvas/offcanvas';
import ProductsCarousel, {
    ProductsCarouselOptions,
} from 'components/products-carousel/products-carousel';
import requireAsync from 'utils/require-async';
import 'mage/translate';

/**
 * Minicart component options interface.
 */
export interface MinicartOptions {
    /**
     * Defines if messages should be displayed in minicart-offcanvas
     * @default {true}
     * @type {boolean}
     */
    isMessagesOffcanvas?: boolean;

    /**
     * Defines messages container class
     * @default {page.messages}
     * @type {string}
     */
    messagesContainerClass?: string;

    /**
     * Defines message wrapper class
     * @default {cs-messages__inner}
     * @type {string}
     */
    messageWrapperClass?: string;

    /**
     * Defines message class
     * @default {cs-messages__message}
     * @type {string}
     */
    messageClass?: string;

    /**
     * Defines mini cart message html container class
     * @default {cs-minicart__messages}
     * @type {string}
     */
    messageHtmlContainerClass?: string;

    /**
     * Defines class for element after which message will be inserted
     * @default {cs-minicart__title-wrapper}
     * @type {string}
     */
    messageInsertAfterClass?: string;

    /**
     * Defines how long does the hiding animation take in ms.
     * @default {400}
     * @type {number}
     */
    messageHidingAnimationDuration?: number;

    /**
     * Defines how long does the message is displayed in ms.
     * @default {5000}
     * @type {number}
     */
    messageDisplayDuration?: number;

    /**
     * Offcanvas trigger class name.
     * @default {cs-minicart__toggle}
     * @type {string}
     */
    minicartTriggerClassName?: string;
}

interface IProductsCarouselOptions {
    /**
     * Defines class for product carousel component
     * @default {cs-minicart__carousel-wrapper}
     * @type {string}
     */
    componentWrapperClass?: string;

    /**
     * Defines options for product carousel initialization
     * @default {`.cs-minicart__carousel`}
     * @type {string}
     */
    componentClass?: string;

    /**
     * Defines options for product carousel initialization
     * @type {object}
     */
    options?: ProductsCarouselOptions;

    /**
     * Defines relation type for products to be fetched for ProductsCarousel
     * Default: related
     * Options: upsell, crosssell
     * @default {'related'}
     * @type {string}
     */
    relationType?: string;

    /**
     * Defines endpoint url for fetching ProductsCarousel html
     * @default {'products_renderer/related/carousel/'}
     * @type {string}
     */
    redererEndpoint?: string;

    /**
     * Defines class for carousel component button
     * @default {'cs-minicart__button-carousel'}
     * @type {string}
     */
    btnClass?: string;

    /**
     * Defines class for carousel component button text
     * @default {'cs-minicart__button-carousel-span'}
     * @type {string}
     */
    btnTextClass?: string;
}

/**
 * Minicart component options interface.
 */
interface IXmlSettings {
    enabled: boolean;
    open_on_product_added: boolean;
    products_carousel: {
        enabled: boolean;
        relation_type: boolean;
        button_dynamic_url: boolean;
    };
}

/**
 * Ajax response interface.
 */
interface AjaxResponse {
    content: string;
    category: {
        name: string;
        url: string;
    };
}

/**
 * Minicart component
 */
export default class Minicart {
    protected _xmlSettings: IXmlSettings;
    protected _$minicart: JQuery;
    protected _$messagesContainer: JQuery<HTMLElement>;
    protected _$message: JQuery<HTMLElement>;
    protected _$messageHtmlContainer: JQuery<HTMLElement>;
    protected _$minicartMessageContainer: JQuery<HTMLElement>;
    protected _offcanvasMinicart: offcanvas;
    protected _$minicartTrigger: JQuery;
    protected _productsCarouselOptions?: IProductsCarouselOptions;
    protected _areEventsBound: boolean;
    protected _options: MinicartOptions;
    protected _endpointUrl: JQueryDeferred<string> = jQuery.Deferred();

    /**
     * Creates new Minicart component with optional settings.
     * @param  {MinicartOptions} options  Optional settings object.
     */
    public constructor(
        options?: MinicartOptions,
        productsCarouselOptions?: IProductsCarouselOptions
    ) {
        this._options = $.extend(
            true,
            {},
            {
                isMessagesOffcanvas: true,
                messagesContainerClass: 'page.messages',
                messageWrapperClass: 'cs-messages__inner',
                messageClass: 'cs-messages__message',
                messageHtmlContainerClass: 'cs-minicart__messages',
                messageInsertAfterClass: 'cs-minicart__title-wrapper',
                messageHidingAnimationDuration: 400,
                messageDisplayDuration: 5000,
                minicartTriggerClassName: 'cs-minicart__toggle',
            },
            options
        );

        this._xmlSettings = deepGet(
            viewXml,
            'vars.Magento_Checkout.minicart_offcanvas'
        );

        if (!this._xmlSettings.enabled) {
            return;
        }

        this._setEndpointUrl();

        this._productsCarouselOptions = $.extend(
            true,
            {},
            {
                componentWrapperClass: 'cs-minicart__carousel-wrapper',
                componentClass: 'cs-minicart__carousel',
                relationType: this._xmlSettings.products_carousel.relation_type,
                redererEndpoint: 'products_renderer/related/carousel',
                btnClass: 'cs-minicart__button-carousel',
                btnTextClass: 'cs-minicart__button-carousel-span',
            },
            productsCarouselOptions
        );

        this._$minicartTrigger = $(
            `.${this._options.minicartTriggerClassName}`
        );
        this._$minicart = $("[data-block='minicart']");
        this._$messagesContainer = $(
            `.${this._options.messagesContainerClass}`
        );
        this._$message = null;
        this._$messageHtmlContainer = $(
            `<div class="${this._options.messageHtmlContainerClass}"></div>`
        );
        this._$minicartMessageContainer = null;

        this._offcanvasMinicart = new offcanvas(null, {
            className: 'cs-offcanvas--mini-cart',
            triggerClassName: `${this._options.minicartTriggerClassName}`,
        });

        this._$minicart.on('contentUpdated click touchstart', (): void => {
            if (!this._areEventsBound) {
                this._addEvents();
                this._areEventsBound = true;
            }
        });

        this._$minicart.on('productAdded', (e: Event, cartData: any): void => {
            if (this._xmlSettings.open_on_product_added) {
                if (!this._isMinicartOpen()) {
                    this._offcanvasMinicart.show();
                }

                if (this._options.isMessagesOffcanvas) {
                    this._clearMinicartMessage();
                    requireAsync(['Magento_Ui/js/lib/view/utils/async']).then(
                        ([async]) => {
                            $.async(
                                `.${this._options.messagesContainerClass} .${this._options.messageClass}`,
                                () => this._cloneAddToCartMessage()
                            );
                        }
                    );
                }
            }

            if (
                this._xmlSettings.open_on_product_added &&
                this._xmlSettings.products_carousel.enabled
            ) {
                this._runProductFetch();
            }
        });
    }

    /**
     * Clone and insert add to cart message to minicart offcanvas
     */
    protected _cloneAddToCartMessage(): void {
        // Clone message
        this._$message = this._$messagesContainer.find(
            `.${this._options.messageWrapperClass}`
        );
        this._$message.clone().appendTo(this._$messageHtmlContainer);

        // Clear main message wrapper
        this._$message.empty();

        // Insert cloned message HTML into offcanvas minicart
        this._$messageHtmlContainer.insertAfter(
            `.${this._options.messageInsertAfterClass}`
        );

        // Hide minicart message with animation.
        this._hideMinicartMessage();

        // Restore minicart message container visibility
        this._showMinicartMessage();
    }

    /**
     * Show minicart message.
     */
    protected _showMinicartMessage(): void {
        this._$minicart
            .find(`.${this._options.messageHtmlContainerClass}`)
            .show();
    }

    /**
     * Hide minicart message with slideUp animation.
     */
    protected _hideMinicartMessage(): void {
        this._$minicartMessageContainer = this._$minicart.find(
            `.${this._options.messageHtmlContainerClass}`
        );

        setTimeout(() => {
            this._$minicartMessageContainer.slideUp(
                this._options.messageHidingAnimationDuration,
                () => this._clearMinicartMessage()
            );
        }, this._options.messageDisplayDuration);
    }

    /**
     * Clear minicart message container if exist.
     */
    protected _clearMinicartMessage(): void {
        this._$minicartMessageContainer = this._$minicart.find(
            `.${this._options.messageHtmlContainerClass}`
        );
        if (this._$minicartMessageContainer.length) {
            this._$minicartMessageContainer.empty();
        }
    }

    /**
     * Initializes products rendering process
     * After fetching products from BE it:
     * - puts markup to the componentClass element defined in options
     */
    protected _runProductFetch(): void {
        this._getCartData().then(productId => {
            const $carouselWrapper: JQuery = this._$minicart.find(
                `.${this._productsCarouselOptions.componentWrapperClass}`
            );

            if (!$carouselWrapper.length) return;

            $carouselWrapper
                .removeClass(
                    `${this._productsCarouselOptions.componentWrapperClass}--ready`
                )
                .addClass(
                    `${this._productsCarouselOptions.componentWrapperClass}--loading`
                );

            this._getProductsCarousel(productId).then(
                (response: AjaxResponse): void => {
                    const $dataTarget: JQuery = this._$minicart.find(
                        `.${this._productsCarouselOptions.componentClass}`
                    );

                    if (!$.isEmptyObject(response) && $dataTarget.length) {
                        $carouselWrapper.removeClass(
                            `${this._productsCarouselOptions.componentWrapperClass}--loading`
                        );

                        const responseCarouselHTML: string = response.content;
                        const $carouselSlides = $(responseCarouselHTML).find(
                            '.cs-products-carousel__slide'
                        );

                        if ($carouselSlides.length) {
                            $carouselWrapper.addClass(
                                `${this._productsCarouselOptions.componentWrapperClass}--ready`
                            );

                            $dataTarget.empty();
                            $dataTarget.html(responseCarouselHTML);

                            // Initializes the product carousel for rendered html
                            new ProductsCarousel(
                                this._$minicart.find('.cs-products-carousel'),
                                this._productsCarouselOptions.options
                            );

                            requireAsync([
                                'mage/cookies',
                                'catalogAddToCart',
                            ]).then(() => {
                                // Refresh the form_key for rendered html.
                                const formKey = $.mage.cookies.get('form_key');
                                $dataTarget
                                    .find('input[name="form_key"]')
                                    .val(formKey);

                                // Initialize Magento addToCart widget
                                $dataTarget
                                    .find('[data-role=tocart-form]')
                                    .catalogAddToCart();
                            });

                            if (
                                this._xmlSettings.products_carousel
                                    .button_dynamic_url
                            ) {
                                this._dynamicRedirect(response.category);
                            }
                        }
                    }
                }
            );
        });
    }

    /**
     * Fetches data from cart object regarding product that has been added to the cart at the moment.
     * @return Resolved promise with number of products in cart
     */
    protected _getCartData(): any {
        const deferred: JQueryDeferred<any> = jQuery.Deferred();
        requirejs(['Magento_Customer/js/customer-data'], customerData => {
            customerData.get('cart').subscribe((data: any): void => {
                if (Array.isArray(data.items) && data.items.length) {
                    deferred.resolve(data.items[0].product_id);
                }
            });
        });
        return deferred;
    }

    /**
     * Sets URL for carousel endpoint
     * @return  Resolved promise with URL for carousel endpoint
     */
    protected _setEndpointUrl() {
        requirejs(['mage/url'], mageUrl => {
            mageUrl.setBaseUrl(window.BASE_URL);

            this._endpointUrl.resolve(
                mageUrl.build(
                    `${this._productsCarouselOptions.redererEndpoint}`
                )
            );
        });
    }

    /**
     * Fetches (from `this._getCartData`) HTML markup with all products
     * that matches provided relation type (related/upsell/crosssel) to provided product ID
     * @return {string} AJAX response with html markup of products
     */
    protected _getProductsCarousel(productId: any): any {
        return this._endpointUrl.then(endpointUrl => {
            return $.get(endpointUrl, {
                id: productId,
                relation_type: this._productsCarouselOptions.relationType,
            }).then((response: AjaxResponse) => {
                return response;
            });
        });
    }

    /**
     * Check if minicart is open
     */
    protected _isMinicartOpen(): boolean {
        return this._$minicartTrigger.attr('aria-expanded') === 'true';
    }

    /**
     * Attach event to carousel btn in order to use
     * dynamic redirection to category page
     */
    protected _dynamicRedirect(response: any): void {
        if (response == null) return;

        $(`.${this._productsCarouselOptions.btnTextClass}`).text(
            $.mage.__('View all %1').replace('%1', response.name)
        );

        $(`.${this._productsCarouselOptions.btnClass}`)
            .off()
            .removeClass('btn-minicart-close')
            .attr('data-url', response.url)
            .on('click', (event: JQuery.ClickEvent): void => {
                const $target: JQuery = $(event.target);

                if (
                    $target.closest(
                        `.${this._productsCarouselOptions.btnClass}`
                    ).length
                ) {
                    event.preventDefault();
                }
                window.location.href = response.url;
            });
    }

    /**
     * Attach events to minicart
     */
    protected _addEvents(): void {
        $('#btn-minicart-close, .btn-minicart-close').on(
            'click',
            (event: JQuery.ClickEvent): void => {
                const $target: JQuery = $(event.target);

                if ($target.closest('.btn-minicart-close').length) {
                    event.preventDefault();
                }
                this._offcanvasMinicart.hide();
            }
        );
    }
}
