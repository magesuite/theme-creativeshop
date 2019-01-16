import * as $ from 'jquery';

import requireAsync from 'utils/require-async';
import { default as idleDeferred, IdleDeferred } from 'utils/idle-deffered';

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
    localStorageKey?: string;
    endpointPath?: string;
    authorizationLinkSelector?: string;
}

interface OffcanvasNavigationCache {
    key?: string;
    generationTime?: number;
    html?: string;
}

interface MainNavigationCacheInfo {
    key: string;
    generationTime: number;
}

/**
 * Offcanvas navigation component responsible for multilevel offcanvas navigation menu.
 */
export default class OffcanvasNavigation {
    protected _options: OffcanvasNavigationOptions;
    protected _$element: JQuery;
    protected _$drawer: JQuery;
    protected _$parentLink: JQuery;
    protected _$returnLink: JQuery;
    protected _idleDeferred: IdleDeferred;

    protected _eventListeners: {
        offcanvasShow?: (event: JQuery.Event) => void;
        offcanvasHide?: (event: JQuery.Event) => void;
        parentLinkClick?: (event: JQuery.Event) => void;
        returnLinkClick?: (event: JQuery.Event) => void;
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
                localStorageKey: 'mgs-offcanvas-navigation',
                cacheTTL: 60 * 60,
                endpointPath: '/navigation/mobile/index',
                currencySwitcherSelector: '.switcher-currency',
                languageSwitcherSelector: '.switcher-language',
                authorizationLinkSelector: '.authorization-link',
            },
            options
        );

        this._$drawer = $(`.${this._options.drawerClassName}`);
        if (!this._$drawer.length) {
            return;
        }

        this._initWhenIdle();
    }

    /**
     * Initializes offcanvas navigation either from cache or when browser enters idle state.
     */
    protected _initWhenIdle(): void {
        this._idleDeferred = idleDeferred();
        this._idleDeferred
            .then(() => requireAsync(['mage/url']))
            .then(([mageUrl]) => mageUrl.build(this._options.endpointPath))
            .then(url => this._getHtml(url))
            .then(html => this._initHtml(html));
    }

    /**
     * Forces offcanvas navigation initialization without waiting for browser idle period.
     */
    protected _forceInit(): void {
        if (this._idleDeferred) {
            this._idleDeferred.force();
        }
    }

    /**
     * Initializes given HTML and assigns all event listeners.
     * @param html Offcanvas navigation HTML loaded with AJAX or from cache.
     */
    protected _initHtml(html: string): void {
        this._$element = $(html);
        this._$drawer.empty().append(this._$element);

        this._$parentLink = this._$element.find(
            `.${this._options.className}__link--parent`
        );
        this._$returnLink = this._$element.find(
            `.${this._options.className}__link--return`
        );

        this._addEventListeners();
        this._initSwitchers();
        this._fixLoginLinks();
    }

    /**
     * Initializes language and currency switchers.
     */
    protected _initSwitchers(): void {
        const $offcanvasLanguageSwitcher: JQuery = this._$drawer.find(
            this._options.languageSwitcherSelector
        );
        const $mainLanguageSwitcher: JQuery = $('body')
            .find(this._options.languageSwitcherSelector)
            .not($offcanvasLanguageSwitcher);
        this._fixSwitcherLinks(
            $mainLanguageSwitcher,
            $offcanvasLanguageSwitcher
        );

        const $offcanvasCurrencySwitcher: JQuery = this._$drawer.find(
            this._options.currencySwitcherSelector
        );
        const $mainCurrencySwitcher: JQuery = $('body')
            .find(this._options.currencySwitcherSelector)
            .not($offcanvasCurrencySwitcher);
        this._fixSwitcherLinks(
            $mainCurrencySwitcher,
            $offcanvasCurrencySwitcher
        );

        requireAsync(['mage/apply/main']).then(([mage]) => mage.apply());
    }

    /**
     * Fixes links in given switchers caused by they being generated under async URL.
     * @param $mainSwitcher Reference to switcher outside of offcanvas.
     * @param $offcanvasSwitcher Reference to switcher inside offcanvas.
     */
    protected _fixSwitcherLinks(
        $mainSwitcher: JQuery,
        $offcanvasSwitcher: JQuery
    ) {
        const $mainSwitcherLinks = $mainSwitcher.find('a');
        const $offcanvasSwitcherLinks = $offcanvasSwitcher.find('a');
        $mainSwitcherLinks.each((index: number, element: HTMLElement) => {
            $offcanvasSwitcherLinks
                .eq(index)
                .data('post', $(element).data('post'));
        });
    }

    /**
     * Fixes login link URL caused by using AJAX endpoint and invalid referer.
     */
    protected _fixLoginLinks() {
        const $mainLoginLink = $(this._options.authorizationLinkSelector).find(
            'a'
        );
        const $offcanvasLoginLink = this._$drawer.find(
            '.cs-offcanvas-navigation__link--sign-in'
        );
        $offcanvasLoginLink.attr('href', $mainLoginLink.attr('href'));
    }

    /**
     * Fetches navigation HTML from cache or using AJAX from endpoint.
     * @param url AJAX endpoint URL.
     */
    protected _getHtml(url: string): JQuery.Deferred<string> {
        const deferred = jQuery.Deferred();
        const cacheInfo = this._getCacheInfo();
        const cache = this._loadCache();

        if (
            cache.key === cacheInfo.key &&
            cache.generationTime >= cacheInfo.generationTime
        ) {
            return deferred.resolve(cache.html);
        }

        $.get(url).then((html: string) => {
            this._setCache(cacheInfo.key, html);
            deferred.resolve(html);
        });

        return deferred;
    }

    protected _loadCache(): OffcanvasNavigationCache {
        let cache = {};
        try {
            $.extend(
                cache,
                JSON.parse(localStorage.getItem(this._options.localStorageKey))
            );
        } catch (error) {
            console.error(error);
            // Cache may be corrupted from previous implementation.
            localStorage.removeItem(this._options.localStorageKey);
        }

        return cache;
    }

    protected _setCache(key: string, html: string) {
        const cache: OffcanvasNavigationCache = {
            key: key,
            html: html,
            generationTime: Math.floor(Date.now() / 1000),
        };

        try {
            localStorage.setItem(
                this._options.localStorageKey,
                JSON.stringify(cache)
            );
        } catch (error) {
            console.error(error);
        }
    }

    protected _getCacheInfo(): MainNavigationCacheInfo {
        const $navigation = $(`.${this._options.navigationClassName}`);

        return {
            key: $navigation.data('cache-key'),
            generationTime: $navigation.data('cache-generation-time'),
        };
    }

    /**
     * Shows next navigation level based on clicked parent link.
     * @param {Event} event [description]
     */
    protected _showLevel(event: Event): void {
        event.preventDefault();
        const $levelToShow = $(event.target).hasClass(
            `${this._options.className}__link--parent`
        )
            ? $(event.target).next()
            : $(event.target)
                  .parents(`.${this._options.className}__link--parent`)
                  .first()
                  .next();
        const $currentLevel = $(`.${this._options.className}__list--current`);

        if ($currentLevel.length > 0) {
            $currentLevel.animate({ scrollTop: 0 }, 'medium', () => {
                $currentLevel.removeClass(
                    `${this._options.className}__list--current`
                );
                $levelToShow.addClass(
                    `${this._options.className}__list--active ${
                        this._options.className
                    }__list--current`
                );
            });
        } else {
            $levelToShow.addClass(
                `${this._options.className}__list--active ${
                    this._options.className
                }__list--current`
            );
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
        $levelToHide.removeClass(
            `${this._options.className}__list--active ${
                this._options.className
            }__list--current`
        );
        $levelToHide
            .parent()
            .closest(`.${this._options.className}__list`)
            .addClass(`${this._options.className}__list--current`);
    }
    /**
     * Resets levels to root.
     */
    protected _resetLevels(): void {
        const $levelsToHide = this._$element.find(
            `.${this._options.className}__list`
        );
        // Reset all levels.
        $levelsToHide.removeClass(
            `${this._options.className}__list--active ${
                this._options.className
            }__list--current`
        );
        // Set root level to current.
        $levelsToHide
            .eq(0)
            .addClass(`${this._options.className}__list--current`);
    }
    /**
     * Sets up event listeners for a component.
     */
    protected _addEventListeners(): void {
        this._eventListeners.offcanvasShow = this._forceInit.bind(this);
        $(document).on('offcanvas-show', this._eventListeners.offcanvasShow);

        this._eventListeners.offcanvasHide = this._resetLevels.bind(this);
        $(document).on('offcanvas-hide', this._eventListeners.offcanvasHide);

        this._eventListeners.parentLinkClick = this._showLevel.bind(this);
        this._$parentLink.on('click', this._eventListeners.parentLinkClick);

        this._eventListeners.returnLinkClick = this._hideLevel.bind(this);
        this._$returnLink.on('click', this._eventListeners.returnLinkClick);
    }
    /**
     * Removes event listeners for a component.
     */
    protected _removeEventListeners(): void {
        $(document).off('offcanvas-show', this._eventListeners.offcanvasShow);
        $(document).off('offcanvas-hide', this._eventListeners.offcanvasHide);
        this._$parentLink.off('click', this._eventListeners.parentLinkClick);
        this._$returnLink.off('click', this._eventListeners.returnLinkClick);
    }
}
