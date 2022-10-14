import * as $ from 'jquery';

interface IProportionalScalerTextLayoutScenario {
    /**
     * Defines level of activity of the plugin.
     * Set to {true} to scale fonts in teasers proportionally,
     * Set to {false} to only add '.ready' css class to the teaser element.
     * Do not import plugin to your theme if you wish to disable all its activity
     * @default true
     * @type {boolean}
     */
    enabled?: boolean;

    /**
     * Defines ratio base multiplier for scaling content
     * @default 0.002
     * @type {number}
     */
    ratioBase?: number;
}

interface IProportionalScaler {
    /**
     * Defines settings for 'Text Over Image' layout
     * @type {boolean}
     */
    textOverImage?: IProportionalScalerTextLayoutScenario;

    /**
     * Defines settings for 'Text Below Image' layout
     * @type {number}
     */
    textBelowImage?: IProportionalScalerTextLayoutScenario;

    /**
     * Defines selector of element's child to be scaled
     * @default '.cs-image-teaser__text-content'
     * @type {string}
     */
    scalableElementSelector?: string;
}

/**
 * Product Details scroll-to-element component
 * It's responsible for handling Product Details Navigation events to scroll to chosen section
 */
export default class ProportionalScaler {
    private _$element: JQuery<HTMLElement>;
    private _options: IProportionalScaler;
    private _layoutSpecificOptions: IProportionalScalerTextLayoutScenario;
    private _ratio: number;
    private _isScaleScheduled: boolean = false;
    private _scalableElement: HTMLElement;
    private _scalableElelementFontSize: string;

    /**
     * Creates and initiates new ProductDetails component with given settings.
     * @param {JQuery<HTMLElement>} $element - element of which content should be scaled relative to it.
     * @param {IProportionalScaler} options Optional component settings.
     */
    public constructor(
        $element: JQuery<HTMLElement>,
        options?: IProportionalScaler
    ) {
        this._$element = $element;
        this._options = $.extend(
            true,
            {},
            {
                textOverImage: {
                    enabled: true,
                    ratioBase: 2,
                },
                textBelowImage: {
                    enabled: true,
                    ratioBase: 2,
                },
                scalableElementSelector: '.cs-image-teaser__text-content',
            },
            options
        );
    }

    public _initScaling(): JQueryDeferred<void> {
        const deferred = $.Deferred();

        if (!this._$element.length) {
            deferred.resolve();
            return deferred;
        }

        this._layoutSpecificOptions =
            this._$element.data('layout') === 'under'
                ? this._options.textBelowImage
                : this._options.textOverImage;

        const $scalableEl = this._$element.find(
            `${this._options.scalableElementSelector}`
        );

        if (!$scalableEl.length || !this._layoutSpecificOptions.enabled) {
            deferred.resolve();
            return deferred;
        }

        this._ratio = this._layoutSpecificOptions.ratioBase / 1000;
        this._scalableElement = $scalableEl[0];
        this._scalableElelementFontSize = getComputedStyle(
            this._scalableElement
        ).fontSize;

        this._setEvents();

        const scaleWithoutBlocking = () => {
            setTimeout(() => {
                this._scale();
                requestAnimationFrame(() => {
                    deferred.resolve();
                });
            });
        };

        if (
            this._$element.find('.lazyload').length &&
            !this._$element.closest('.cs-image-teaser--hero-teaser')
        ) {
            this._$element.on('lazybeforeunveil', () => scaleWithoutBlocking);
        } else {
            scaleWithoutBlocking();
        }

        return deferred;
    }

    public _scale(): any {
        if (!this._scalableElement) {
            return;
        }

        this._isScaleScheduled = false;
        this._scalableElement.style.fontSize = `${
            parseInt(this._scalableElelementFontSize, 10) *
            this._$element.outerWidth() *
            this._ratio
        }px`;
    }

    public _setEvents(): void {
        window.addEventListener('resize', (): any => {
            if (this._isScaleScheduled) {
                return;
            }

            this._isScaleScheduled = true;
            window.requestAnimationFrame((): void => this._scale());
        });
    }
}
