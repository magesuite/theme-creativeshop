import * as $ from 'jquery';
import 'mage/translate';

import mapStyles from './map-style';
import MarkerClusterer from './markerclusterer';
import breakpoint from 'utils/breakpoint/breakpoint';

/**
 * Store locator component options interface.
 */
interface StoreLocatorOptions {
    mapOptions?: any;
    basicZoom?: number;
    useDefaultMapStyles: boolean;
    markerIcons?: object;
    clusterStyles?: object;
    showCurrentDayInOpeningHours?: boolean;
    limitOfShopsInitiallyDisplayed?: number;
}

interface Coordinates {
    lat: number;
    lng: number;
}

export default class StoreLocator {
    protected _$element: JQuery;
    protected _$sidebarToggler: JQuery;
    protected _$locationButton: JQuery;
    protected _$searchButton: JQuery;
    protected _$searchForm: JQuery;
    protected _$itemsList: JQuery;
    protected _$searchInput: JQuery;

    protected _numberOfStores: number;

    protected _options: StoreLocatorOptions = {
        mapOptions: {
            zoom: 7,
            center: { lat: 51, lng: 9 },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        },
        basicZoom: 14,
        useDefaultMapStyles: false,
        markerIcons: {
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
            url: '',
            height: 22,
            width: 22,
            textSize: 12,
            textColor: '#fff',
            backgroundPosition: 'center',
        },
        showCurrentDayInOpeningHours: false,
        limitOfShopsInitiallyDisplayed: 50,
    };

    protected _sidebarClosed: boolean = false;
    protected _mobilePopupOpen: boolean = false;
    protected _sidebarMobileOpen: boolean = false;
    protected _mapMobileHidden: boolean = false;

    protected stores: any[] = [];

    protected _allItemsRendered: boolean = false;

    protected _basePath: string;

    protected map: any;
    protected mapBounds: any;
    protected markers: any;
    protected cluster: any;

    protected _userPosition: object;
    protected _activeMarker: any;
    protected _locationMarker: any;
    protected _activeStoreId: string;

    protected _infoWindow: any;
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

        // Mount map and then send request for stores
        this.map = new google.maps.Map(
            document.getElementById('store-locator-map'),
            this._options.mapOptions
        );

        $.post({
            url: this._basePath + 'graphql',
            data: JSON.stringify({
                query: `{
                    storePickupLocations {
                      items {
                        name
                        latitude
                        longitude
                        city
                        street
                        postCode
                        description
                        sourceCode
                        countryId
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
     * Get coordinations based on search query
     * Pan to coordinates
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
                this.map.setZoom(this._options.basicZoom);

                if (coordinates !== this._userPosition) {
                    this.setUserPositionAndPopulateDistance(
                        this.stores,
                        coordinates
                    );
                    this.renderItems(this.getFilteredStores(), false);

                    if (this._locationMarker) {
                        this._locationMarker.setMap(null);
                    }
                    this._locationMarker = new google.maps.Marker({
                        position: coordinates,
                        map: this.map,
                        icon: this._options.markerIcons.userLocation,
                    });
                }
            } else {
                $('.cs-store-locator__empty-message--nolocation').remove();
                this._$itemsList.prepend(
                    `<div class="cs-store-locator__empty-message cs-store-locator__empty-message--nolocation">
                ${$.mage.__(
                    'Unfortunately we were not able to find this location.'
                )}</div>`
                );

                $('.cs-store-locator__empty-message--nolocation').show();

                setTimeout(() => {
                    $('.cs-store-locator__empty-message--nolocation')
                        .slideUp()
                        .remove();
                }, 5000);
            }
            this._$searchForm.removeClass('loading');
        });
    }

    public setUserPositionAndPopulateDistance(stores, userPosition): void {
        this.stores = this.populateStoresDistance(stores, userPosition);

        this.stores = this.stores.sort((a, b) => {
            return a.distance - b.distance;
        });

        this.stores = Object.freeze(this.stores);
        this._userPosition = userPosition;
    }

    /**
     * Render stores list on sidebar
     */
    public renderItems(stores, renderAllStores): void {
        if ($(window).width() < breakpoint.laptop || this._allItemsRendered) {
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
                // When a lot os elements ia added to the DOM browser hangs for a moment. This loader force user to wait a bit.
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
            if (!$(e.target).hasClass('cs-store-locator__item-hours-trigger')) {
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
     * Get only stores visible on map
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
            this.map.setZoom(this._options.basicZoom);

            if (coordinates !== this._userPosition) {
                this._$itemsList.empty();
                this._allItemsRendered = false;

                this.setUserPositionAndPopulateDistance(
                    this.stores,
                    coordinates
                );

                this.renderItems(this.getFilteredStores(), false);

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
            $('.cs-store-locator__stores-list').removeClass(
                'cs-store-locator__stores-list--mobile-open'
            );
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
        const storeCenter =
            $(window).width() >= breakpoint.laptop && !this._sidebarClosed
                ? this.calculateCoordinatesOffset(
                      coordinates,
                      14,
                      { x: 190, y: 0 },
                      google,
                      this.map
                  )
                : coordinates;

        this.map.panTo(storeCenter);

        if (this.map.getZoom() < this._options.basicZoom) {
            this.map.setZoom(this._options.basicZoom);
        }

        this._infoWindowOpened = true;
        this._infoWindow.setContent(this.getInfoWindowContent(store));
        this._infoWindow.open(this.map, this._activeMarker);
    }

    public prepareOpeningHours(openData): string {
        const today: number = new Date().getDay();

        let openingHours = '';
        let todayOpen = '';

        const weekDays = {
            mon: $.mage.__('Monday'),
            tue: $.mage.__('Tuesday'),
            wed: $.mage.__('Wednesday'),
            thu: $.mage.__('Thursday'),
            fri: $.mage.__('Friday'),
            sat: $.mage.__('Saturday'),
            sun: $.mage.__('Sunday'),
        };

        const weekDaysArray = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

        weekDaysArray.forEach(day => {
            if (
                openData[`${day}_from`] &&
                openData[`${day}_to`] &&
                (!openData[`${day}_lunch_from`] || !openData[`${day}_lunch_to`])
            ) {
                openingHours =
                    openingHours +
                    `<li><span>${$.mage.__(weekDays[day])}</span><span>${
                        openData[`${day}_from`]
                    } - ${openData[`${day}_to`]}</span></li> `;
            } else if (
                openData[`${day}_from`] &&
                openData[`${day}_to`] &&
                openData[`${day}_lunch_from`] &&
                openData[`${day}_lunch_to`]
            ) {
                openingHours =
                    openingHours +
                    `<li><span>${$.mage.__(weekDays[day])}</span><span>${
                        openData[`${day}_from`]
                    } - ${openData[`${day}_lunch_from`]}<br>${
                        openData[`${day}_lunch_to`]
                    } - ${openData[`${day}_to`]}</span></li> `;
            }
        });

        if (
            openData[`${weekDaysArray[today - 1]}_from`] &&
            openData[`${weekDaysArray[today - 1]}_to`] &&
            (!openData[`${weekDaysArray[today - 1]}_lunch_from`] &&
                !openData[`${weekDaysArray[today - 1]}_lunch_to`])
        ) {
            todayOpen =
                todayOpen +
                `<div class="cs-store-locator__item-hours-today">${$.mage.__(
                    'Today'
                )} ${
                    this._options.showCurrentDayInOpeningHours
                        ? '(' + weekDays[weekDaysArray[today - 1]] + ')'
                        : ''
                } ${$.mage.__('open')} 
                <span>${openData[`${weekDaysArray[today - 1]}_from`]} - ${
                    openData[`${weekDaysArray[today - 1]}_to`]
                }</span>
                </div>`;
        } else if (
            openData[`${weekDaysArray[today - 1]}_from`] &&
            openData[`${weekDaysArray[today - 1]}_to`] &&
            openData[`${weekDaysArray[today - 1]}_lunch_from`] &&
            openData[`${weekDaysArray[today - 1]}_lunch_to`]
        ) {
            todayOpen =
                todayOpen +
                `<div class="cs-store-locator__item-hours-today">${$.mage.__(
                    'Today'
                )} ${
                    this._options.showCurrentDayInOpeningHours
                        ? '(' + weekDays[weekDaysArray[today - 1]] + ')'
                        : ''
                } ${$.mage.__('open')} 
                <span>${openData[`${weekDaysArray[today - 1]}_from`]} - ${
                    openData[`${weekDaysArray[today - 1]}_lunch_from`]
                }<span class="cs-store-locator__item-hours-today-space"></span> ${
                    openData[`${weekDaysArray[today - 1]}_lunch_to`]
                } - ${openData[`${weekDaysArray[today - 1]}_to`]}
                </span>
                </div>`;
        }

        if (!todayOpen) {
            todayOpen =
                todayOpen +
                `<div class="cs-store-locator__item-hours-today">${$.mage.__(
                    'Today'
                )} ${
                    this._options.showCurrentDayInOpeningHours
                        ? '(' + weekDays[weekDaysArray[today - 1]] + ')'
                        : ''
                } ${$.mage.__('closed')}
            </div>`;
        }

        if (openingHours) {
            openingHours = `<div class="cs-store-locator__item-hours-wrapper">
            ${todayOpen}
            <div class="cs-store-locator__item-hours-trigger">${$.mage.__(
                'Show all opening hours'
            )}</div>
                <ul class="cs-store-locator__item-hours" style="display: none;">${openingHours}</ul>
            </div>`;
        }

        return openingHours;
    }

    /**
     * Get store info window html
     * TODO For now there is not contact data, opening hours, descriptio and route link in response
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

        // store.description contains json for opening hours for now. When there is proper description replace null with store.description
        const descriptionLine = null
            ? `<p class="cs-store-locator__item-description">
        ${store.description}</p>`
            : ``;

        // Contact data is not in the response for now
        const phoneLine = store.phone
            ? `<a href="tel:${
                  store.phone
              }" class="cs-store-locator__item-phone">
        ${store.phone}</a>`
            : ``;

        let contactLine = store.email
            ? `<a href="mailto:${
                  store.email
              }" class="cs-store-locator__item-email">
        ${store.email}</a>`
            : ``;

        // Temporary solution for NKD
        store.phone = 'Our stores are unfortunately not available by phone.';
        contactLine = store.phone
            ? `<p class="cs-store-locator__no-contact">
            ${$.mage.__(store.phone)}
            </p>`
            : ``;

        const storeDistance = store.distance
            ? `<span class="cs-store-locator__item-distance">
        ${$.mage.__('Distance')} ${store.distance} km</span>`
            : ``;

        // Not in the response for now
        const routeLink: string = store.routeLink;

        // Opening hours are kept as json in store.description for now
        const openData = JSON.parse(store.description);
        const openingHours = this.prepareOpeningHours(openData);

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
                ${descriptionLine}
                ${phoneLine}
            </div> 
            ${openingHours}
            <div class="cs-store-locator__item-footer">
                ${contactLine} 
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
     * Calculate coordinates offset
     */
    public calculateCoordinatesOffset(coordinates, scale, offset, google, map) {
        const mapScale = Math.pow(2, scale);
        const pixelOffset = new google.maps.Point(
            offset.x / mapScale || offset.y,
            0
        );
        const coordinatesLatLng = new google.maps.LatLng(coordinates);
        const coordinatesProjection = map
            .getProjection()
            .fromLatLngToPoint(coordinatesLatLng);
        const coordinatesWithOffset = new google.maps.Point(
            coordinatesProjection.x - pixelOffset.x,
            coordinatesProjection.y + pixelOffset.y
        );

        return map.getProjection().fromPointToLatLng(coordinatesWithOffset);
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
     * Filter items in sidebar - show only store viisble on map.
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
     * @param {Array} stores Array of *StoreModel*
     * @param {Coordinates} coordinates Coordinates object { lat, lng }
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

    public closeMobilePopup() {
        $('.cs-store-locator__store-details').html('');

        this._mobilePopupOpen = false;
        $('.cs-store-locator__store-details').removeClass(
            'cs-store-locator__store-details--mobile'
        );

        this._sidebarMobileOpen = false;
        $('.cs-store-locator__sidebar').removeClass(
            'cs-store-locator__sidebar--mobile-open'
        );

        this._mapMobileHidden = false;
        $('.cs-store-locator__map-container').removeClass(
            'cs-store-locator__map-container--mobile-hidden'
        );
    }

    public openMobileStores() {
        this._mobilePopupOpen = false;
        $('.cs-store-locator__store-details').removeClass(
            'cs-store-locator__store-details--mobile'
        );

        this._sidebarMobileOpen = true;
        $('.cs-store-locator__sidebar').addClass(
            'cs-store-locator__sidebar--mobile-open'
        );

        this._mapMobileHidden = true;
        $('.cs-store-locator__map-container').addClass(
            'cs-store-locator__map-container--mobile-hidden'
        );
    }

    public openMobilePopup(id) {
        const store = this.stores.find(store => store.sourceCode === id);

        $('.cs-store-locator__store-details').append(
            this.getInfoWindowContent(store)
        );
        this._mobilePopupOpen = true;
        $('.cs-store-locator__store-details').addClass(
            'cs-store-locator__store-details--mobile'
        );

        this._sidebarMobileOpen = false;
        $('.cs-store-locator__sidebar').removeClass(
            'cs-store-locator__sidebar--mobile-open'
        );

        this._mapMobileHidden = false;
        $('.cs-store-locator__map-container').removeClass(
            'cs-store-locator__map-container--mobile-hidden'
        );
    }

    public windowResizeHandler(): void {
        if ($(window).width() >= breakpoint.laptop && this._mobilePopupOpen) {
            this.closeMobilePopup();
        }
    }

    public mapChangeHandler() {
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
     * Calculate distance between two poitns on earth in km
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
     * Init Map
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
     * Populate map with markers based on stores
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
                optimized: this.isIE() ? false : true,
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
     * Attaches events needed by component.
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
            if (
                $(event.target).hasClass('cs-store-locator__item-hours-trigger')
            ) {
                $(event.target)
                    .next()
                    .toggle();
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
            this.orientationChanged().then(() => {
                setTimeout(() => {
                    this.windowResizeHandler();
                }, 20);
            });
        });
    }
}
