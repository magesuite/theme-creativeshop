import * as $ from 'jquery';

import * as isMobile from 'isMobile';
import 'bootstrapSelect';

/**
 * component options interface.
 */
interface HtmlSelectOptions {
    /**
     * Namespace of the component. Default is 'cs-'
     * @type {string}
     */
    namespace?: string;
}

/**
 * select's plugin options interface.
 */
interface SelectpickerOptions {
    /**
     * Is this mobile device currently browsing. Default is false
     * @type {boolean}
     */
    mobile?: boolean;
    /**
     * Class of the select element
     * @type {string}
     */
    realSelectClass?: string;
    /**
     * Class of the fake select element that  is created dynamically and contains button + HTML options list
     * @type {string}
     */
    selectClass?: string;
    /**
     * Classes of the fake select childrens:
     * * menuClass - class of the menu wrapper (container of fake options) @type {string}
     * * menuListClass - class of the inner menu UL (fake options) @type {string}
     * * menuListitemClass - class of the single list element (fake option) @type {string}
     * * linkClass - class of the link inside option (representing option) @type {string}
     */
    menuClass?: string;
    menuListClass?: string;
    menuListitemClass?: string;
    linkClass?: string;
    /**
     * Class of the trigger element that opens fake menu (button)
     * @type {string}
     */
    styleBase?: string;
    /**
     * URL to the icon of the tick representing chosen options of multiselect dropdown
     * @type {string}
     */
    tickIcon?: string;
    /**
     * Text that is displayed for multiselect when no options selected and no placeholder is set
     * @type {string}
     */
    noneSelectedText?: string;
    /**
     * Object of template where you can customize some of HTML of the fake select
     * @type {object}
     */
    template?: object;
    /**
     * Templatre of the caret - URL to the icon of the trigger element that opens fake menu (arrow on the right)
     * @type {string}
     */
    caret?: string;
}

export default class HtmlSelect {
    protected _$element: JQuery;
    protected _$select: JQuery;

    /**
     * Creates new htmlSelect component with optional settings.
     * @param  {htmlSelectOptions} options  Optional settings object.
     */
    public constructor(
        $element?: JQuery,
        options?: HtmlSelectOptions,
        selectpickerOptions?: SelectpickerOptions
    ) {
        this._options = $.extend(this._options, options);
        this._options.namespace = this._options.namespace || 'cs-';

        this._$select = $element || $(`.${this._options.namespace}select`);

        const _this: any = this;

        this._selectpickerOptions = $.extend(
            {
                mobile: isMobile.any,
                realSelectClass: `${_this._options.namespace}select`,
                selectClass: `${_this._options.namespace}html-select`,
                menuClass: `${_this._options.namespace}html-select__menu`,
                menuListClass: `${
                    _this._options.namespace
                }html-select__menu-list`,
                menuListitemClass: `${
                    _this._options.namespace
                }html-select__menu-item`,
                linkClass: `${_this._options.namespace}html-select__menu-link`,
                searchInputClass: `${_this._options.namespace}input__input ${
                    _this._options.namespace
                }html-select__search-input`,
                styleBase: '',
                iconBase: '',
                tickIcon: '',
                noneSelectedText: 'Nothing selected',
                noneResultsText: 'No results for: {0}',
                template: {
                    caret:
                        _this._options.caretMarkup ||
                        `<span class="${
                            _this._options.namespace
                        }html-select__trigger-caret"><span class="${
                            _this._options.namespace
                        }html-select__trigger-caret-arrow"></span></span>`,
                },
            },
            selectpickerOptions
        );

        this._onRendered();
        this._render();
        this._setCallbacks();
    }

    /**
     * Dynamically set padding for a html-select element
     * @param  {$select} jQuery select element.
     */
    public _setPadding($select: JQuery): void {
        const $contentAfter: any = $select
            .siblings()
            .find(`.${this._options.namespace}html-select__trigger-subtext`);
        const $caret: any = $select
            .siblings()
            .find(`.${this._options.namespace}html-select__trigger-caret`);
        const buttonsLeftPadding: number = parseInt(
            $select
                .siblings()
                .find(`.${this._options.namespace}html-select__trigger`)
                .css('padding-left'),
            10
        );

        if ($contentAfter.length) {
            const padding: any =
                $caret.outerWidth() +
                $contentAfter.outerWidth() +
                2 * buttonsLeftPadding;

            $select
                .siblings()
                .find(`.${this._options.namespace}html-select__menu-item-text`)
                .css('padding-right', padding);
            $select
                .siblings()
                .find(`.${this._options.namespace}html-select__trigger`)
                .css('padding-right', padding);
        }
    }

    /**
     * runs _setHtmlSelectPadding method after $select is rendered
     */
    protected _onRendered(): void {
        const _this: any = this;

        this._$select.on('rendered.bs.select', function(): void {
            _this._setPadding($(this));
        });
    }

    /**
     * Initialize selectpicker plugin for all ${this._options.namespace}select elements
     */
    protected _render(): void {
        const _this: any = this;

        this._$select.each(function(): void {
            const limit: number = $(this).attr('data-options-limit')
                ? parseInt($(this).data('options-limit'), 10)
                : 8;
            let triggerStyle: string = `${
                _this._options.namespace
            }html-select__trigger`;

            if (
                $(this).hasClass(`${_this._options.namespace}html-select--big`)
            ) {
                triggerStyle = `${
                    _this._options.namespace
                }html-select__trigger ${
                    _this._options.namespace
                }html-select__trigger--big`;
            } else if (
                $(this).hasClass(
                    `${_this._options.namespace}html-select--light`
                )
            ) {
                triggerStyle = `${
                    _this._options.namespace
                }html-select__trigger ${
                    _this._options.namespace
                }html-select__trigger--light`;
            } else if (
                $(this).hasClass(
                    `${_this._options.namespace}html-select--light-reverse`
                )
            ) {
                triggerStyle = `${
                    _this._options.namespace
                }html-select__trigger ${
                    _this._options.namespace
                }html-select__trigger--light-reverse`;
            }

            _this._selectpickerOptions.size = limit;
            _this._selectpickerOptions.styleBase = triggerStyle;

            $(this).selectpicker(_this._selectpickerOptions);
        });
    }

    /**
     * Set callbacks for ${this._options.namespace}select elements
     */
    protected _setCallbacks(): void {
        const _this: any = this;

        $(`.${_this._options.namespace}html-select`).on(
            'show.bs.select',
            function(event: Event): void {
                setTimeout(
                    (): void =>
                        $(event.target)
                            .parent()
                            .addClass(
                                `${
                                    _this._options.namespace
                                }html-select--animate`
                            ),
                    30
                );
            }
        );

        $(`.${_this._options.namespace}html-select`).on(
            'hide.bs.select',
            function(event: Event): void {
                $(event.target)
                    .parent()
                    .removeClass(
                        `.${_this._options.namespace}html-select--animate`
                    );
            }
        );
    }
}
