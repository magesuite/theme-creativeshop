import * as $ from 'jquery';
import { debuglog } from 'util';

/**
 * component options interface.
 */
interface ReviewsOptions {
    /**
     * Namespace of the component.
     * Default: 'cs-'
     * @type {string}
     */
    namespace?: string;

    /**
     * Minimum input value that can be provided.
     * Default: '.cs-reviews__rate-feedback'
     * @type {string}
     */
    feedbackElementSelector?: string;

    /**
     * Preselect rating
     * Provide number (1-5) to preselect star
     * Default: 'false'
     * @type {number}
     */
    preselect?: number;
}

export default class Reviews {
    protected _$wrapper: JQuery<HTMLElement>;
    private _$feedbackEl: JQuery<HTMLElement>;
    private _options: ReviewsOptions;

    /**
     * Creates new Reviews component with optional settings.
     * @param  {ReviewsOptions} options  Optional settings object.
     */
    public constructor($wrapper?: JQuery, options?: ReviewsOptions) {
        this._options = $.extend(this._options, options);
        this._options.namespace = this._options.namespace || 'cs-';

        this._$wrapper = $wrapper || $('.cs-reviews__rating-control');
        this._$feedbackEl = this._options.feedbackElementSelector
            ? $wrapper.find(this._options.feedbackElementSelector)
            : $wrapper.find('.cs-reviews__rate-feedback');

        if (this._$wrapper.length && this._$feedbackEl.length) {
            this._attachEvents();
        }

        if (this._options.preselect) {
            this._preselectStar(this._options.preselect - 1);
        }
    }

    /**
     * Preselect value. Do not change message
     */
    protected _preselectStar(index): void {
        for (
            let ratingIndex: number = 0;
            ratingIndex < this._$wrapper.length;
            ratingIndex++
        ) {
            const $activeRadio = this._$wrapper
                .eq(ratingIndex)
                .find('input[type="radio"]')
                .eq(index);
            $activeRadio.attr('checked', true);

            this._setActiveStars($activeRadio, ratingIndex, index);

            const defaultMsg = this._$feedbackEl.data('default-message');
            this._$feedbackEl.eq(ratingIndex).text(defaultMsg);
        }
    }

    /**
     * Set proper active classes on stars and display message
     */
    protected _setActiveStars($radio, ratingIndex, starIndex): void {
        let msg: string = this._$feedbackEl.data('default-message');

        if ($radio.is(':checked')) {
            this._$wrapper
                .eq(ratingIndex)
                .find('.cs-star-rating__form-star')
                .each((index: number, element: JQuery) => {
                    if (index <= starIndex) {
                        $(element).addClass(
                            'cs-star-rating__form-star--active'
                        );
                    } else {
                        $(element).removeClass(
                            'cs-star-rating__form-star--active'
                        );
                    }
                });

            msg = this._$wrapper
                .eq(ratingIndex)
                .find('input[type="radio"]:checked')
                .data('feedback-message');
        } else {
            msg = this._$wrapper.eq(ratingIndex).data('default-message');
        }
        this._$feedbackEl.eq(ratingIndex).text(msg);
    }

    protected _attachEvents(): void {
        const _this: any = this;
        const $radios: any = [];

        for (
            let ratingIndex: number = 0;
            ratingIndex < _this._$wrapper.length;
            ratingIndex++
        ) {
            $radios[ratingIndex] = _this._$wrapper
                .eq(ratingIndex)
                .find('input[type="radio"]');

            for (
                let starIndex: number = 0;
                starIndex < $radios[ratingIndex].length;
                starIndex++
            ) {
                $radios[ratingIndex][starIndex].addEventListener(
                    'change',
                    function(): void {
                        _this
                            ._setActiveStars($(this), ratingIndex, starIndex)
                            .bind(_this);
                    }
                );
            }
        }
    }
}
