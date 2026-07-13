import * as $ from 'jquery';
import 'mage/translate';

import { MarkerClusterer, Renderer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'; // The library creates and manages per-zoom-level clusters for large amounts of markers.

declare global {
    interface Window {
        breakpoint: any;
        googleApiConsentRequired: boolean;
    }
}

/**
 * Store locator component options interface.
 */
export interface StoreLocatorOptions {
    mapOptions?: any;
    basicZoom?: number;
    basicZoomSmallDesktop?: number;
    basicZoomMobile?: number;
    showNearestStoreWhenNotFound?: boolean;
    markerIcons: Record<string, any>;
    clusterOptions?: Record<string, any>;
    clusterStyles?: object;
    selectors: Record<string, any>;
    limitOfShopsInitiallyDisplayed?: number;
    storeData?: string;
    consentInfo?: {
        additionalClasses: string;
        text: string;
    };
}

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Storelocator component provide a Google maps with markers for store subsidiaries. In the sidebar the is a list of shops that are currently visible on the map.
 * Clicking on marker displays and information popup with custom template.
 * In the sidebra there is search input.
 *
 * Storelocator is initialized in store-locator/index.ts file. the class accepts 2 arguments - jquery dom element and optional options.
 * To learn more about possible options take a look at defaults options -  `_options` field.
 *
 * When the StoreLocator class is initialized first a google map is initialized on DOM element with `store-locator-map` ID.
 * Then graphql to the backend in sent to fetch all stores and their details.
 * Also `_attachEvents` method is executed - this method attaches events not directly connected to the map. There is for example sidebar toggle, direction or breakpoints changes related events
 * When the request succeeds response.data.storePickupLocations.items are assigned to the class's `this.stores` array and `_initMap` method is executed.
 *
 * `_initMap` method takes care of creating markers on the map and also tries to set user's location and zoom map to displays shop in the area.
 * It also populate left sidebar with stores boxes. When zoom is small only displays only limited number of stores and button show more - which displays all shops.
 * When zoom is bigger all shops that are currently visible on the map are displayed.
 *  *
 * When user searches for a location in sidebar input we perform request to backend in order to get coordinates of query (method `searchButtonClickHandler`).
 * Then we pan (it means that we center the map o this point and zoom to show this area) to coordinates returned by backend and set user location to this point.
 * We also recalculate distances for all stores.
 *
 * When a user types anything in the search form modified Magento search widget is executed (magesuite.quickSearch). To learn more see comments in store-locator/form-mini.js
 *
 */

export default class StoreLocator {
    protected _$element: JQuery;
    protected _$sidebarToggler: JQuery;
    protected _$locationButton: JQuery;
    protected _$searchButton: JQuery;
    protected _$searchForm: JQuery;
    protected _$itemsList: JQuery;
    protected _$searchInput: JQuery;
    protected _consentRequired: boolean;

    protected _sidebarClosed: boolean;

    protected _options: StoreLocatorOptions = {
        mapOptions: {
            // To learn more about possible google map options visit: https://developers.google.com/maps/documentation/javascript/controls
            zoom: 7, // initial zoom set when maps is loaded. It is usually quite small to show at least greater part od area when stores are located
            center: { lat: 51, lng: 9 }, // coordinates for initial central point of the map. By default they are set to show the most of Germany area
            mapTypeControl: false, // see official google documentation
            streetViewControl: false, // see official google documentation
            fullscreenControl: false, // see official google documentation
            mapId: 'DEMO_MAP_ID', // Map ID is required for advanced markers.
        },
        basicZoom: 13, // basic zoom (also for small desktop/tablet and mobile - see 2 options below) is set when the map center on specific location (for example when the user is geolocalized or when we pan to a specific store or a location)
        basicZoomSmallDesktop: 12,
        basicZoomMobile: 11,
        showNearestStoreWhenNotFound: false, // when set to true and no stores are found in the current zoom and location, show the nearest store
        markerIcons: {
            // sizes for markers in px
            pin: {
                sizes: {
                    x: 18,
                    y: 25,
                },
            },
            pinAlt: {
                sizes: {
                    x: 18,
                    y: 25,
                },
            },
            pinActive: {
                sizes: {
                    x: 18,
                    y: 25,
                },
            },
            userLocation: {
                sizes: {
                    x: 25,
                    y: 25,
                },
            },
        },
        selectors: {
            storelocatorItem: '[data-role="storelocator-item"]',
            storelocatorItemHoursTrigger: '[data-role="storelocator-hours-trigger"]',
            storelocatorSidebarClose: '[data-role="storelocator-sidebar-close"]',
        },
        clusterStyles: {
            // styles for clusters (circles that groups stores ans show their amount of there is no space to show all markers separately)
            url: '',
            height: 22,
            width: 22,
            textSize: 12,
            textColor: '#fff',
            backgroundPosition: 'center',
        },
        limitOfShopsInitiallyDisplayed: 50, // Browsers have problems with rendering hundreds or thousands os store in the sidebar. If there is a lot os subsidiaries limit is necessary to avoid performance problems
        storeData: `
            name
            latitude
            longitude
            city
            street
            postCode
            description
            sourceCode
            countryId
            phone
            fax
            email
            url
        `, // fields that graphql call to the backend requests
        consentInfo: {
            additionalClasses: 'cs-consent-management--googlemaps',
            text: $.mage.__(
                'To view this content please enable Google Maps in <button class="cs-consent-management__button">Privacy Settings</button>'
            ),
        },
    };

    protected stores: any[] = []; // array will all stores and their details that GraphQL request returns

    protected _allItemsRendered: boolean = false; // initially we do not render all stores in the left sidebar even if all markers are visible on the map because of performance problems. However if user a requests more shops by clicking on the more button all stores are rendered and later are nor rerendered again but only filtered
    protected _basePath: string;

    protected map: any;
    protected markers: any;
    protected cluster: any;

    protected _userPosition: Coordinates | null;
    protected _sidebarWidth: number = 0;
    protected _activeMarker: any;
    protected _locationMarker: any;
    protected _activeStoreId: string;

    protected _infoWindow: any; // there is only one info window (popup) withe details for all markers. Only content is changed when info window is requested

    protected consentManagement: any;

    /**
     * Creates new Store Locator component with optional settings.
     * @param  {StoreLocatorOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: StoreLocatorOptions) {
        this._$element = $element || $('.cs-store-locator');
        this._options = $.extend(true, this._options, options);

        this._$sidebarToggler = this._$element.find('.cs-store-locator__sidebar-toggler');

        this._$locationButton = this._$element.find('.cs-store-locator__location-button');

        this._$searchButton = this._$element.find('.cs-store-locator__search-button');

        this._$searchForm = this._$element.find('.cs-store-locator__search-form');

        this._$searchInput = this._$element.find('.cs-store-locator__search-input');

        this._$itemsList = this._$element.find('.cs-store-locator__stores-list-inner');

        this._basePath = this._$element.attr('data-base-path');
        this._consentRequired = window.googleApiConsentRequired;

        this._sidebarWidth = this._$element.find('.cs-store-locator__sidebar')[0]?.offsetWidth ?? 0;

        if (this._consentRequired) {
            this.initConsentManagedScriptLoader();
        } else {
            this._$element.addClass('loading');
            this.init();
        }
    }

    /**
     * Async. Init ScriptLoader.
     */
    public async initConsentManagedScriptLoader(): Promise<any> {
        const { default: consentManagement } = await import('components/consent-management');

        this.consentManagement = consentManagement;
        this.consentManagement.initializeEvent(this.loadMap.bind(this));
        this.consentManagement.changeEvent(this.loadMap.bind(this));
    }

    public async loadMap(): Promise<void> {
        try {
            const consentGranted: boolean = await this.consentManagement.checkConsent('googlemaps');

            if (consentGranted) {
                this.attachApiReadyEvent(this.apiReady.bind(this));
                await import('components/consent-management/script-loader');
            } else {
                this.showConsentInfo();
            }
        } catch (error) {
            console.error('Error loading Google Maps: ', error);
        }
    }

    /**
     * Wait for Goole Maps API to be loaded.
     * Confirmed by emitting `googlemaps:loaded` event.
     */
    public attachApiReadyEvent(callback: () => void): void {
        window.addEventListener('googlemaps:loaded', (e: Event) => {
            callback();
        });
    }

    /**
     * Proceed with the script when Google Maps API is ready.
     * This action includes hiding consent info
     * and further Store Locator script initialization.
     */
    public apiReady(): void {
        this.hideConsentInfo();
        this.init();
    }

    /**
     * Show consent info if consent is not given
     */
    public async showConsentInfo() {
        await this.consentManagement.mountConsentLayer(this._$element[0], {
            classModifier: this._options.consentInfo.additionalClasses,
            text: this._options.consentInfo.text,
        });

        this.consentManagement.toggleConsentLayerVisibility(this._$element[0], true);
    }

    /**
     * Hide consent info.
     */
    public async hideConsentInfo() {
        this.consentManagement.toggleConsentLayerVisibility(this._$element[0], false);
    }

    /**
     * Initialize Store Locator
     * when API is ready.
     */
    public init(): void {
        if (!this.isGoogleMapsApiAvailable()) {
            this._$element.removeClass('loading');
            return;
        }

        // Set map styling
        this._setMapId();

        // Mount map
        this._mountMap();

        // Send graphql request for stores and initialize map
        this._prepareMap();

        // Attach events to elements that are not directly connected to the map
        this._attachEvents();
    }

    protected isGoogleMapsApiAvailable(): boolean {
        return typeof google !== 'undefined' && !!google.maps;
    }

    /**
     * Set mapId from data attribute or use default one (DEMO_MAP_ID)
     */
    public _setMapId(): void {
        const mapId = this._$element.attr('data-map-id');

        if (mapId) {
            this._options.mapOptions.mapId = mapId;
        }
    }

    /**
     * Mount map on the DOM element with `store-locator-map` ID
     */
    public _mountMap() {
        this.map = new google.maps.Map(
            document.getElementById('store-locator-map'),
            this._options.mapOptions
        );
    }

    /**
     * Send graphql request for stores, hide loader and then initialize map
     */
    public _prepareMap() {
        // Send graphql request for stores
        $.post({
            url: this._basePath + 'graphql',
            data: JSON.stringify({
                query: `{
                    storePickupLocations {
                      items {
                        ${this._options.storeData}
                      }
                    }
                  }`,
            }),
            contentType: 'application/json',
        }).done((response) => {
            if (response.data) {
                this.stores = response.data.storePickupLocations.items
                    .map((store: any) => ({
                        ...store,
                        latitude: parseFloat(store.latitude),
                        longitude: parseFloat(store.longitude),
                    }))
                    .filter((store: any) => !isNaN(store.latitude) && !isNaN(store.longitude));
            }

            this._initMap();
        });
    }

    /**
     * Get coordinations from the backend based on search input query.
     * If backend returns coordinates:
     * Pan to coordinates.
     * Set new user position on the map and recalculate distances for stores.
     * In the left sidebar show only stores visible on the map.
     * If backend does not return coordinates prepare and display message nolocation for 5s
     */
    public searchButtonClickHandler() {
        const query: string | number | string[] = this._$searchInput.val() ?? '';

        this._$searchForm.addClass('loading');

        return this.getCoordinatesFromQuery(query as string).then((response) => {
            if (
                response.data.addressLocation &&
                response.data.addressLocation.latitude &&
                response.data.addressLocation.longitude
            ) {
                const coordinates: Coordinates = {
                    lat: response.data.addressLocation.latitude,
                    lng: response.data.addressLocation.longitude,
                };

                this.map.panTo(coordinates);

                const windowWidth = window.breakpoint.current;

                if (windowWidth < window.breakpoint.laptop) {
                    this.map.setZoom(this._options.basicZoomMobile);
                } else if (
                    windowWidth >= window.breakpoint.laptop &&
                    windowWidth < window.breakpoint.laptopLg
                ) {
                    this.map.setZoom(this._options.basicZoomSmallDesktop);
                } else {
                    this.map.setZoom(this._options.basicZoom);
                }

                this.setUserPositionAndPopulateDistance(this.stores, coordinates);

                if (
                    this._options.showNearestStoreWhenNotFound &&
                    !this.getFilteredStores().length
                ) {
                    this.showNearestStoreView(coordinates);
                }

                if (windowWidth < window.breakpoint.laptop) {
                    this.renderMobileStoresList();
                } else {
                    this.renderItems(this.getFilteredStores(), false);
                }

                if (this._locationMarker) {
                    this._locationMarker.setMap(null);
                }

                const pinEl = this._createPinDiv(
                    this._options.markerIcons.pin.url,
                    this._options.markerIcons.pin.sizes.x,
                    this._options.markerIcons.pin.sizes.y
                );

                this._locationMarker = new google.maps.marker.AdvancedMarkerElement({
                    map: this.map,
                    position: coordinates,
                    content: pinEl,
                    gmpClickable: true,
                });
            } else {
                $('.cs-store-locator__empty-message--nolocation').remove();
                this._$itemsList.prepend(this.messageNoLocationFound);

                if (window.breakpoint.current < window.breakpoint.laptop) {
                    this.openMobileStores();
                }

                $('.cs-store-locator__empty-message--nolocation').show();

                setTimeout(() => {
                    $('.cs-store-locator__empty-message--nolocation').slideUp().remove();
                    if (window.breakpoint.current < window.breakpoint.laptop) {
                        this.closeMobileStores();
                    }
                }, 5000);
            }
            this._$searchForm.removeClass('loading');
        });
    }

    /**
     * Add additional distance info for stores objects, assigned user position to `this._userPosition` class field
     */
    public setUserPositionAndPopulateDistance(
        stores: any[],
        userPosition: Coordinates | null
    ): void {
        this.stores = this.populateStoresDistance(stores, userPosition);

        this.stores = this.stores.sort((a, b) => {
            return a.distance - b.distance;
        });

        this._userPosition = userPosition;
    }

    /**
     * Returns translated HTML message shown when no stores are found in the current map area.
     */
    public messageNoStores(): string {
        return `<div class="cs-store-locator__empty-message">${$.mage.__(
            'Unfortunately we do not have any stores in your area. Please zoom the map to see bigger area.'
        )}</div>`;
    }

    /**
     * Returns translated HTML message with a "Show more stores" trigger shown when the store list is truncated.
     */
    public messageShowMoreStores(): string {
        return `<div class="cs-store-locator__stores-more-wrapper"><span class="cs-store-locator__stores-more-text">${$.mage.__(
            'Show more stores'
        )}</span></div>`;
    }

    /**
     * Returns translated HTML message shown when the geocoder cannot resolve the searched location.
     */
    public messageNoLocationFound(): string {
        return `<div class="cs-store-locator__empty-message cs-store-locator__empty-message--nolocation">${$.mage.__(
            'Unfortunately we were not able to find this location.'
        )}</div>`;
    }

    /**
     * Returns translated HTML message shown when the browser geolocation API is unavailable or denied.
     */
    public messageGeolocationDisabled(): string {
        return `<div class="cs-store-locator__empty-message cs-store-locator__empty-message--geolocation-disabled"><span>${$.mage.__(
            'Unfortunately geolocation is not enabled on your device or browser.'
        )}</span></div>`;
    }

    /**
     * Render stores list in the left sidebar.
     * If all stores are already rendered just return.
     * If not, empty the sidebar and render stores - all of only part of them based on renderAllStores parameter.
     * If only part of stores, that are currently visible on the map are shown in the left sidebar, are visible (this happens when zoom is small and we do not know user location or search query location)
     * displays Show more button and on click on it render all other stores.
     *
     * @param {Array} stores all stores
     * @param {renderAllStores} boolean Info if all stores should be rendered
     */
    public async renderItems(stores: any[], renderAllStores: boolean): Promise<void> {
        if (this._allItemsRendered && !(window.breakpoint.current < window.breakpoint.laptop)) {
            return;
        }

        const limit = this._options.limitOfShopsInitiallyDisplayed ?? 50;
        const storesToRender = renderAllStores ? stores : stores.slice(0, limit);

        const htmlItems = await Promise.all(
            storesToRender.map((store) => this.getInfoWindowContent(store, 'sidebar'))
        );
        this._$itemsList[0].innerHTML = htmlItems.join('');

        if (stores.length === 0) {
            this._$itemsList.append(this.messageNoStores);
        }

        if (stores.length > limit && !renderAllStores) {
            this._$itemsList.append(this.messageShowMoreStores);

            this._$itemsList.find('.cs-store-locator__stores-more-wrapper').on('click', () => {
                this._$element.addClass('loading');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.renderItems(this.stores, true);
                        this._allItemsRendered = true;
                        this._$element.removeClass('loading');
                        this.mapChangeHandler();
                    });
                });
            });
        }
    }

    /**
     * Return only stores visible on map.
     * Stores are sorted by distance - which is a distance to the user location or location that was searched in the sidebar input,
     */
    public getFilteredStores(): any[] {
        const bounds = this.map.getBounds();

        if (!bounds) {
            return this._userPosition ? this.stores : [];
        }

        return this.stores.filter((store) =>
            bounds.contains({
                lat: store.latitude,
                lng: store.longitude,
            })
        );
    }

    /**
     * Localize and pan map to coordinates
     * If user was not localized before set distances for stores, and render items in the sidebar
     */
    public locationButtonClickHandler() {
        this.getGeolocation().then((coordinates: Coordinates) => {
            if (!coordinates) {
                return;
            }

            this.map.panTo(coordinates);

            const windowWidth = window.breakpoint.current;

            if (windowWidth < window.breakpoint.laptop) {
                this.map.setZoom(this._options.basicZoomMobile);
            } else if (
                windowWidth >= window.breakpoint.laptop &&
                windowWidth < window.breakpoint.laptopLg
            ) {
                this.map.setZoom(this._options.basicZoomSmallDesktop);
            } else {
                this.map.setZoom(this._options.basicZoom);
            }

            if (this._options.showNearestStoreWhenNotFound && !this.getFilteredStores().length) {
                this.showNearestStoreView(coordinates);
            }

            if (coordinates !== this._userPosition) {
                this._$itemsList.empty();
                this._allItemsRendered = false;

                this.setUserPositionAndPopulateDistance(this.stores, coordinates);

                if (windowWidth < window.breakpoint.laptop) {
                    this.renderMobileStoresList();
                } else {
                    this.renderItems(this.getFilteredStores(), false);
                }

                if (this._locationMarker) {
                    this._locationMarker.setMap(null);
                }

                const pinEl = this._createPinDiv(
                    this._options.markerIcons.userLocation.url,
                    this._options.markerIcons.userLocation.sizes.x,
                    this._options.markerIcons.userLocation.sizes.y
                );

                this._locationMarker = new google.maps.marker.AdvancedMarkerElement({
                    map: this.map,
                    position: coordinates,
                    content: pinEl,
                    gmpClickable: true,
                });
            }

            this._$element.removeClass('loading');
        });
    }

    /**
     * Render stores on mobile
     */
    public renderMobileStoresList() {
        this.closeMobileStores();

        const filteredStores = this.getFilteredStores().slice(0, 9);
        this.renderItems(filteredStores, false);

        setTimeout(() => {
            this.openMobileStores();

            this._$itemsList.append('<div class="cs-store-locator__store-list-close"></div>');
            this._$itemsList.find('.cs-store-locator__store-list-close').on('click', (event) => {
                this.closeMobileStores();
            });
            const $emptyMessage = this._$element.find('.cs-store-locator__empty-message');

            if (filteredStores.length > 0) {
                $emptyMessage.hide();
            } else {
                $emptyMessage.show();
            }
        }, 1000);
    }

    /**
     * Show info window for marker
     */
    public markerClickHandler(marker: any, storeId: string) {
        this.updateActiveMarkerIcon(marker);

        this._activeStoreId = storeId;

        if (window.breakpoint.current < window.breakpoint.laptop) {
            this.closeMobilePopup();
            this.openMobilePopup(this._activeStoreId);
        }

        this.panToStore(storeId);
    }

    /**
     * Pan to clicked store on the map, show info window
     */
    public selectStore(currentItem: JQuery) {
        const id = currentItem.attr('data-id') ?? '';

        if (this.markers) {
            const marker = this.markers.find((marker) => marker.storeId === id);

            if (marker) {
                this.updateActiveMarkerIcon(marker);
            }
        }

        this.panToStore(id);
        this._activeStoreId = id;

        if (window.breakpoint.current < window.breakpoint.laptop) {
            this.closeMobileStores();
            this.openMobilePopup(id);
        }
    }

    /**
     * Set active marker
     */
    public updateActiveMarkerIcon(marker: any) {
        if (this._activeMarker) {
            this._activeMarker.content = this._createPinDiv(
                this._options.markerIcons.pin.url,
                this._options.markerIcons.pin.sizes.x,
                this._options.markerIcons.pin.sizes.y
            );
        }

        this._activeMarker = marker;
        this._activeMarker.content = this._createPinDiv(
            this._options.markerIcons.pinActive.url,
            this._options.markerIcons.pinActive.sizes.x,
            this._options.markerIcons.pinActive.sizes.y
        );
    }

    /**
     * Pan to clicked store on the map, show info window
     */
    public async panToStore(id: string) {
        if (!this._infoWindow) {
            return;
        }

        this._infoWindow.close(this.map, this._activeMarker);

        const store = this.stores.find((store) => store.sourceCode === id);

        if (!store) {
            return;
        }

        const coordinates: Coordinates = {
            lat: store.latitude,
            lng: store.longitude,
        };
        this.map.panTo(coordinates);

        if (this.map.getZoom() < this._options.basicZoom) {
            this.map.setZoom(this._options.basicZoom);
        }

        if (window.breakpoint.current >= window.breakpoint.laptop && !this._sidebarClosed) {
            this.map.panBy(-this._sidebarWidth / 2, 0);
        }

        if (window.breakpoint.current >= window.breakpoint.laptop) {
            this._infoWindow.setContent(await this.getInfoWindowContent(store, 'pin'));
            this._infoWindow.open(this.map, this._activeMarker);
        }
    }

    /**
     * Return custom html template for sidebar store info box.
     */
    public async getInfoWindowContent(store: any, area?: string): Promise<any> {
        const { default: requireAsync } = await import('utils/require-async');
        const { infoWindowContent } =
            await import('MageSuite_StoreLocator/web/js/store-locator/template');
        const templateOptions = this.getStoreData(store, area);
        const [mageTemplate] = await requireAsync(['mage/template']);
        return mageTemplate(infoWindowContent, templateOptions);
    }

    public getStoreData(store: any, area?: string): Object {
        return {
            area: area ?? '',
            sourceCode: store.sourceCode ?? '',
            latitude: store.latitude,
            longitude: store.longitude,
            city: store.city ?? '',
            title: store.name,
            routeLabel: $.mage.__('Route'),
            routeLink: store.routeLink,
            postCode: store.postCode ?? '',
            street: store.street ?? '',
            phoneLabel: $.mage.__('Tel'),
            phone: store.phone ?? '',
            faxLabel: $.mage.__('Fax'),
            fax: store.fax ?? '',
            emailLabel: $.mage.__('E-Mail'),
            email: store.email ?? '',
            urlLabel: $.mage.__('Website'),
            url: store.url ?? '',
            description: store.description ?? '',
            openingHours: store.openingHours ?? '',
            distanceLabel: $.mage.__('Distance'),
            distance: store.distance ?? '',
        };
    }

    /**
     * Get user location from based on window navigator
     */
    public getGeolocation(): Promise<object> {
        this._$element.addClass('loading');
        $('.cs-store-locator__empty-message--geolocation-disabled').remove();

        return new Promise((resolve, reject) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (error) => {
                        this.geolocationErrorHandler();
                        reject(new Error('Geolocation not enabled'));
                    }
                );
            } else {
                this.geolocationErrorHandler();
                reject(new Error('Geolocation not supported'));
            }
        });
    }

    public geolocationErrorHandler() {
        const geolocationMessage = this.messageGeolocationDisabled;

        if (window.breakpoint.current < window.breakpoint.laptop) {
            $('.cs-store-locator__search').append(geolocationMessage);
        } else {
            this._$itemsList.prepend(geolocationMessage);
        }

        this._$element.removeClass('loading');
    }

    /**
     * Toggle sidebar
     */
    public toggleSidebar(): void {
        if (!this._sidebarClosed) {
            $('.cs-store-locator__sidebar').addClass('cs-store-locator__sidebar--closed');
            $('.cs-store-locator__sidebar-toggler-icon').addClass(
                'cs-store-locator__sidebar-toggler-icon--closed'
            );
        } else {
            $('.cs-store-locator__sidebar').removeClass('cs-store-locator__sidebar--closed');
            $('.cs-store-locator__sidebar-toggler-icon').removeClass(
                'cs-store-locator__sidebar-toggler-icon--closed'
            );
        }
        this._sidebarClosed = !this._sidebarClosed;
    }

    /**
     * Filter items in sidebar - show only store visible on map.
     * If there are no markers visible on the map show empty message
     */
    public filterItems(): void {
        const bounds = this.map.getBounds();

        if (!bounds) {
            return;
        }

        const visibleIds = new Set(
            this.stores
                .filter((store) =>
                    bounds.contains({
                        lat: store.latitude,
                        lng: store.longitude,
                    })
                )
                .map((store) => store.sourceCode)
        );

        requestAnimationFrame(() => {
            this._$itemsList[0]
                .querySelectorAll<HTMLElement>(this._options.selectors.storelocatorItem)
                .forEach((el) => {
                    el.style.display = visibleIds.has(el.dataset.id) ? '' : 'none';
                });

            const emptyMessage = this._$itemsList[0].querySelector<HTMLElement>(
                '.cs-store-locator__empty-message'
            );

            if (emptyMessage) {
                emptyMessage.style.display = visibleIds.size > 0 ? 'none' : 'block';
            }
        });
    }

    /**
     * Returns coordinates based on given search query.
     */
    public getCoordinatesFromQuery(query: string): any {
        return $.post({
            url: this._basePath + 'graphql',
            data: JSON.stringify({
                query: `{
                    addressLocation (
                        query: "${query}"
                    ) {
                        latitude
                        longitude
                    }
                  }`,
            }),
            contentType: 'application/json',
        });
    }

    /**
     * Calculate distance from *location* to every store in array
     * @param {Array} stores Array of stores (see options.storeData for a single store object)
     * @param {Coordinates} coordinates Coordinates object { lat, lng }
     * @returns {Array} stores
     */
    public populateStoresDistance(stores: any[], coordinates: Coordinates | null): object {
        return stores.map((store) => {
            return {
                ...store,
                distance: this.calculateDistance(
                    store.latitude,
                    store.longitude,
                    coordinates ? coordinates.lat : store.latitude,
                    coordinates ? coordinates.lng : store.longitude
                ),
            };
        });
    }

    /**
     * Sidebar (which on mobiles is located on the top of the map) mobile behavior is quite different then desktop. Below are some method for mobile functionalities.
     * @param {String} id id of a store
     */
    public async openMobilePopup(id: string) {
        const store = this.stores.find((store) => store.sourceCode === id);

        $('.cs-store-locator__store-details').append(
            await this.getInfoWindowContent(store, 'mobile')
        );

        this._$element.addClass('cs-store-locator--mobile-popup-open');
    }

    public closeMobilePopup() {
        $('.cs-store-locator__store-details').html('');

        this._$element.removeClass('cs-store-locator--mobile-popup-open');
        this._$element.removeClass('cs-store-locator--mobile-stores-open');
    }

    public openMobileStores() {
        this._$element.addClass('cs-store-locator--mobile-stores-open');
        this._$element.removeClass('cs-store-locator--mobile-popup-open');
    }

    public closeMobileStores() {
        this._$element.removeClass('cs-store-locator--mobile-stores-open');
    }

    public windowResizeHandler(): void {
        if (window.breakpoint.current >= window.breakpoint.laptop) {
            this.closeMobilePopup();
        }
    }

    /**
     * This is an important method responsible for displaying in the sidebar only store that are currently visible on the map.
     */
    public mapChangeHandler() {
        if (window.breakpoint.current < window.breakpoint.laptop) {
            return;
        }

        if (this._allItemsRendered) {
            this.filterItems();
        } else {
            this.renderItems(this.getFilteredStores(), false);
        }
    }

    public zoomChangeHandler() {
        this.closeMobilePopup();
    }

    /**
     * Calculate distance between two points on Earth in km
     * @param {Number} lat1 Point 1 - latitude
     * @param {Number} lng1 Point 1 - longitude
     * @param {Number} lat2 Point 2 - latitude
     * @param {Number} lng2 Point 2 - longitude
     * @returns {Number} Distance between 2 points on earth in km
     */
    public calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const deltaLat = (Math.abs(lat1 - lat2) * Math.PI) / 180;
        const deltaLng = (Math.abs(lng1 - lng2) * Math.PI) / 180;
        const lat1Radians = (lat1 * Math.PI) / 180;
        const lat2Radians = (lat2 * Math.PI) / 180;

        const R = 6371; // Earth radius in km
        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1Radians) *
                Math.cos(lat2Radians) *
                Math.sin(deltaLng / 2) *
                Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Number((R * c).toFixed(2));
    }

    /**
     * Method takes current coordinates and finds the nearest store
     * to center the map between it and a current location.
     */
    public showNearestStoreView(currentCoordinates: Coordinates): void {
        if (!this.stores.length) {
            return;
        }

        const closest: { store: any; distance: number } = this.stores.reduce(
            (closestStore, store) => {
                const distance = this.calculateDistance(
                    currentCoordinates.lat,
                    currentCoordinates.lng,
                    store.latitude,
                    store.longitude
                );
                return !closestStore || distance < closestStore.distance
                    ? { store, distance }
                    : closestStore;
            },
            null
        );

        const bounds = new google.maps.LatLngBounds();
        bounds.extend({
            lat: currentCoordinates.lat,
            lng: currentCoordinates.lng,
        });
        bounds.extend({
            lat: closest.store.latitude,
            lng: closest.store.longitude,
        });

        this.map.fitBounds(bounds);
    }

    /**
     * The method executes methods that take care of creating markers on the map.
     * It also checks if browser's geolocation service is available and if so it executes `setUserPositionAndPopulateDistance` method that set user's location on the map and calculate distances to the stores.
     * When the information about access to geolocation is known (coordinations of the user are known), in the sidebar we display list of subsidiaries.
     * In the case when location is known we displayed stores info for markers that are visible on the map - `renderItems` method is executed with filtered stores (`getFilteredStores` method is responsible for returnig only store visible on the map).
     * When we do not know user location stores from `stores` object are rendered limited by `limitOfShopsInitiallyDisplayed`
     * In every case `_attachMapListeners` method is executed that bounds `mapChangeHandler` and `zoomChangeHandler`.
     * mapChangeHandler is important method responsible for displaying in the sidebar only store that are currently visible on the map.
     */
    protected async _initMap(): Promise<void> {
        this._setMarkerIcons();

        const [, coordinates] = await Promise.all([
            this._createMarkers().catch((error) => {
                console.error('Failed to create markers:', error);
            }),
            this.getGeolocation().catch(() => null) as Promise<Coordinates | null>,
        ]);

        this.setUserPositionAndPopulateDistance(this.stores, coordinates);

        if (coordinates) {
            if (this._locationMarker) {
                this._locationMarker.setMap(null);
            }

            const pinEl = this._createPinDiv(
                this._options.markerIcons.userLocation.url,
                this._options.markerIcons.userLocation.sizes.x,
                this._options.markerIcons.userLocation.sizes.y
            );

            this._locationMarker = new google.maps.marker.AdvancedMarkerElement({
                map: this.map,
                position: coordinates,
                content: pinEl,
                gmpClickable: true,
            });

            this.map.panTo(coordinates);
            this.map.setZoom(this._options.basicZoom);

            if (this._options.showNearestStoreWhenNotFound && !this.getFilteredStores().length) {
                this.showNearestStoreView(coordinates);
            }

            this.renderItems(this.getFilteredStores(), false);
        } else {
            this.renderItems(this.stores, false);
        }

        this._attachMapListeners();
        this.mapChangeHandler();
        this._$element.removeClass('loading');
    }

    /**
     * Creating a div for displaying a pin
     */
    protected _createPinDiv(iconPath: string, sizeX: number = 18, sizeY: number = 25): HTMLElement {
        const pinEl = document.createElement('div');
        pinEl.style.width = `${sizeX}px`;
        pinEl.style.height = `${sizeY}px`;
        pinEl.style.backgroundImage = `url('${iconPath}')`;
        pinEl.style.backgroundSize = 'contain';
        pinEl.style.backgroundRepeat = 'no-repeat';
        pinEl.style.backgroundPosition = 'center';

        return pinEl;
    }

    /**
     * Create custom cluster renderer to set custom cluster icon
     */
    protected _createClusterRenderer(): Renderer {
        return {
            render: ({ count, position }) => {
                // Create a div to render a custom cluster icon
                const div = document.createElement('div');
                div.textContent = count.toString();

                Object.assign(div.style, {
                    background: `url('${this._options.clusterStyles.url}') no-repeat center`,
                    backgroundSize: 'contain',
                    width: `${this._options.clusterStyles.width}px`,
                    height: `${this._options.clusterStyles.height}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `${this._options.clusterStyles.textColor}`,
                    fontSize: `${this._options.clusterStyles.textSize}px`,
                    borderRadius: '50%',
                    fontWeight: 'bold',
                });

                return new google.maps.marker.AdvancedMarkerElement({
                    position,
                    content: div,
                });
            },
        };
    }

    /**
     * Populate the map with markers based on `this.stores` array.
     * Initialize InfoWindow which displays popup with store details when a user clicks on a marker.
     * Listen to click event on markers to execute `markerClickHandler` to show popup with details.
     * Initialize cluster library.
     */
    protected _createMarkers(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.map) {
                resolve();
                return;
            }

            if (this.cluster) {
                this.cluster.clearMarkers();
            }

            this._infoWindow = new google.maps.InfoWindow({});

            const allMarkers: any[] = [];
            let index = 0;

            const finalize = () => {
                this.markers = allMarkers;
                this.cluster = new MarkerClusterer({
                    map: this.map,
                    markers: this.markers,
                    renderer: this._createClusterRenderer(),
                    algorithm: new SuperClusterAlgorithm(this._options.clusterOptions || {}),
                });
                resolve();
            };

            const createMarker = (store: any) => {
                const pinEl = this._createPinDiv(
                    this._options.markerIcons.pin.url,
                    this._options.markerIcons.pin.sizes.x,
                    this._options.markerIcons.pin.sizes.y
                );
                const marker = new google.maps.marker.AdvancedMarkerElement({
                    position: {
                        lat: store.latitude,
                        lng: store.longitude,
                    },
                    content: pinEl,
                    gmpClickable: true,
                });
                marker.addEventListener('gmp-click', () => {
                    this.markerClickHandler(marker, store.sourceCode);
                });
                marker.storeId = store.sourceCode;
                allMarkers.push(marker);
            };

            const processChunk = (deadline?: IdleDeadline) => {
                while (index < this.stores.length) {
                    if (deadline && deadline.timeRemaining() <= 0) {
                        requestIdleCallback(processChunk);
                        return;
                    }
                    createMarker(this.stores[index]);
                    index++;
                }
                finalize();
            };

            const processChunkFallback = () => {
                const chunkEnd = Math.min(index + 200, this.stores.length);
                while (index < chunkEnd) {
                    createMarker(this.stores[index]);
                    index++;
                }
                if (index < this.stores.length) {
                    setTimeout(processChunkFallback, 0);
                } else {
                    finalize();
                }
            };

            if ('requestIdleCallback' in window) {
                requestIdleCallback(processChunk);
            } else {
                setTimeout(processChunkFallback, 0);
            }
        });
    }

    /**
     * Prepare markers icons.
     * More info: https://developers.google.com/maps/documentation/javascript/reference
     */
    protected _setMarkerIcons(): void {
        const path = this._$element.attr('data-image-path');

        this._options.markerIcons.pin.url = path + '/icon-pin.png';
        this._options.markerIcons.pinAlt.url = path + '/icon-pin-alt.png';
        this._options.markerIcons.pinActive.url = path + '/icon-pin-active.png';
        this._options.markerIcons.userLocation.url = path + '/icon-user-marker.png';
        this._options.clusterStyles.url = path + '/icon-cluster.png';
    }

    /**
     * This method bounds `mapChangeHandler` and `zoomChangeHandler`.
     * mapChangeHandler is important method responsible for displaying in the sidebar only store that are currently visible on the map.
     * zoomChangeHandler is connected with mobile behavior.
     */
    protected _attachMapListeners() {
        google.maps.event.addListener(this.map, 'idle', this.mapChangeHandler.bind(this));
        google.maps.event.addListener(this.map, 'zoom_changed', this.zoomChangeHandler.bind(this));
    }

    protected itemClickHandler(event: JQuery.ClickEvent): void {
        const $target = $(event.target as HTMLElement);

        if ($target.is(this._options.selectors.storelocatorSidebarClose)) {
            this.closeMobilePopup();
            return;
        }

        const $trigger = $target.closest(this._options.selectors.storelocatorItemHoursTrigger);

        if ($trigger.length) {
            $trigger.toggleClass('active');
            $trigger.next().toggle();
            return;
        }

        const $item = $target.closest(this._options.selectors.storelocatorItem);
        if ($item.length) {
            this.selectStore($item);
        }
    }

    protected searchFormSubmitHandler(e: JQuery.SubmitEvent): void {
        e.preventDefault();

        const selectedSuggestion = $('.cs-store-locator__search-item.selected').length
            ? $('.cs-store-locator__search-item.selected')
            : null;

        if (selectedSuggestion) {
            this._$searchInput.val(selectedSuggestion.text());
        }

        this.searchButtonClickHandler();
    }

    /**
     * This method attaches events not directly connected to the map.
     * There is for example sidebar toggle, direction or breakpoints changes related events
     */
    protected _attachEvents(): void {
        this._$sidebarToggler.on('click', this.toggleSidebar.bind(this));
        this._$locationButton.on('click', this.locationButtonClickHandler.bind(this));
        this._$searchButton.on('click', this.searchButtonClickHandler.bind(this));
        this._$searchForm.on('submit', this.searchFormSubmitHandler.bind(this));
        this._$element.on('click', this.itemClickHandler.bind(this));

        document.addEventListener('breakpointChange', () => {
            this.windowResizeHandler.bind(this);
        });
    }
}
