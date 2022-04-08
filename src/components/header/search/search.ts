import * as $ from 'jquery';

export interface HeaderSearchOptions {
    /**
     * Element, which is a trigger to show/hide searchbox on click. Outside header search component
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
    /**
     * Define if input field should get focus after toggle
     * @default true
     */
    searchInputFocus?: boolean;
    /**
     * Define if click on closeButtonSelector element in search field should close search element
     * If false, instead of close search element, the value of input field will be removed
     * If 'both' string is provided both actions are performed
     * @default true
     */
    closeElementToggleSearch?: boolean | string;
}

export default class HeaderSearch {
    protected _options: any;
    protected _$trigger: JQuery<HTMLElement>;
    protected _$target: JQuery<HTMLElement>;
    protected _$closeBtn: JQuery<HTMLElement>;
    protected _$searchBoxInput: JQuery<HTMLElement>;
    protected _isOpen: boolean;

    public constructor(options?: HeaderSearchOptions) {
        this._options = $.extend(
            {
                triggerSelector: '.cs-header-user-nav__link--search',
                targetSelector: '.cs-header .cs-header__search',
                closeButtonSelector: '.cs-header-search__close',
                targetActiveClass: 'cs-header__search--active',
                triggerActiveClass: 'cs-header-user-nav__item--search-active',
                searchInputSelector: '#search',
                closeElementToggleSearch: true,
                searchInputFocus: true,
            },
            options
        );

        this._$trigger = $(this._options.triggerSelector);
        this._$target = $(this._options.targetSelector);
        this._isOpen = false;

        if (!this._$trigger.length && !this._$target.length) {
            return;
        }

        this._$closeBtn = this._$target.find(this._options.closeButtonSelector);
        this._$searchBoxInput = this._$target.find(
            this._options.searchInputSelector
        );

        this._attachEvents();

        // Hide search and autocomplete list when minicart/offcanvas navigation is opened
        $('body').on('before-offcanvas-open', () => {
            this._hideSearch();
        });
    }

    protected _attachEvents(): void {
        this._triggerElementClick();
        this._closeElementClick();
    }

    protected _triggerElementClick(): void {
        if (this._$trigger.length) {
            this._$trigger.on('click', (e: Event): void => {
                e.preventDefault();

                this._toggleSearch();
                this._focusInputField();
            });
        }
    }

    protected _closeElementClick(): void {
        this._$closeBtn.on('click', (): void => {
            if (
                this._options.closeElementToggleSearch ||
                this._options.closeElementToggleSearch === 'both'
            ) {
                this._toggleSearch();
            }

            if (
                !this._options.closeElementToggleSearch ||
                this._options.closeElementToggleSearch === 'both'
            ) {
                this._resetInputValue();
            }
        });
    }

    protected _resetInputValue(): void {
        if (this._$searchBoxInput.val()) {
            this._$searchBoxInput.val('');
        }

        this._focusInputField();
    }

    protected _focusInputField(): void {
        if (this._options.searchInputFocus) {
            this._$searchBoxInput.focus();
        }
    }

    protected _toggleSearch(): void {
        if (this._isOpen) {
            this._hideSearch();
        } else {
            this._openSearch();
        }
    }

    protected _openSearch(): void {
        this._$trigger.parent().addClass(this._options.triggerActiveClass);
        this._$target.addClass(this._options.targetActiveClass);
        $('body').addClass('search-open');
        this._isOpen = true;

        $('body').trigger('before-search-open');
    }

    protected _hideSearch(): void {
        this._$trigger.parent().removeClass(this._options.triggerActiveClass);
        this._$target.removeClass(this._options.targetActiveClass);
        $('body').removeClass('search-open');
        this._isOpen = false;
    }
}
