import * as $ from 'jquery';

/**
 * Expected delivery date component
 */

export default class ExpectedDeliveryDate {
    protected _$element: JQuery;

    protected _options: ExpectedDeliveryDateOptions = {
        deliverySameDaySelector: '.cs-indicator-exp-delivery__text--same-day',
        deliveryNextDaySelector: '.cs-indicator-exp-delivery__text--next-day',
        maxTimeAttribute: 'data-max-time-today',
    };

    public constructor(
        $element: JQuery,
        options?: ExpectedDeliveryDateOptions
    ) {
        if ($element.length === 0) {
            return;
        }

        this._$element = $element;
        this._options = Object.assign({}, this._options, options);
        this.showExpectedDeliveryDate();
    }

    /**
     * Updates information about delivery date depending on current time - if the order is placed
     * before or after cutoff time.
     */

    public showExpectedDeliveryDate(): void {
        const currentTime: number = Math.floor(Date.now() / 1000);
        // Expected delivery component
        const $expectedDeliveryComponent = this._$element;
        //cutoff time
        const maxTime = this._$element.attr(this._options.maxTimeAttribute);
        //Default delivery day - order placed before cutoff time
        let defaultDeliveryDay = $expectedDeliveryComponent.find(
            this._options.deliverySameDaySelector
        );

        //if order is placed after cutoff switch default to delivery day +1
        if (currentTime > maxTime) {
            defaultDeliveryDay = $expectedDeliveryComponent.find(
                this._options.deliveryNextDaySelector
            );
        }

        $(defaultDeliveryDay).addClass(
            'cs-indicator-exp-delivery__text--visible'
        );
    }
}
