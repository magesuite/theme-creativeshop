import * as $ from 'jquery';
import 'mage/translate';
import { productTemplate } from 'MageSuite_InstantProductFinder/web/js/product-template';

/**
 * Documentation for the module: https://creativestyle.atlassian.net/wiki/spaces/MGSDEV/pages/2283962862/InstantProductFinder+optional+private
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
    queryNextButton: string;
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
        queryNextButton: '.cs-instant-product-finder__query-next-button',
    };
    public endpoints: { fetchProducts: string } = {
        fetchProducts: window.BASE_URL + 'instant_product_finder/product/json',
    };
    public scrollToStep: boolean = false;

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
                ] = new Set();
            });

        this._restoreCurrentQueryToInitialValue();

        this._setEvents();
        this._element.classList.remove(this._selectors.elementLoadingClass);
    }

    /**
     * Fetch products based on query
     */
    protected _fetchProducts(): void {
        let query = '';
        for (const [key, value] of Object.entries(this._currentQuery)) {
            query = `${query}/${key}/`;

            let i = 0;
            value.forEach((option: string) => {
                query =
                    i < value.size - 1
                        ? `${query}${option},`
                        : (query = `${query}${option}`);
                i++;
            });
        }

        this._isLoading = true;
        this._element.classList.add(this._selectors.elementLoadingClass);

        $.ajax({
            method: 'GET',
            url: `${this.endpoints.fetchProducts}${query}`,
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
            this._handleStepsVisibility();
            this._element.classList.remove(this._selectors.elementLoadingClass);
        });
    }

    /**
     * Prepare two objects with data:
     * _mappedOptionsToProducts - object with option ids as keys and set of product skus as value
     * _mappedProductsToOptions - objects with product skus as keys and set of option ids as value
     */
    protected _prepareData(data: object[]): void {
        data.forEach((product: object) => {
            if (product.sku.includes('/')) {
                product.sku = product.sku.replace(/\//g, '-');
            }

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
     * Update state.
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
     * Check if product has all active combined attributes
     */
    protected _productHasAllCombinedOptions(attributes: Set<string>): boolean {
        if (this._activeCombinedOptions.size) {
            return Array.from(this._activeCombinedOptions).every(
                (option: string) => {
                    return attributes.has(option);
                }
            );
        } else {
            return true;
        }
    }

    protected _updateActiveFiltersSets(button: HTMLElement): void {
        const optionId = button.getAttribute('data-finder-value');
        const filterType = encodeURIComponent(
            button.getAttribute('data-finder-filter-type')
        );

        if (filterType === 'combined') {
            !this._activeCombinedOptions.has(optionId)
                ? this._activeCombinedOptions.add(optionId)
                : this._activeCombinedOptions.delete(optionId);
        } else if (
            filterType === 'separated' ||
            filterType === 'query' ||
            filterType === 'single'
        ) {
            const currentStepId = button.closest(this._selectors.step).id;

            if (!this._activeSeparateOptions[currentStepId]) {
                this._activeSeparateOptions[currentStepId] = new Set();
            }

            if (!this._activeSeparateOptions[currentStepId].has(optionId)) {
                if (
                    filterType === 'single' &&
                    this._activeSeparateOptions[currentStepId].size >= 1
                ) {
                    return;
                }
                this._activeSeparateOptions[currentStepId].add(optionId);
            } else {
                this._activeSeparateOptions[currentStepId].delete(optionId);
            }

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
            const currentStep = e.target.closest(this._selectors.step);

            currentStep.classList.add('filled', 'visible');

            if (
                !currentStep.nextElementSibling.classList.contains('required')
            ) {
                showAllSteps = true;
            }
        }

        if (
            !this._element.querySelectorAll(
                this._selectors.step + '.required:not(.query)'
            ).length
        ) {
            showAllSteps = true;
        }

        if (showAllSteps && this._productsAreFetched) {
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

            if (
                button.getAttribute('data-finder-filter-type') === 'single' &&
                $(button).siblings('.active').length
            ) {
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
     *
     */
    protected _handleQueryClickAfterProductsAreFetched(e: Event): void {
        const target: HTMLElement = e.target;
        const currentValue = encodeURIComponent(
            target.getAttribute('data-finder-value')
        );
        const targetIsActive: boolean = target.classList.contains('active');
        const step: HTMLElement = target.closest(this._selectors.step);
        const currentStepId = target.closest(this._selectors.step).id;
        const code: string = step.getAttribute(
            'data-finder-step-attribute-code'
        );

        const lastQuery: object = { ...this._currentQuery };

        this._resetFinder();

        this._currentQuery = { ...lastQuery };

        Object.values(lastQuery).forEach((step) => {
            step.forEach((id: string) => {
                const button: HTMLElement = this._element.querySelector(
                    `#option-${id}`
                );
                this._updateActiveFiltersSets(button);
                button.classList.add('active');
            });
        });

        if (!targetIsActive) {
            this._activeSeparateOptions[currentStepId].add(currentValue);
            this._currentQuery[code].add(currentValue);
            target.classList.add('active');
        } else {
            this._activeSeparateOptions[currentStepId].delete(currentValue);
            this._currentQuery[code].delete(currentValue);
            target.classList.remove('active');
        }

        this._element
            .querySelectorAll(this._selectors.step + '.query')
            .forEach((step) => {
                step.classList.add('visible');
            });
    }

    /**
     * Handle filters check on initial(query) steps
     */
    protected _handleQueryFiltersClick(e: Event): void {
        if (this._productsAreFetched) {
            this._handleQueryClickAfterProductsAreFetched(e);
            return;
        }

        const target: HTMLElement = e.target;
        const attributeCode: string = encodeURIComponent(
            target
                .closest(this._selectors.step)
                .getAttribute('data-finder-step-attribute-code')
        );
        const currentValue = encodeURIComponent(
            target.getAttribute('data-finder-value')
        );

        if (attributeCode) {
            !this._currentQuery[attributeCode].has(currentValue)
                ? this._currentQuery[attributeCode].add(currentValue)
                : this._currentQuery[attributeCode].delete(currentValue);

            target.classList.toggle('active');
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
        if (!this.scrollToStep) {
            return;
        }

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
        this._restoreCurrentQueryToInitialValue();
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
        this._activeProducts.clear();
        this._activeSeparateOptions = {};
        this._activeCombinedOptions.clear();
        this._productsAreFetched = false;

        this._handleFiltersVisibility();
        this._element.querySelector(this._selectors.products).innerHTML = '';
        this._setProductsCount();
    }

    protected _handleQueryNextButtonClick(e: Event): void {
        const target: HTMLElement = e.target;
        const step: HTMLElement = target.closest(this._selectors.step);
        const id: number = parseInt(
            target.closest(this._selectors.step).id.replace('step', ''),
            10
        );
        const code: string = step.getAttribute(
            'data-finder-step-attribute-code'
        );

        if (
            !this._currentQuery[code] ||
            (this._currentQuery[code] && !this._currentQuery[code].size)
        ) {
            return;
        }

        step.classList.toggle('filled');
        step.classList.toggle('visible');

        this._scrollToStep(id + 1);

        const allQueryValuesArePresent = Object.values(
            this._currentQuery
        ).every((value) => {
            return value.size;
        });

        if (allQueryValuesArePresent) {
            this._fetchProducts();
        }

        this._handleStepsVisibility(e);
    }

    /**
     * Set events
     */
    protected _setEvents(): void {
        this._element
            .querySelectorAll(`${this._selectors.clear}`)
            .forEach((element: HTMLElement) => {
                const stepId: number = parseInt(
                    element.parentElement.id.replace('step', ''),
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
            .querySelectorAll(`${this._selectors.queryNextButton}`)
            .forEach((element: HTMLElement) => {
                element.addEventListener('click', (e: Event) => {
                    this._handleQueryNextButtonClick(e);
                });
            });

        this._element
            .querySelectorAll(this._selectors.filter)
            .forEach((element: HTMLElement) => {
                element.addEventListener('click', (e: Event) => {
                    this._updateActiveFiltersSets(e.target);

                    if (
                        e.target.getAttribute('data-finder-filter-type') ===
                        'query'
                    ) {
                        this._handleQueryFiltersClick(e);
                    } else {
                        this._updateState();
                        this._handleStepsVisibility(e);

                        const id: number = parseInt(
                            element
                                .closest(this._selectors.step)
                                .id.replace('step', ''),
                            10
                        );

                        if (e.target.classList.contains('active')) {
                            this._scrollToStep(id + 1);
                        }
                    }

                    element.blur();
                });
            });
    }

    /**
     * Restore currentQuery to initial value
     */
    protected _restoreCurrentQueryToInitialValue(): void {
        Object.keys(this._initialQuery).forEach((key) => {
            this._currentQuery[key] = new Set(this._initialQuery[key]);
        });
    }
}
