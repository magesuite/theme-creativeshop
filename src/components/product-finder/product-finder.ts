import * as $ from 'jquery';

/**
 * Product finder component options interface.
 */
interface ProductFinderOptions {
    stepClassName?: string;
    inputClassName?: string;
    optionClassName?: string;
    backButtonClassName?: string;
    formClassName?: string;
    scrollOffset?: number;
    /**
     * How long should the component wait until resizing its height.
     * Usually you will want to keep it in synch with CSS animations timings.
     */
    stepResizeDelay?: number;
}

/**
 * Interface to help working with category and attributes configuration.
 */
interface ProductFinderConfiguration {
    category_id?: string;
    attributes?: {
        [attributeCode: string]: {
            range?: string[];
            values?: string[];
        };
    };
}

/**
 * Product finder component that let's the user to narrow down the search by
 * going through journey configured by shop admin.
 */
export default class ProductFinder {
    protected _$element: JQuery;
    protected _$window: JQuery = $(window);
    protected _eventListeners: {
        resizeListener?: (event: Event) => void;
        backButtonClickListener?: (event: Event) => void;
        optionClickListener?: (event: Event) => void;
    } = {};

    protected _options: ProductFinderOptions = {
        stepClassName: 'cs-product-finder__step',
        inputClassName: 'cs-product-finder__input',
        optionClassName: 'cs-product-finder__step-option',
        backButtonClassName: 'cs-product-finder__back-button',
        formClassName: 'cs-product-finder__form',
        stepResizeDelay: 800,
        scrollOffset: 70,
    };

    protected _$backButtons: JQuery;
    protected _$steps: JQuery;
    protected _visitedSteps: JQuery[] = [];
    protected _$inputs: JQuery;
    protected _$options: JQuery;
    protected _$form: JQuery;
    /**
     * Creates new product finder component on given jQuery element with optional settings.
     * @param  {JQuery}            $element jQuery element to initialize navigation on.
     * @param  {ProductFinderOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: ProductFinderOptions) {
        // Don't throw errors if there is no navigation on the website.
        if ($element.length === 0) {
            return;
        }
        this._$element = $element;
        this._options = $.extend(this._options, options);

        this._$steps = $element.find(`.${this._options.stepClassName}`);
        this._visitedSteps.push(this._$steps.eq(0));

        this._$inputs = this._$steps.find(`.${this._options.inputClassName}`);
        this._$options = this._$steps.find(`.${this._options.optionClassName}`);

        this._$backButtons = this._$element.find(
            `.${this._options.backButtonClassName}`
        );
        this._$form = this._$element.find(`.${this._options.formClassName}`);

        this._updateSizes();
        this._$steps.css('position', 'absolute');

        this._attachEvents();
    }

    /**
     * Destroys the component.
     */
    public destroy(): void {
        this._detachEvents();
    }

    /**
     * Updates component height in order to enable nice CSS transitions between steps.
     */
    protected _updateSizes() {
        const $currentStep: JQuery = this._visitedSteps.slice(-1).pop();
        const previousHeight = parseInt(this._$element.css('height'), 10);
        const currentStepHeight: number = $currentStep.height();
        this._$element.css('padding-bottom', this._$backButtons.outerHeight());

        setTimeout(
            () => {
                this._$element.css(
                    'height',
                    $currentStep.height() + this._$backButtons.outerHeight()
                );
            },
            previousHeight > currentStepHeight
                ? this._options.stepResizeDelay
                : 0
        );
    }

    /**
     * Scroll to the top of finder if after changing steps user is too low
     */
    protected _scrollToTop() {
        const $currentStep: JQuery = this._visitedSteps.slice(-1).pop();
        const previousHeight = parseInt(this._$element.css('height'), 10);

        if (previousHeight > $(window).height()) {
            setTimeout(() => {
                $('html, body').animate(
                    {
                        scrollTop:
                            this._$element.offset().top -
                            this._options.scrollOffset,
                    },
                    500
                );
            }, this._options.stepResizeDelay);
        }
    }

    /**
     * Switches to the step with given step ID.
     *
     * @param stepId ID of the step we would like to switch to.
     */
    protected _goToStep(stepId: string) {
        const $currentStep: JQuery = this._visitedSteps.slice(-1).pop();
        $currentStep
            .addClass(`${this._options.stepClassName}--previous`)
            .removeClass(`${this._options.stepClassName}--current`);

        const $targetStep: JQuery = this._$steps.filter(
            `[data-step-id="${stepId}"]`
        );
        $targetStep.addClass(`${this._options.stepClassName}--current`);
        this._visitedSteps.push($targetStep);

        this._$backButtons.addClass(
            `${this._options.backButtonClassName}--visible`
        );

        this._updateSizes();
        this._$backButtons.blur();
        this._scrollToTop();
    }

    protected _goToPreviousStep() {
        const $currentStep: JQuery = this._visitedSteps.pop();
        $currentStep.removeClass(`${this._options.stepClassName}--current`);
        $currentStep
            .find(this._options.optionClassName)
            .removeClass(`${this._options.optionClassName}--checked`);

        const $targetStep: JQuery = this._visitedSteps.slice(-1).pop();
        $targetStep
            .addClass(`${this._options.stepClassName}--current`)
            .removeClass(`${this._options.stepClassName}--previous`);

        if (this._visitedSteps.length <= 1) {
            this._$backButtons.removeClass(
                `${this._options.backButtonClassName}--visible`
            );
            this._$element.css('padding-bottom', 0);
        }

        this._updateSizes();
        this._$backButtons.blur();
    }

    /**
     * Collects all selected options and redirects to search page.
     */
    protected _goToSearch() {
        const configuredData: ProductFinderConfiguration = {};

        this._visitedSteps.forEach(($step: JQuery) => {
            const $selectedOption = $step.find(
                `.${this._options.optionClassName}--checked`
            );
            const categoryId: string = $selectedOption.data('category-id');
            const attributes: object = $selectedOption
                .data('attributes')
                .reduce((accumulator, attribute) => {
                    accumulator[attribute.code] = {
                        range: attribute.range,
                        values: attribute.values,
                    };

                    return accumulator;
                }, {});

            $.extend(true, configuredData, { attributes: attributes });

            if (categoryId) {
                configuredData.category_id = categoryId;
            }
        });

        // Ignore all attributes if last option had category_only option set to true.
        const $lastStep: JQuery = this._visitedSteps[
            this._visitedSteps.length - 1
        ];
        if (
            $lastStep
                .find(`.${this._options.optionClassName}--checked`)
                .data('category-only')
        ) {
            delete configuredData.attributes;
        }

        this._sendWithPOST(configuredData);
    }

    /**
     * Constructs form inputs based on given configuration and submits it.
     *
     * @param configuredData Data collected from all checked options.
     */
    protected _sendWithPOST(configuredData: ProductFinderConfiguration) {
        const $categoryField: JQuery = $(
            `<input type="hidden" name="category_id" value="${configuredData.category_id}"></input>`
        );
        this._$form.append($categoryField);

        $.each(configuredData.attributes, (attributeCode, attributeOptions) => {
            if (Array.isArray(attributeOptions.range)) {
                attributeOptions.range.forEach(attributeValue => {
                    const $attributeField: JQuery = $(
                        `<input type="hidden" name="attributes[${attributeCode}][range][]" value="${attributeValue}"></input>`
                    );
                    this._$form.append($attributeField);
                });
            }
            if (Array.isArray(attributeOptions.values)) {
                attributeOptions.values.forEach(attributeValue => {
                    const $attributeField: JQuery = $(
                        `<input type="hidden" name="attributes[${attributeCode}][values][]" value="${attributeValue}"></input>`
                    );
                    this._$form.append($attributeField);
                });
            }
        });

        this._$form.submit();
    }

    /**
     * Attaches events needed by the component.
     */
    protected _attachEvents(): void {
        this._eventListeners.resizeListener = this._updateSizes.bind(this);

        this._eventListeners.backButtonClickListener = this._goToPreviousStep.bind(
            this
        );

        this._eventListeners.optionClickListener = event => {
            const $clickedOption: JQuery = $(event.target).closest(
                `.${this._options.optionClassName}`
            );
            $clickedOption
                .parent()
                .find(`.${this._options.optionClassName}--checked`)
                .removeClass(`${this._options.optionClassName}--checked`);
            $clickedOption.addClass(
                `${this._options.optionClassName}--checked`
            );
            const targetStepId: string = $clickedOption.data('next-step-id');
            if (targetStepId !== 'search') {
                this._goToStep(targetStepId);
            } else {
                this._goToSearch();
            }
        };

        this._$window.on('resize', this._eventListeners.resizeListener);
        this._$backButtons.on(
            'click',
            this._eventListeners.backButtonClickListener
        );
        this._$options.on('click', this._eventListeners.optionClickListener);
    }

    /**
     * Detaches events set by navigation component.
     */
    protected _detachEvents(): void {
        this._$window.off('resize', this._eventListeners.resizeListener);
        this._$backButtons.off(
            'click',
            this._eventListeners.backButtonClickListener
        );
        this._$options.off('click', this._eventListeners.optionClickListener);
    }
}
