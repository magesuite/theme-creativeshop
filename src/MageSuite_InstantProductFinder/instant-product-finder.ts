import * as $ from 'jquery';
import 'mage/translate';
import { productTemplate } from './product-template';

/**
 * Product finder instantly displays products based on the user's choice of attribute options
 *
 * How it works:
 * In the corresponding template, finder steps are defined. Every step display one attribute with all its options
 * After all query options are checked by a user request to the backend is performed and products are fetched and rendered (but not displayed)
 *
 * There can be different kinds of attributes.
 * Filter (attribute) types:
 *
 * - query - these are base filters, which selection is required to fetch the products. It is only possible to select one of the options for the query filter (e.g. either cat or dog).. Query filters are always required
 * TODO With the current logic it should be possible to not have any query filters and perform requests at the beginning. It should be even possible to render the tile server side (only SKU as tile ID needed). However, I was not able to check this.
 * - combined - filter products to show only these, that contain all the selected options - e.g allergens in food filter, in which you select that a product should not contain both, sesame and soya.
 * - separated - they filter products, that fulfil some of the selected options (like yellow and orange for a shirt colour).
 * - combined and separate filters can be additionally marked as required or optional. Required filter means that next steps and products won't be shown after at least one option is checked for this step. Not required filters can stay unchecked. It is important to place required filters first, and not required filters should follow.
 *
 * Product finder has 2 main phases:
 *
 * 1. Gathering query values - by choosing some initial (query) options user defines the initial scope of products he's interested in.
 * 2. Filtering the results - after the user checks the following filters, active/available/disabled options are recalculated and filters state is updated as well as all the products that meet the criteria are shown.
 *
 * After a response with data is received from BE, the following data structures are prepared:
 *
 * - _allAttributes - Set of all attributes that exist for fetched products
 * - _mappedOptionsToProducts - Object with option ids as keys and array of product SKUs as value
 * - _mappedProductsToOptions - Object with product SKUs as key and array of option IDs as value
 *
 * Every time when filter option is checked/unchecked the following data structures are updated
 *
 * - _activeCombinedOptions - Set with all options id that are either initial(query) or comes from combined attributes(steps)
 * - _activeSeparateOptions - Object with names of steps as keys and set of active options ad value
 * - _activeProducts - Set of products to be shown
 *
 * The other part of the logic is related to the visual effects - scrolling to the current step, showing the next step, etc.
 */

interface ISelectors {
    elementLoadingClass: string;
    product: string;
    products: string;
    step: string;
    filter: string;
    attributes: string;
    clear: string;
    reset: string;
}

export default class InstantProductFinder {
    private _element: HTMLElement;
    private _initialQuery: object = {};
    private _currentQuery: object = {};
    private _allAttributes: Set<string> = new Set(); // Set of all attributes that exits for fetched products
    private _mappedOptionsToProducts: object = {}; // Object with option ids as keys and array of product skus as value
    private _mappedProductsToOptions: object = {}; // Object with product skus as key and array of option ids as value
    private _activeCombinedOptions: Set<string> = new Set(); // All options from this set are required for products to be shown
    private _activeSeparateOptions: object = {}; // A product has to have at least one option from each set to be shown
    private _activeProductsAllAttrs: Set<string> = new Set();
    private _notActiveProductsAllAttrs: Set<string> = new Set();
    private _activeProducts: Set<string> = new Set(); // Set of active products 9to be shown)
    private _productsAreFetched: boolean = false;
    private _isLoading: boolean = false;
    private _selectors: ISelectors = {
        elementLoadingClass: 'cs-instant-product-finder--loading',
        product: '.cs-instant-product-finder__product',
        products: '#products',
        step: '.cs-instant-product-finder__step',
        filter: '*[data-finder-role="filter"]',
        attributes: '*[data-finder-role="attributes"]',
        clear: '*[data-finder-role="clear"]',
        reset: '*[data-finder-role="reset"]',
    };
    private _endpoints: { fetchProducts: string } = {
        fetchProducts: window.BASE_URL + 'ipf/product/json',
    };

    /**
     * Create Instant Product Finder Instance and setEvents
     */
    public constructor(element: HTMLElement, options?: any) {
        this._element = element;

        this._element
            .querySelectorAll('[data-finder-step-type="query"]')
            .forEach((element: HTMLElement) => {
                this._initialQuery[
                    element.getAttribute('data-finder-step-attribute-code')
                ] = '';
            });
        this._currentQuery = this._initialQuery;

        this._setEvents();
        this._element.classList.remove(this._selectors.elementLoadingClass);
    }

    /**
     * Fetch products based on query
     */
    protected _fetchProducts(): void {
        let query = '';
        for (const [key, value] of Object.entries(this._currentQuery)) {
            query = `${query}/${key}/${value}`;
        }

        this._isLoading = true;
        this._element.classList.add(this._selectors.elementLoadingClass);

        $.ajax({
            method: 'GET',
            url: `${this._endpoints.fetchProducts}${query}`,
            cache: true,
        })
            .done((response) => {
                this._onProductsFetched(Object.values(response));
                this._isLoading = false;
            })
            .fail((response) => {
                // tslint:disable-next-line
                console.warn('There is a problem with fetching products.');
            });
    }

    /**
     * Adjust received data, do some initial tasks (render products, hide attributes that are not assigned to any product), update state
     */
    protected _onProductsFetched(response: object[]): void {
        this._productsAreFetched = true;

        this._prepareData(response);

        this._renderProducts(response).then(() => {
            this._hideUnusedOptions();
            this._updateState();
            this._element.classList.remove(this._selectors.elementLoadingClass);
            this._handleStepsVisibility();
        });
    }

    /**
     * Prepare two objects with data:
     * _mappedOptionsToProducts - object with option ids as keys and set of product skus as value
     * _mappedProductsToOptions - objects with product skus as keys and set of option ids as value
     */
    protected _prepareData(data: object[]): void {
        data.forEach((product: object) => {
            product.options.forEach((option) => {
                this._allAttributes.add(option);

                if (!this._mappedOptionsToProducts[option]) {
                    this._mappedOptionsToProducts[option] = new Set();
                }

                this._mappedOptionsToProducts[option].add(product.sku);

                if (!this._mappedProductsToOptions[product.sku]) {
                    this._mappedProductsToOptions[product.sku] = new Set();
                }

                this._mappedProductsToOptions[product.sku].add(option);
            });
        });
    }

    /**
     * Render all products fetched from the backend (they are hidden till they receive active class)
     */
    protected async _renderProducts(data: object[]): Promise<any> {
        const { default: requireAsync } = await import('utils/require-async');

        const $productsContainer = $(this._selectors.products);
        $productsContainer.empty();

        return requireAsync(['mage/template']).then(([mageTemplate]) => {
            data.forEach((product: object) => {
                $productsContainer.append(
                    mageTemplate(productTemplate, product)
                );
            });
        });
    }

    /**
     * At the beginning all attributes are shown.
     * We would like to hide attributes that are not assigned to any product
     */
    protected _hideUnusedOptions(): void {
        for (const id of Object.keys(this._mappedOptionsToProducts)) {
            this._element
                .querySelector(`#option-${id}`)
                ?.classList.remove('hidden');
        }
    }

    /**
     * Update state based on: this._currentQuery, this._activeCombinedOptions
     */
    protected _updateState(): void {
        this._prepareFiltersAndProductsState();
        this._handleFiltersVisibility();
        this._handleProductsVisibility();
        this._setProductsCount();
    }

    /**
     * the most important part of the logic.
     * Check if every product has all active attributes.
     * If the product meets all criteria - add class active
     * and add all its attributes to this._activeProductsAllAttrs.
     */
    protected _prepareFiltersAndProductsState(): void {
        this._activeProductsAllAttrs.clear();
        this._notActiveProductsAllAttrs.clear();
        this._activeProducts.clear();

        for (const [sku, attributes] of Object.entries(
            this._mappedProductsToOptions
        )) {
            if (
                this._productHasAllCombinedOptions(attributes) &&
                this._productHasAtLeastOneSeparateOptionsFromEachSet(attributes)
            ) {
                this._activeProducts.add(sku);

                attributes.forEach((option) => {
                    this._activeProductsAllAttrs.add(option);
                });
            } else {
                attributes.forEach((option) => {
                    this._notActiveProductsAllAttrs.add(option);
                });
            }
        }
    }

    /**
     * Check if product has at least one option from each separate set.
     */
    protected _productHasAtLeastOneSeparateOptionsFromEachSet(
        attributes: Set<string>
    ): boolean {
        let productHasAtLeastOneSeparateOptionsFromEachSet = !Object.keys(
            this._activeSeparateOptions
        ).length;

        productHasAtLeastOneSeparateOptionsFromEachSet = Object.values(
            this._activeSeparateOptions
        ).every((step: object) => {
            return Array.from(step).some((option: string) =>
                attributes.has(option)
            );
        });

        return productHasAtLeastOneSeparateOptionsFromEachSet;
    }

    /**
     * Check if product must has all active combined attributes
     */
    protected _productHasAllCombinedOptions(attributes: Set<string>): boolean {
        let productHasAllCombinedOptions = true;

        this._activeCombinedOptions.forEach((option: string) => {
            if (!attributes.has(option)) {
                productHasAllCombinedOptions = false;
                return;
            }
        });

        return productHasAllCombinedOptions;
    }

    protected _updateActiveFiltersSets(e: Event): void {
        const target: HTMLElement = e.target as HTMLElement;
        const optionId = target.id.split('-')[1];
        const filterType = encodeURIComponent(
            target.getAttribute('data-finder-filter-type')
        );

        if (filterType === 'combined' || filterType === 'query') {
            !this._activeCombinedOptions.has(optionId)
                ? this._activeCombinedOptions.add(optionId)
                : this._activeCombinedOptions.delete(optionId);
        } else if (filterType === 'separated') {
            const currentStepId = target.closest(this._selectors.step).id;

            if (!this._activeSeparateOptions[currentStepId]) {
                this._activeSeparateOptions[currentStepId] = new Set();
            }

            !this._activeSeparateOptions[currentStepId].has(optionId)
                ? this._activeSeparateOptions[currentStepId].add(optionId)
                : this._activeSeparateOptions[currentStepId].delete(optionId);

            if (this._activeSeparateOptions[currentStepId].size === 0) {
                delete this._activeSeparateOptions[currentStepId];
            }
        }
    }

    /**
     * Step visibility logic
     */
    protected _handleStepsVisibility(e?: Event): void {
        let showAllSteps = false;

        if (e) {
            const currentStep = (e.target as HTMLElement).closest(
                this._selectors.step
            );

            currentStep.classList.add('filled', 'visible');

            if (
                !currentStep.nextElementSibling.classList.contains('required')
            ) {
                showAllSteps = true;
            }
        }

        if (
            !this._element.querySelectorAll(this._selectors.step + '.required')
                .length
        ) {
            showAllSteps = true;
        }

        if (showAllSteps) {
            const steps: NodeListOf<Element> = this._element.querySelectorAll(
                this._selectors.step
            );

            for (const step of steps) {
                step.classList.add('visible');
            }
        }
    }

    protected _setActiveFilters(): void {
        this._element
            .querySelectorAll(`${this._selectors.filter}`)
            .forEach((element: HTMLElement) => {
                element.classList.remove('active');
            });

        this._allAttributes.forEach((attr) => {
            const button: HTMLButtonElement = this._element.querySelector(
                `#option-${attr}`
            );

            if (!button) {
                return;
            }

            if (this._activeCombinedOptions.has(attr)) {
                button.classList.add('active');
            }

            for (const step in this._activeSeparateOptions) {
                if (this._activeSeparateOptions[step].has(attr)) {
                    button.classList.add('active');
                }
            }
        });
    }

    protected _setDisabledFilters(): void {
        const activeOptions: Set<string> = new Set();
        const availableOptions: Set<string> = new Set();

        this._element
            .querySelectorAll(`${this._selectors.filter}.active`)
            .forEach((filter: HTMLElement) => {
                if (
                    filter.getAttribute('data-finder-filter-type') !== 'query'
                ) {
                    activeOptions.add(filter.getAttribute('data-finder-value'));
                }
            });

        activeOptions.forEach((option) => {
            this._mappedOptionsToProducts[option].forEach((product) => {
                this._mappedProductsToOptions[product].forEach((value) => {
                    availableOptions.add(value);
                });
            });
        });

        this._allAttributes.forEach((attr) => {
            const button: HTMLButtonElement = this._element.querySelector(
                `#option-${attr}`
            );

            if (!button) {
                return;
            }

            if (
                button.getAttribute('data-finder-filter-type') === 'query' ||
                this._activeProductsAllAttrs.has(attr) ||
                availableOptions.has(attr)
            ) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });
    }

    /**
     * Manage filters state (disabled, available, active) based on options
     * that are included this._activeProductsAllAttrs
     */
    protected _handleFiltersVisibility(): void {
        this._setActiveFilters();
        this._setDisabledFilters();
    }

    /**
     * Show active products
     */
    protected _handleProductsVisibility(): void {
        this._element
            .querySelectorAll(this._selectors.product)
            .forEach((element) => {
                element.classList.remove('active');
            });

        this._activeProducts.forEach((sku) => {
            this._element
                .querySelector(`#product-${sku}`)
                .classList.add('active');
        });
    }

    /**
     * Handle filters check on initial(query) steps
     */
    protected _handleQueryFiltersClick(e: Event): void {
        const target: HTMLElement = e.target as HTMLElement;

        if (this._productsAreFetched) {
            this._resetFinder();
            target.click();
        }

        const attributeCode: string = encodeURIComponent(
            target
                .closest(this._selectors.step)
                .getAttribute('data-finder-step-attribute-code')
        );

        if (attributeCode) {
            target.classList.toggle('active');
            target.closest(this._selectors.step).classList.toggle('filled');

            this._currentQuery[attributeCode] = encodeURIComponent(
                target.getAttribute('data-finder-value')
            );
        }

        const allQueryValuesArePresent = Object.values(
            this._currentQuery
        ).every((value) => {
            return value;
        });

        if (allQueryValuesArePresent) {
            this._fetchProducts();
        }
    }

    protected _setProductsCount() {
        this._element.querySelector('#products-count span').innerHTML =
            this._activeProducts.size ?? '';
        this._element
            .querySelector('#products-count')
            .classList.toggle('active', !!this._activeProducts.size);
    }

    /**
     * Clear single step filters
     */
    protected _clearStep(stepId: string): void {
        this._element
            .querySelectorAll(`#step${stepId} ${this._selectors.filter}`)
            .forEach((el) => {
                this._activeCombinedOptions.delete(el.id);
            });

        delete this._activeSeparateOptions[`step${stepId}`];

        this._updateState();
        this._scrollToStep(parseInt(stepId, 10) - 1);
    }

    protected _scrollToStep(step: number): void {
        let scrollToElement: HTMLElement = this._element.querySelector(
            `#step${step}`
        );

        if (!scrollToElement) {
            scrollToElement =
                this._element.querySelector(this._selectors.products) ?? null;
        }

        if (!scrollToElement) {
            return;
        }

        const yOffset: number = -80;
        const y =
            scrollToElement.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    /**
     * Reset finder
     * fullReset resets also animal species (dog/cat)
     */
    protected _resetFinder(): void {
        this._currentQuery = this._initialQuery;
        this._element
            .querySelectorAll(this._selectors.step)
            .forEach((element) =>
                element.classList.remove('filled', 'visible')
            );

        // Clear data objects and sets
        this._allAttributes.clear();
        this._mappedOptionsToProducts = {};
        this._mappedProductsToOptions = {};
        this._activeCombinedOptions.clear();
        this._activeProductsAllAttrs.clear();
        this._activeSeparateOptions = {};
        this._activeCombinedOptions.clear();
        this._productsAreFetched = false;

        this._handleFiltersVisibility();
        this._element.querySelector(this._selectors.products).innerHTML = '';
        this._setProductsCount();
    }

    /**
     * Set events
     */
    protected _setEvents(): void {
        this._element
            .querySelectorAll(`${this._selectors.clear}`)
            .forEach((element: HTMLElement) => {
                const stepId: number = parseInt(
                    (element as HTMLElement).parentElement.id.replace(
                        'step',
                        ''
                    ),
                    10
                );

                element.addEventListener('click', () => {
                    this._clearStep(stepId);
                });
            });

        this._element
            .querySelectorAll(`${this._selectors.reset}`)
            .forEach((element: HTMLElement) => {
                element.addEventListener('click', () => {
                    this._resetFinder();
                });
            });

        this._element
            .querySelectorAll(this._selectors.filter)
            .forEach((element: HTMLElement) => {
                element.addEventListener('click', (e: Event) => {
                    this._updateActiveFiltersSets(e);

                    if (
                        !this._productsAreFetched ||
                        e.target.getAttribute('data-finder-filter-type') ===
                            'query'
                    ) {
                        this._handleQueryFiltersClick(e);
                    } else {
                        this._updateState();
                    }

                    const id: number = parseInt(
                        element
                            .closest(this._selectors.step)
                            .id.replace('step', ''),
                        10
                    );

                    element.blur();
                    this._handleStepsVisibility(e);
                    this._scrollToStep(id + 1);
                });
            });
    }
}
