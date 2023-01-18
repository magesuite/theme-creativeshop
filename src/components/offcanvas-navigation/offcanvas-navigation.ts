import * as $ from 'jquery';

import requireAsync from 'utils/require-async';
import { default as idleDeferred } from 'utils/idle-deffered';

import {
    default as HeaderSearch,
    HeaderSearchOptions,
} from 'components/header/search/search';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

/**
 * Component options interface.
 */
export interface OffcanvasNavigationOptions {
    className?: string;
    navigationClassName?: string;
    drawerClassName?: string;
    languageSwitcherSelector?: string;
    currencySwitcherSelector?: string;
    showCategoryIcon?: boolean;
    showProductsCount?: boolean;
    endpointPath?: string;
    authorizationLinkSelector?: string;
    showActiveCategoryLevel?: boolean;
    highlightActiveCategory?: boolean;
    activeCategoryHighlightClass?: string;
    headerSearchOptions?: HeaderSearchOptions;
    onNavigationRender?: () => void; // Callback to fire when navigation is rendered
    offcanvasMaxBreakpoint: number;
}

interface MainNavigationCacheInfo {
    url: string;
    cache_key: string;
    generation_time: number;
}

/**
 * Offcanvas navigation component responsible for multilevel offcanvas navigation menu.
 */
export default class OffcanvasNavigation {
    protected _options: OffcanvasNavigationOptions;
    protected _$element: JQuery;
    protected _$drawer: JQuery;
    protected _activeCategoryPath: string[];
    protected _firstInit: boolean = true;

    protected _eventListeners: {
        offcanvasShow?: (event: JQuery.Event) => void;
        offcanvasHide?: (event: JQuery.Event) => void;
        parentLinkClick?: (event: JQuery.Event) => void;
        returnLinkClick?: (event: JQuery.Event) => void;
        initOffcanvasNav?: (event: JQuery.Event) => void;
    } = {};

    /**
     * Creates offcanvas navigation with optional settings.
     * @param options Optional settings for a component.
     */
    public constructor(options?: OffcanvasNavigationOptions) {
        this._options = $.extend(
            {
                className: 'cs-offcanvas-navigation',
                navigationClassName: 'cs-navigation',
                drawerClassName: 'cs-offcanvas__drawer',
                showCategoryIcon: false,
                showProductsCount: false,
                endpointPath: '/navigation/mobile/index',
                currencySwitcherSelector: '.switcher-currency',
                languageSwitcherSelector: '.switcher-language',
                authorizationLinkSelector: '.authorization-link',
                showActiveCategoryLevel: true,
                highlightActiveCategory: false,
                activeCategoryHighlightClass: `active`,
                headerSearchOptions: {
                    triggerSelector: false,
                    targetSelector: '.cs-offcanvas-navigation__search',
                    searchInputSelector: '#search-offcanvas',
                    closeElementToggleSearch: false,
                },
                offcanvasMaxBreakpoint: breakpoint.tablet,
            },
            options
        );

        this._$drawer = $(`.${this._options.drawerClassName}`);

        if (!this._$drawer.length) {
            return;
        }

        // Read active category path from a special tag.
        // Template literal used to always get data attribute as a string
        this._activeCategoryPath = `${$('#active-category-path').data(
            'activeCategoryPath'
        )}`.split('/');

        // Prefetch mobile navigation when browser becomes idle (only for mobile devices).
        if (breakpoint.current <= this._options.offcanvasMaxBreakpoint) {
            idleDeferred().then(() => this._init());
        }

        this._addEventListeners();
    }

    /**
     * Initializes offcanvas navigation once - either on ofcaanvas show or when browser enters idle state.
     */
    protected _init(): void {
        if (!this._firstInit) {
            return;
        }

        this._firstInit = false;

        // Disable orientation change event if initialization is already ongoing
        $(document).off(
            'breakpointChange',
            this._eventListeners.initOffcanvasNav
        );

        this._getHtml()
            .then((html) => this._initHtml(html))
            .then(() =>
                setTimeout(() => {
                    this._initSwitchers();
                    this._fixLoginLinks();

                    if (this._options.showActiveCategoryLevel) {
                        this._showActiveCategoryLevel();
                    }

                    if (this._options.highlightActiveCategory) {
                        this._highlightActiveCategoryItem();
                    }

                    if (this._options.onNavigationRender) {
                        this._options.onNavigationRender();
                    }

                    if (
                        deepGet(
                            viewXml,
                            'vars.Magento_Theme.header.mobile_search_in_offcanvas'
                        )
                    ) {
                        this._handleOffcanvasSearch();
                    }
                })
            );
    }

    /**
     * Initializes given HTML and assigns all event listeners.
     * @param html Offcanvas navigation HTML loaded with AJAX or from cache.
     */
    protected _initHtml(html: string): void {
        this._$element = $(html);
        this._$drawer.empty().append(this._$element);
    }

    /**
     * Initializes language and currency switchers.
     */
    protected _initSwitchers(): void {
        const $offcanvasLanguageSwitcher: JQuery = this._$drawer.find(
            this._options.languageSwitcherSelector
        );
        this._fixSwitcherLinks($offcanvasLanguageSwitcher);

        const $offcanvasCurrencySwitcher: JQuery = this._$drawer.find(
            this._options.currencySwitcherSelector
        );

        this._fixSwitcherLinks($offcanvasCurrencySwitcher);

        requireAsync(['mage/apply/main']).then(([mage]) => mage.apply());
    }

    /**
     * Fixes links in given switchers caused by them being generated under async URL.
     * @param $offcanvasSwitcher Reference to switcher inside offcanvas.
     */
    protected _fixSwitcherLinks($offcanvasSwitcher: JQuery) {
        if (!$offcanvasSwitcher.length) {
            return;
        }

        const desktopSwitcherId = `${$offcanvasSwitcher
            .attr('id')
            .replace('-offcanvas', '')}`;
        const $desktopSwitcherLinks = $(`#${desktopSwitcherId} a`);
        // If there is a desktop counterpart then just copy its "data-post".
        if ($desktopSwitcherLinks.length) {
            $offcanvasSwitcher.find('a').each((index, element) => {
                $(element).attr(
                    'data-post',
                    $desktopSwitcherLinks.eq(index).attr('data-post')
                );
            });
        } else {
            // Otherwise try to fallback to dummy solution which should redirect to other storeview's homepage.
            $offcanvasSwitcher.find('a').each((index, element) => {
                const $switcherLink = $(element);
                const postData = $switcherLink.data('post');
                try {
                    const endpointUrl = atob(
                        postData.data.uenc.replace(/,/g, '')
                    );
                    const targetUrl = endpointUrl.slice(
                        0,
                        endpointUrl.indexOf(this._options.endpointPath) + 1
                    );
                    postData.data.uenc = btoa(targetUrl);
                    $switcherLink.attr('data-post', JSON.stringify(postData));
                } catch (error) {
                    // Could not parse the data.
                }
            });
        }
    }

    /**
     * Fixes login link URL caused by using AJAX endpoint and invalid referer.
     */
    protected _fixLoginLinks() {
        const $offcanvasLoginLink = this._$drawer.find(
            `.${this._options.className}__link--sign-in`
        );

        if ($offcanvasLoginLink.length) {
            $offcanvasLoginLink.attr(
                'href',
                $offcanvasLoginLink
                    .attr('href')
                    .replace(
                        /referer\/[^\/]+\//,
                        `referer/${btoa(window.location.href)}/`
                    )
            );
        }
    }

    /**
     * Initialize search in offcanvas
     * As offcanvas navigation is cached backend functionality to fill search input is lost.
     * Instead search query is fetched form url if user is on search results page
     */
    protected _handleOffcanvasSearch(): void {
        new HeaderSearch(this._options.headerSearchOptions);

        const $searchInput = $('#search-offcanvas');

        if ($('.catalogsearch-result-index').length && !$searchInput.val()) {
            const search = location.search.substring(1);
            const searchQuery = JSON.parse(
                '{"' +
                    decodeURI(search)
                        .replace(/"/g, '\\"')
                        .replace(/&/g, '","')
                        .replace(/\+/g, ' ')
                        .replace(/=/g, '":"') +
                    '"}'
            );

            if (searchQuery && searchQuery.q) {
                $searchInput.val(searchQuery.q);
            }
        }
    }

    /**
     * Fetches navigation HTML from cache or using AJAX from endpoint.
     * @param url AJAX endpoint URL.
     */
    protected _getHtml(): JQuery.Deferred<string> {
        const deferred = jQuery.Deferred();
        const cacheInfo = this._getCacheInfo();

        if (!cacheInfo.url) {
            /* tslint:disable */
            console.error(
                `Main navigation is missing "data-mobile-endpoint-url" attribute, please make sure its template is up to date.`
            );
            /* tslint:enable */
            return deferred.resolve('');
        }

        $.get({
            url: cacheInfo.url,
            data: {
                cache_key: cacheInfo.cache_key,
                generation_time: cacheInfo.generation_time,
            },
            cache: true,
        }).then((html: string) => {
            deferred.resolve(html);
        });

        return deferred;
    }

    protected _getCacheInfo(): MainNavigationCacheInfo {
        const $navigation = $(`.${this._options.navigationClassName}`);

        return {
            url: $navigation.data('mobile-endpoint-url'),
            cache_key: $navigation.data('cache-key'),
            generation_time: $navigation.data('cache-generation-time'),
        };
    }

    /**
     * Handles parent link click
     * @param {Event} event [description]
     */
    protected _handleParentLinkClick(event: Event): void {
        event.preventDefault();

        const categoryToShow = $(event.target).hasClass(
            `${this._options.className}__link--parent`
        )
            ? $(event.target).data('category-id')
            : $(event.target)
                  .parents(`.${this._options.className}__link--parent`)
                  .first()
                  .data('category-id');

        this._showCategoryLevel(categoryToShow);
    }

    /**
     * Shows root list.
     */
    protected _showRootLevel(): void {
        this._$element
            .find(`.${this._options.className}__list`)
            .eq(0)
            .addClass(`${this._options.className}__list--current`);
    }

    /**
     * Shows navigation level list.
     * @param {jQuery} $levelToShow ${this._options.className}__list element which should be shown.
     */
    protected _showCategoryLevel(categoryId: string): void {
        const $currentLevel = $(`.${this._options.className}__list--current`);

        const $listToShow = $(`
            .${this._options.className}__link[data-category-id="${categoryId}"]
        `).next();

        if (!$listToShow.length) {
            // Don't hide current category if there is nothing else to show.
            return;
        }

        if (
            !this._firstInit &&
            $currentLevel.length > 0 &&
            $currentLevel.last().prop('scrollTop')
        ) {
            $currentLevel.animate({ scrollTop: 0 }, 'fast', () => {
                $currentLevel.removeClass(
                    `${this._options.className}__list--current`
                );
                $listToShow
                    .addClass(
                        `
                        ${this._options.className}__list--active
                        ${this._options.className}__list--current
                    `
                    )
                    .parents(`.${this._options.className}__list`)
                    .each((i, parent) => {
                        $(parent).addClass(
                            `${this._options.className}__list--active`
                        );
                    });
            });
        } else {
            $currentLevel.removeClass(
                `${this._options.className}__list--current`
            );
            $listToShow
                .addClass(
                    `
                    ${this._options.className}__list--active
                    ${this._options.className}__list--current
                `
                )
                .parents(`.${this._options.className}__list`)
                .each((i, parent) => {
                    $(parent).addClass(
                        `${this._options.className}__list--active`
                    );
                });
        }
    }

    /**
     * Hides current navigation level based on clicked return link.
     * @param {Event} event [description]
     */
    protected _hideLevel(event: Event): void {
        event.preventDefault();
        const $levelToHide = $(event.target).closest(
            `.${this._options.className}__list`
        );
        $levelToHide
            .removeClass(
                `
                ${this._options.className}__list--active
                ${this._options.className}__list--current
            `
            )
            .parent()
            .closest(`.${this._options.className}__list`)
            .addClass(`${this._options.className}__list--current`);
    }

    /**
     * Resets levels to root.
     */
    protected _resetLevels(): void {
        if (!this._$element) {
            return;
        }

        const $levelsToHide = this._$element.find(
            `.${this._options.className}__list`
        );
        // Reset all levels.
        $levelsToHide.removeClass(
            `${this._options.className}__list--active ${this._options.className}__list--current`
        );

        if (this._options.showActiveCategoryLevel) {
            this._showActiveCategoryLevel();
        } else {
            this._showRootLevel();
        }
    }

    /**
     * Sets up event listeners for a component.
     */
    protected _addEventListeners(): void {
        this._eventListeners.offcanvasShow = this._init.bind(this);
        $(document).one('offcanvas-show', this._eventListeners.offcanvasShow);

        this._eventListeners.offcanvasHide = this._resetLevels.bind(this);
        $(document).on('offcanvas-hide', this._eventListeners.offcanvasHide);

        this._eventListeners.parentLinkClick =
            this._handleParentLinkClick.bind(this);

        this._$drawer.on(
            'click',
            `.${this._options.className}__link--parent`,
            this._eventListeners.parentLinkClick
        );

        this._eventListeners.returnLinkClick = this._hideLevel.bind(this);
        this._$drawer.on(
            'click',
            `.${this._options.className}__link--return`,
            this._eventListeners.returnLinkClick
        );

        // Check for orientation change and initialize mobile nav if needed
        this._eventListeners.initOffcanvasNav =
            this._dynamicOffcanvasInit.bind(this);
        $(document).on(
            'breakpointChange',
            this._eventListeners.initOffcanvasNav
        );
    }

    /**
     * Check and initialize offcanvas navigation if needed
     */
    protected _dynamicOffcanvasInit(): void {
        if (breakpoint.current <= this._options.offcanvasMaxBreakpoint) {
            this._init();
        }
    }

    /**
     * Removes event listeners for a component.
     */
    protected _removeEventListeners(): void {
        $(document).off('offcanvas-show', this._eventListeners.offcanvasShow);
        $(document).off('offcanvas-hide', this._eventListeners.offcanvasHide);
        this._$drawer.off('click', this._eventListeners.parentLinkClick);
        this._$drawer.off('click', this._eventListeners.returnLinkClick);
    }

    /**
     * Shows current category level in navigation (or parent category level if there is no nested category).
     */
    protected _showActiveCategoryLevel(): void {
        if (this._activeCategoryPath.length <= 1) {
            this._showRootLevel();
            return;
        }

        const activeCategoryId =
            this._activeCategoryPath[this._activeCategoryPath.length - 1];
        const $activeCategoryLink = $(
            `.${this._options.className}__link[data-category-id="${activeCategoryId}"]`
        );

        if (
            $activeCategoryLink.hasClass(
                `${this._options.className}__link--parent`
            )
        ) {
            this._showCategoryLevel(activeCategoryId);
        } else {
            const parentCategoryId =
                this._activeCategoryPath[this._activeCategoryPath.length - 2];
            this._showCategoryLevel(parentCategoryId);
        }
    }

    /**
     * Adds highlight classname to active category list item
     */
    protected _highlightActiveCategoryItem(): void {
        if (this._activeCategoryPath.length) {
            const activeCategoryId =
                this._activeCategoryPath[this._activeCategoryPath.length - 1];

            $(
                `.${this._options.className}__link[data-category-id="${activeCategoryId}"]`
            )
                .parent()
                .addClass(this._options.activeCategoryHighlightClass);
        }

        const activeCategoryId =
            this._activeCategoryPath[this._activeCategoryPath.length - 1];
        const $activeCategoryLink = $(
            `.${this._options.className}__link[data-category-id="${activeCategoryId}"]`
        );

        if (
            $activeCategoryLink.hasClass(
                `${this._options.className}__link--parent`
            )
        ) {
            this._showCategoryLevel(activeCategoryId);
        } else {
            const parentCategoryId =
                this._activeCategoryPath[this._activeCategoryPath.length - 2];
            this._showCategoryLevel(parentCategoryId);
        }
    }
}
