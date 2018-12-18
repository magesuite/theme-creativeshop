import * as $ from 'jquery';

export interface HeaderSearchOptions {
    /** 
     * Element, which is a trigger to show/hide searchbox on click
     * @default '.cs-header-user-nav__link--search'
    */
    triggerSelector?: string;
    /** 
     * Class name for searchbox element (wrapper)
     * @default '.cs-header__search'
    */
    targetSelector?: string;
    /** 
     * Class name for button to close the searchbox
     * @default '.cs-header-search__close'
    */
    closeButtonSelector?: string;
    /** 
     * Class name for searchbox element (wrapper) when it's visible (active)
     * @default 'cs-header__search--active'
    */
    targetActiveClass?: string;
    /** 
     * Class name for search item trigger, when it's active
     * @default 'cs-header-user-nav__item--search-active'
    */
    triggerActiveClass?: string;
    /** 
     * ID or class name for search input field
     * @default '#search'
    */
   searchInputSelector?: string;
}

export default class HeaderSearch {
    protected _options: any;
    protected _$trigger: JQuery<HTMLElement>;
    protected _$target: JQuery<HTMLElement>;
    protected _$closeBtn: JQuery<HTMLElement>;
    protected _$searchBoxInput: JQuery<HTMLElement>;

    public constructor(options?: HeaderSearchOptions) {
        this._options = $.extend({
            triggerSelector: '.cs-header-user-nav__link--search',
            targetSelector: '.cs-header__search',
            closeButtonSelector: '.cs-header-search__close',
            targetActiveClass: 'cs-header__search--active',
            triggerActiveClass: 'cs-header-user-nav__item--search-active',
            searchInputSelector: '#search',
        }, options);

        this._$trigger = $(this._options.triggerSelector);
        this._$target = $(this._options.targetSelector);

        if (!this._$trigger.length && !this._$target.length) {
            return;
        } 

        this._$closeBtn = $(this._options.closeButtonSelector);
        this._$searchBoxInput = $(this._options.searchInputSelector);
        
        this._attachEvents();
    }

    protected _attachEvents(): void {
        this._$trigger.on('click', (e: Event): void => {
            e.preventDefault();
            this._toggle();
            this._$searchBoxInput.focus();
        }); 

        this._$closeBtn.on('click', (): void => this._toggle());
    }

    protected _toggle(): void {
        this._$trigger.parent().toggleClass(this._options.triggerActiveClass);
        this._$target.toggleClass(this._options.targetActiveClass);
    }
}