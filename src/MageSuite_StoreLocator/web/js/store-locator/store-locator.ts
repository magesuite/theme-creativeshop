import * as $ from 'jquery';
import 'mage/translate';

import mapStyles from './map-style'; // custom styles for google map
import MarkerClusterer from './markerclusterer'; // The library creates and manages per-zoom-level clusters for large amounts of markers.

/**
 * Store locator component options interface.
 */
interface StoreLocatorOptions {
    mapOptions?: any;
    basicZoom?: number;
    basicZoomSmallDesktop?: number;
    basicZoomMobile?: number;
    useDefaultMapStyles: boolean;
    markerIcons?: object;
    clusterStyles?: object;
    limitOfShopsInitiallyDisplayed?: number;
    storeData?: string;
}

interface Coordinates {
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

    protected _sidebarClosed: boolean;

    protected _numberOfStores: number;

    protected _options: StoreLocatorOptions = {
        mapOptions: {
            // To learn more about possible google map options visit: https://developers.google.com/maps/documentation/javascript/controls
            zoom: 7, // initial zoom set when maps is loaded. It is usually quite small to show at least greater part od area when stores are located
            center: { lat: 51, lng: 9 }, // coordinates for initial central point of the map. By default they are set to show the most of Germany area
            mapTypeControl: false, // see official google documentation
            streetViewControl: false, // see official google documentation
            fullscreenControl: false, // see official google documentation
        },
        basicZoom: 13, // basic zoom (also for small desktop/tablet and mobile - see 2 options below) is set when the map center on specific location (for example when the user is geolocalized or when we pan to a specific store or a location)
        basicZoomSmallDesktop: 12,
        basicZoomMobile: 12,
        useDefaultMapStyles: false, // when set to true default google maps styles are used. If not, styles from store-locator/ map-style.js file are used
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
    };

    protected stores: any[] = []; // array will all stores and their details that GraphQL request returns

    protected _allItemsRendered: boolean = false; // initially we do not render all stores in the left sidebar even if all markers are visible on the map because of performance problems. However if user a requests more shops by clicking on the more button all stores are rendered and later are nor rerendered again but only filtered

    protected _basePath: string;

    protected map: any;
    protected mapBounds: any;
    protected markers: any;
    protected cluster: any;

    protected _userPosition: object;
    protected _activeMarker: any;
    protected _locationMarker: any;
    protected _activeStoreId: string;

    protected _infoWindow: any; // there is only one info window (popup) withe details for all markers. Only content is changed when info window is requested
    protected _infoWindowOpened: boolean;

    protected loader: any;

    /**
     * Creates new Store Locator component with optional settings.
     * @param  {StoreLocatorOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: StoreLocatorOptions) {
        this._$element = $element || $('.cs-store-locator');
        this._options = $.extend(true, this._options, options);

        this._$sidebarToggler = this._$element.find(
            '.cs-store-locator__sidebar-toggler'
        );

        this._$locationButton = this._$element.find(
            '.cs-store-locator__location-button'
        );

        this._$searchButton = this._$element.find(
            '.cs-store-locator__search-button'
        );

        this._$searchForm = this._$element.find(
            '.cs-store-locator__search-form'
        );

        this._$searchInput = this._$element.find(
            '.cs-store-locator__search-input'
        );

        this._$itemsList = this._$element.find(
            '.cs-store-locator__stores-list-inner'
        );

        this._basePath = this._$element.attr('data-base-path');

        if (!this._options.useDefaultMapStyles) {
            this._options.mapOptions.styles = mapStyles;
        }

        this._$element.addClass('loading');

        // Mount map
        this.map = new google.maps.Map(
            document.getElementById('store-locator-map'),
            this._options.mapOptions
        );

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
        }).done(response => {
            if (response.data) {
                this.stores = response.data.storePickupLocations.items;
            }

            this._$element.removeClass('loading');
            this._initMap();
        });

        this._attachEvents();
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
        const query: string = $('.cs-store-locator__search-input').val();

        this._$searchForm.addClass('loading');

        this.getCoordinatesFromQuery(query).then(response => {
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

                const windowWidth = $(window).width();

                if (windowWidth < breakpoint.laptop) {
                    this.map.setZoom(11);
                } else if (
                    windowWidth >= breakpoint.laptop &&
                    windowWidth < breakpoint.laptopLg
                ) {
                    this.map.setZoom(this._options.basicZoomSmallDesktop);
                } else {
                    this.map.setZoom(this._options.basicZoom);
                }

                if (coordinates === this._userPosition) {
                    return;
                }

                this.setUserPositionAndPopulateDistance(
                    this.stores,
                    coordinates
                );

                if ($(window).width() < breakpoint.laptop) {
                    this.renderMobileStoresList();
                } else {
                    this.renderItems(this.getFilteredStores(), false);
                }

                if (this._locationMarker) {
                    this._locationMarker.setMap(null);
                }
                this._locationMarker = new google.maps.Marker({
                    position: coordinates,
                    map: this.map,
                    icon: this._options.markerIcons.userLocation,
                });
            } else {
                $('.cs-store-locator__empty-message--nolocation').remove();
                this._$itemsList.prepend(
                    `<div class="cs-store-locator__empty-message cs-store-locator__empty-message--nolocation">
                ${$.mage.__(
                    'Unfortunately we were not able to find this location.'
                )}</div>`
                );

                if ($(window).width() < breakpoint.laptop) {
                    this.openMobileStores();
                }

                $('.cs-store-locator__empty-message--nolocation').show();

                setTimeout(() => {
                    $('.cs-store-locator__empty-message--nolocation')
                        .slideUp()
                        .remove();
                    if ($(window).width() < breakpoint.laptop) {
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
    public setUserPositionAndPopulateDistance(stores, userPosition): void {
        this.stores = this.populateStoresDistance(stores, userPosition);

        this.stores = this.stores.sort((a, b) => {
            return a.distance - b.distance;
        });

        this.stores = Object.freeze(this.stores);
        this._userPosition = userPosition;
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
    public renderItems(stores, renderAllStores): void {
        if (
            this._allItemsRendered &&
            !($(window).width() < breakpoint.laptop)
        ) {
            return;
        }

        this._$itemsList.empty();

        stores.map((store, index) => {
            if (renderAllStores) {
                this._$itemsList.append(this.getInfoWindowContent(store));
            } else if (index <= this._options.limitOfShopsInitiallyDisplayed) {
                this._$itemsList.append(this.getInfoWindowContent(store));
            }
        });

        if (stores.length <= this._options.limitOfShopsInitiallyDisplayed) {
            this._$itemsList
                .find('.cs-store-locator__stores-more-wrapper')
                .remove();
        } else {
            this._$itemsList.append(
                `<div class="cs-store-locator__stores-more-wrapper"><span class="cs-store-locator__stores-more-text">${$.mage.__(
                    'Show more stores'
                )}</span></div>`
            );
        }

        this._$itemsList
            .find('.cs-store-locator__stores-more-wrapper')
            .on('click', e => {
                this._$element.addClass('loading');

                // Make sure that loading class is added before all stores start to render
                setTimeout(() => {
                    this.renderItems(this.stores, true);
                }, 100);
                // When a lot of elements ia added to the DOM browser hangs for a moment. This loader force user to wait a bit.
                setTimeout(() => {
                    this._$element.removeClass('loading');
                    this._$itemsList
                        .find('.cs-store-locator__stores-more-wrapper')
                        .remove();
                    this._allItemsRendered = true;
                    this.mapChangeHandler();
                }, 3000);
            });

        this._$element.find('.cs-store-locator__item').on('click', e => {
            if (
                !$(e.target).hasClass('cs-store-locator__item-hours-trigger') &&
                !$(e.target).hasClass(
                    'cs-store-locator__item-hours-trigger-icon'
                )
            ) {
                this.itemClickHandler($(e.currentTarget).attr('data-id'));
            }
        });

        this._$itemsList.append(
            `<div class="cs-store-locator__empty-message">
        ${$.mage.__(
            'Unfortunately we do not have any stores in your area. Please zoom the map to see bigger area.'
        )}</div>`
        );
    }

    /**
     * Return only stores visible on map.
     * Stores are sorted by distance - which is a distance to the user location or location that was searched in the sidebar input,
     */
    public getFilteredStores(): any[] {
        const bounds = this.map.getBounds();

        const isVisibleOnMap = store => {
            return bounds.contains({
                lat: parseFloat(store.latitude),
                lng: parseFloat(store.longitude),
            });
        };

        let filteredStores = this.stores.filter(isVisibleOnMap);

        filteredStores = filteredStores.sort((a, b) => {
            return a.distance - b.distance;
        });

        return filteredStores;
    }

    /**
     * Localize and pan map to coordinates
     * If user was not localized before set distances for stores, and render items in the sidebar
     */
    public locationButtonClickHandler() {
        this.getGeolocation().then(coordinates => {
            if (!coordinates) {
                return;
            }

            this.map.panTo(coordinates);

            const windowWidth = $(window).width();

            if (windowWidth < breakpoint.laptop) {
                this.map.setZoom(this._options.basicZoomMobile);
            } else if (
                windowWidth >= breakpoint.laptop &&
                windowWidth < breakpoint.laptopLg
            ) {
                this.map.setZoom(this._options.basicZoomSmallDesktop);
            } else {
                this.map.setZoom(this._options.basicZoom);
            }

            if (coordinates !== this._userPosition) {
                this._$itemsList.empty();
                this._allItemsRendered = false;

                this.setUserPositionAndPopulateDistance(
                    this.stores,
                    coordinates
                );

                if (windowWidth < breakpoint.laptop) {
                    this.renderMobileStoresList();
                } else {
                    this.renderItems(this.getFilteredStores(), false);
                }

                if (this._locationMarker) {
                    this._locationMarker.setMap(null);
                }
                this._locationMarker = new google.maps.Marker({
                    position: coordinates,
                    map: this.map,
                    icon: this._options.markerIcons.userLocation,
                });
            }
        });
    }

    /**
     * Render stores on mobile
     */
    public renderMobileStoresList() {
        this.closeMobileStores();

        const filteredStores = this.getFilteredStores().slice(0, 9);
        this.renderItems(this.getFilteredStores().slice(0, 9), false);

        setTimeout(() => {
            this.openMobileStores();

            this._$itemsList.append(
                '<div class="cs-store-locator__store-list-close"></div>'
            );
            this._$itemsList
                .find('.cs-store-locator__store-list-close')
                .on('click', event => {
                    this.closeMobileStores();
                });
            const $emptyMessage = this._$element.find(
                '.cs-store-locator__empty-message'
            );

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
    public markerClickHandler(marker, storeId) {
        this.updateActiveMarkerIcon(marker);

        this._activeStoreId = storeId;

        if ($(window).width() < breakpoint.laptop) {
            this.closeMobilePopup();
            this.openMobilePopup(this._activeStoreId);
        }

        this.panToStore(storeId);
    }

    /**
     * Pan to clicked store on the map, show info window
     */
    public itemClickHandler(id) {
        if (this.markers) {
            const marker = this.markers.find(
                marker => marker.get('storeId') === id
            );

            if (marker) {
                this.updateActiveMarkerIcon(marker);
            }
        }

        this.panToStore(id);
        this._activeStoreId = id;

        if ($(window).width() < breakpoint.laptop) {
            this.closeMobileStores();
            this.openMobilePopup(id);
        }
    }

    /**
     * Set active marker
     */
    public updateActiveMarkerIcon(marker) {
        if (this._activeMarker) {
            this._activeMarker.setIcon(this._options.markerIcons.pin);
        }

        this._activeMarker = marker;
        this._activeMarker.setIcon(this._options.markerIcons.pinActive);
    }

    /**
     * Pan to clicked store on the map, show info window
     */
    public panToStore(id) {
        this._infoWindow.close(this.map, this._activeMarker);

        const store = this.stores.find(store => store.sourceCode === id);
        const coordinates: Coordinates = {
            lat: store.latitude,
            lng: store.longitude,
        };
        const sidebarWidth = $('.cs-store-locator__sidebar').width();

        this.map.panTo(coordinates);

        if (this.map.getZoom() < this._options.basicZoom) {
            this.map.setZoom(this._options.basicZoom);
        }

        if ($(window).width() >= breakpoint.laptop && !this._sidebarClosed) {
            this.map.panBy(-sidebarWidth / 2, 0);
        }

        this._infoWindowOpened = true;
        this._infoWindow.setContent(this.getInfoWindowContent(store));
        this._infoWindow.open(this.map, this._activeMarker);
    }

    /**
     * Return custom html template for sidebar store info box.
     * TODO For now there is no route link in response
     */
    public getInfoWindowContent(store): string {
        const storePostCode = store.postCode ? `${store.postCode} ` : '';
        const storeCity = store.city ? store.city : '';
        const storeStreet = store.street ? store.street : '';

        const addressLine1 =
            storePostCode || storeCity || store.street
                ? `<p class="cs-store-locator__item-address">
        ${storePostCode} ${storeCity}, ${storeStreet}</p>`
                : ``;

        const phoneLine = store.phone
            ? `<p class="cs-store-locator__item-phone">${$.mage.__(
                  'Tel'
              )}: <a href="tel:${store.phone}">${store.phone}</a></p>`
            : ``;

        const faxLine = store.fax
            ? `<p class="cs-store-locator__item-fax">${$.mage.__(
                  'Fax'
              )}: <a href="fax:${store.fax}">${store.fax}</a></p>`
            : ``;

        const emailLine = store.email
            ? `<p class="cs-store-locator__item-email">${$.mage.__(
                  'E-Mail'
              )}: <a href="mailto:${store.email}">${store.email}</a></p>`
            : ``;

        const websiteLine = store.url
            ? `<p class="cs-store-locator__item-website">${$.mage.__(
                  'Website'
              )}: <a href="//${store.url}" target="_blank" rel="nofollow">${
                  store.url
              }</a></p>`
            : ``;

        const storeDistance = store.distance
            ? `<span class="cs-store-locator__item-distance">
        ${$.mage.__('Distance')}: ${store.distance} km</span>`
            : ``;

        const descriptionLine = store.description
            ? `<p class="cs-store-locator__item-description">${store.description}</p>`
            : ``;

        // Not in the response for now
        const routeLink: string = store.routeLink;

        // Opening hours are not ready yest in response from backend
        const openingHours = store.openingHours ? store.openingHours : '';

        return `<div class="cs-store-locator__item"
            data-id="${store.sourceCode}" data-lat="${
            store.latitude
        }" data-lng="${store.longitude}">
            <div class="cs-store-locator__store-details-close"></div>
            <div class="cs-store-locator__item-content">
                <div class="cs-store-locator__item-header">
                    <h2 class="cs-store-locator__item-name">${store.name}</h2>
                    <a href="${routeLink}" target="_blank" rel="noopener noreferrer" class="cs-store-locator__item-route">
                        <span>${$.mage.__('Route')}</span>
                    </a>
                </div>
                ${addressLine1}
                ${phoneLine}
                ${faxLine}
                ${emailLine}
                ${websiteLine}
                ${descriptionLine}
            </div>
            ${openingHours}
            <div class="cs-store-locator__item-footer">
                ${storeDistance}
            </div>
        </div>`;
    }

    /**
     * Get user location from based on window navigator
     */
    public getGeolocation(): Promise<object> {
        return new Promise((resolve, reject) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    error => {
                        reject(new Error('Geolocation not enabled'));
                    }
                );
            } else {
                reject(new Error('Geolocation not supported'));
            }
        });
    }

    /**
     * Toggle sidebar
     */
    public toggleSidebar(): void {
        if (!this._sidebarClosed) {
            $('.cs-store-locator__sidebar').addClass(
                'cs-store-locator__sidebar--closed'
            );
            $('.cs-store-locator__sidebar-toggler-icon').addClass(
                'cs-store-locator__sidebar-toggler-icon--closed'
            );
        } else {
            $('.cs-store-locator__sidebar').removeClass(
                'cs-store-locator__sidebar--closed'
            );
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
        let visibleStores: number = 0;
        this._$element.find('.cs-store-locator__item').each(function() {
            if (
                bounds.contains({
                    lat: parseFloat($(this).attr('data-lat')),
                    lng: parseFloat($(this).attr('data-lng')),
                })
            ) {
                $(this).show();
                visibleStores++;
            } else {
                $(this).hide();
            }
        });

        if (visibleStores > 0) {
            this._$element.find('.cs-store-locator__empty-message').hide();
        } else {
            this._$element.find('.cs-store-locator__empty-message').show();
        }
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
    public populateStoresDistance(stores, coordinates: Coordinates): object {
        return stores.map(store => {
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
    public openMobilePopup(id) {
        const store = this.stores.find(store => store.sourceCode === id);

        $('.cs-store-locator__store-details').append(
            this.getInfoWindowContent(store)
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
        if ($(window).width() >= breakpoint.laptop) {
            this.closeMobilePopup();
        }
    }

    /**
     * This is an important method responsible for displaying in the sidebar only store that are currently visible on the map.
     */
    public mapChangeHandler() {
        if ($(window).width() < breakpoint.laptop) {
            return;
        }

        if (this._allItemsRendered) {
            this.filterItems();
        } else {
            this.renderItems(this.getFilteredStores(), false);
            this.filterItems();
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
    public calculateDistance(lat1, lng1, lat2, lng2): number {
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

    public isIE() {
        const ua = window.navigator.userAgent; // Check the userAgent property of the window.navigator object
        const msie = ua.indexOf('MSIE '); // IE 10 or older
        const trident = ua.indexOf('Trident/'); // IE 11

        return msie > 0 || trident > 0;
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
    protected _initMap(): void {
        this._setMarkerIcons();
        this._createMarkers();

        this.getGeolocation()
            .then(coordinates => {
                // User location from geolocation service
                this.setUserPositionAndPopulateDistance(
                    this.stores,
                    coordinates
                );

                if (this._locationMarker) {
                    this._locationMarker.setMap(null);
                }
                this._locationMarker = new google.maps.Marker({
                    position: coordinates,
                    map: this.map,
                    icon: this._options.markerIcons.userLocation,
                });

                this.map.panTo(coordinates);
                this.map.setZoom(this._options.basicZoom);

                this.renderItems(this.getFilteredStores(), false);
                this._attachMapListeners();
                this.mapChangeHandler();
            })
            .catch(error => {
                // We don't know users position
                this.setUserPositionAndPopulateDistance(this.stores, null);

                this.renderItems(this.stores, false);
                this._attachMapListeners();
            });
    }

    /**
     * Populate the map with markers based on `this.stores` array.
     * Initialize InfoWindow which displays popup with store details when a user clicks on a marker.
     * Listen to click event on markers to execute `markerClickHandler` to show popup with details.
     * Initialize cluster library.
     */
    protected _createMarkers(): void {
        if (!this.map) {
            return;
        }

        if (this.cluster) {
            this.cluster.clearMarkers();
        }

        this._infoWindow = new google.maps.InfoWindow({});

        this.markers = this.stores.map(store => {
            const marker = new google.maps.Marker({
                position: {
                    lat: store.latitude,
                    lng: store.longitude,
                },
                map: this.map,
                icon: this._options.markerIcons.pin,
                optimized: this.isIE() ? false : true, // see https://stackoverflow.com/questions/20414387/google-maps-svg-marker-doesnt-display-on-ie-11
            });

            marker.addListener('click', () => {
                this.markerClickHandler(marker, store.sourceCode);
            });
            marker.set('storeId', store.sourceCode);

            return marker;
        });

        this.cluster = new MarkerClusterer(this.map, this.markers, {
            styles: [this._options.clusterStyles],
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
        this._options.markerIcons.userLocation.url =
            path + '/icon-user-marker.png';
        this._options.clusterStyles.url = path + '/icon-cluster.png';

        this._options.markerIcons.pin.scaledSize = new google.maps.Size(
            this._options.markerIcons.pin.sizes.x,
            this._options.markerIcons.pin.sizes.y
        );
        this._options.markerIcons.pinAlt.scaledSize = new google.maps.Size(
            this._options.markerIcons.pinAlt.sizes.x,
            this._options.markerIcons.pinAlt.sizes.y
        );
        this._options.markerIcons.pinActive.scaledSize = new google.maps.Size(
            this._options.markerIcons.pinActive.sizes.x,
            this._options.markerIcons.pinActive.sizes.y
        );
        this._options.markerIcons.userLocation.scaledSize = new google.maps.Size(
            this._options.markerIcons.userLocation.sizes.x,
            this._options.markerIcons.userLocation.sizes.y
        );
    }

    /**
     * This method bounds `mapChangeHandler` and `zoomChangeHandler`.
     * mapChangeHandler is important method responsible for displaying in the sidebar only store that are currently visible on the map.
     * zoomChangeHandler is connected with mobile behavior.
     */
    protected _attachMapListeners() {
        google.maps.event.addListener(
            this.map,
            'bounds_changed',
            this.mapChangeHandler.bind(this)
        );

        google.maps.event.addListener(
            this.map,
            'zoom_changed',
            this.zoomChangeHandler.bind(this)
        );
    }

    /**
     * This method attaches events not directly connected to the map.
     * There is for example sidebar toggle, direction or breakpoints changes related events
     */
    protected _attachEvents(): void {
        this._$sidebarToggler.on('click', this.toggleSidebar.bind(this));
        this._$locationButton.on(
            'click',
            this.locationButtonClickHandler.bind(this)
        );
        this._$searchButton.on(
            'click',
            this.searchButtonClickHandler.bind(this)
        );
        this._$searchForm.on('submit', e => {
            e.preventDefault();

            const selectedSuggestion = $(
                '.cs-store-locator__search-item.selected'
            ).length
                ? $('.cs-store-locator__search-item.selected')
                : null;

            if (selectedSuggestion) {
                this._$searchInput.val(selectedSuggestion.text());
            }

            this.searchButtonClickHandler();
        });

        this._$element.on('click', event => {
            const $eventTarget = $(event.target);
            const isTrigger = $eventTarget.hasClass(
                'cs-store-locator__item-hours-trigger'
            );
            const isTriggerIcon = $eventTarget.hasClass(
                'cs-store-locator__item-hours-trigger-icon'
            );
            if (isTrigger || isTriggerIcon) {
                const $trigger = isTrigger
                    ? $eventTarget
                    : $eventTarget.parent(
                          '.cs-store-locator__item-hours-trigger'
                      );
                $trigger.toggleClass(
                    'cs-store-locator__item-hours-trigger--open'
                );
                $trigger.next().toggle();
            }

            if (
                $(event.target).hasClass(
                    'cs-store-locator__store-details-close'
                )
            ) {
                this.closeMobilePopup();
            }
        });

        window.addEventListener('resize', this.windowResizeHandler.bind(this));
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.windowResizeHandler();
            }, 200);
        });
    }
}
