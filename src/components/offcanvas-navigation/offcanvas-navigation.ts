import * as $ from 'jquery';

import requireAsync from 'utils/require-async';
import { default as idleDeferred, IdleDeferred } from 'utils/idle-deffered';

/**
 * Component options interface.
 */
export interface OffcanvasNavigationOptions {
    className?: string;
    drawerClassName?: string;
    showCategoryIcon?: boolean;
    showProductsCount?: boolean;
    localStorageKey?: string;
    cacheTTL?: number;
    endpointPath?: string;
}

interface OffcanvasNavigationCache {
    html: string;
    updateTime?: number;
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
                drawerClassName: 'cs-offcanvas__drawer',
                showCategoryIcon: false,
                showProductsCount: false,
                localStorageKey: 'mgs-offcanvas-navigation',
                cacheTTL: 60 * 60,
                endpointPath: '/navigation/mobile/index',
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
        const cache = this._loadCache();
        const currentTime: number = Math.round(Date.now() / 1000);

        if (cache.updateTime + this._options.cacheTTL < currentTime) {
            this._setCache({ html: '', updateTime: 0 });
        }

        if (cache.html) {
            this._initHtml(cache.html);
        } else {
            this._idleDeferred = idleDeferred();
            this._idleDeferred
                .then(() => requireAsync(['mage/url']))
                .then(([mageUrl]) => mageUrl.build(this._options.endpointPath))
                .then(url => this._getHtml(url))
                .then(html => this._initHtml(html));
        }
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
        this._$drawer
            .empty()
            .append(this._$element)
            .trigger('contentUpdated');
        this._$parentLink = this._$element.find(
            `.${this._options.className}__link--parent`
        );
        this._$returnLink = this._$element.find(
            `.${this._options.className}__link--return`
        );

        this._addEventListeners();
    }

    /**
     * Fetches navigation HTML from cache or using AJAX from endpoint.
     * @param url AJAX endpoint URL.
     */
    protected _getHtml(url: string): JQuery.Deferred<string> {
        const deferred = jQuery.Deferred();
        const cache = this._loadCache();

        if (cache.html) {
            return deferred.resolve(cache.html);
        }

        $.get(url).then((html: string) => {
            this._setCache({ html: html });
            deferred.resolve(html);
        });

        return deferred;
    }

    protected _loadCache(): OffcanvasNavigationCache {
        let cache = { html: '', updateTime: 0 };
        try {
            $.extend(
                cache,
                JSON.parse(localStorage.getItem(this._options.localStorageKey))
            );
        } catch (error) {
            console.error(error);
        }

        return cache;
    }

    protected _setCache(cache: OffcanvasNavigationCache) {
        cache.updateTime = cache.updateTime || Math.floor(Date.now() / 1000);
        try {
            localStorage.setItem(
                this._options.localStorageKey,
                JSON.stringify(cache)
            );
        } catch (error) {
            console.error(error);
        }
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
