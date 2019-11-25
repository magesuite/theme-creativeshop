import * as $ from 'jquery';

/**
 * component options interface.
 */
interface PaginationOptions {
    /**
     * HTML Selector of component
     * @type {string}
     * @default '.cs-pagination__page-number-input'
     */
    componentSelector?: string;

    /**
     * Timeout of redirection - changes are applied on keyup event.
     * @type number}
     * @default 2000
     */
    redirectionTimeout?: number;
}

export default class Pagination {
    protected _$element: JQuery<HTMLInputElement>;
    protected _urlPattern: string;
    protected _currentPageNum: number;
    protected _lastPageNum: number;
    protected _delay: any;
    protected _options: any;

    /**
     * Creates new Pagination component with optional settings.
     * @param {$element} Optional, element to be initialized as Pagination component
     * @param {options}  Optional settings object.
     */
    public constructor(
        $element?: JQuery<HTMLInputElement>,
        options?: PaginationOptions
    ) {
        this._options = $.extend(
            {
                componentSelector: '.cs-pagination__page-number-input',
                redirectionTimeout: 2000,
            },
            options
        );

        this._$element = $element;
        this._urlPattern = this._$element.data('url-pattern');
        this._currentPageNum = parseInt(this._$element.val() as string, 10);
        this._lastPageNum = parseInt(this._$element.attr('max') as string, 10);
        this._delay;

        this._init();
    }

    protected _redirect(event: JQuery.Event): void {
        const targetPageNum: number = parseInt(
            this._$element.val() as string,
            10
        );
        const tagretUrl: string = this._urlPattern.replace(
            '[page]',
            targetPageNum.toString()
        );

        clearTimeout(this._delay);

        if (
            targetPageNum > 0 &&
            targetPageNum <= this._lastPageNum &&
            targetPageNum !== this._currentPageNum
        ) {
            if (event.keyCode && event.keyCode === 13) {
                location.assign(tagretUrl);
            } else {
                this._delay = setTimeout((): void => {
                    location.assign(tagretUrl);
                }, this._options.redirectionTimeout);
            }
        }
    }

    protected _init(): void {
        this._$element.on('keyup mouseup', (event: JQuery.Event): void =>
            this._redirect(event)
        );
    }
}
