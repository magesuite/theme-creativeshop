import * as $ from 'jquery';

/**
 * Component options interface.
 */
export interface OffcanvasOptions {
    className?: string; // Component class name.
    triggerClassName?: string; // Offcanvas trigger class name.
    closeOnBlur?: boolean; // Should offcanvas be closed on overlay click.
    drawerTransitionDuration?: number; // How long does the drawer CSS transition take in ms.
    overlayTransitionDuration?: number; // How long does the overlay CSS transition take in ms.
}

/**
 * Offcanvas component for mobile off-screen content.
 */
export default class Offcanvas {
    protected _$element: JQuery;
    protected _$overlay: JQuery;
    protected _$drawer: JQuery;
    protected _$trigger: JQuery;
    protected _options: OffcanvasOptions;
    protected _eventListeners: {
        triggerClick?: (event: Event) => void;
        overlayClick?: (event: Event) => void;
    } = {};

    /**
     * Creates new offcanvas component with optional settings.
     * @param {JQuery} $element Optional, element to be initialized on.
     * @param {OffcanvasOptions} options  Optional settings object.
     */
    public constructor($element?: JQuery, options?: OffcanvasOptions) {
        this._options = $.extend(
            {
                className: 'cs-offcanvas',
                triggerClassName: 'cs-offcanvas-trigger',
                closeOnBlur: true,
                drawerTransitionDuration: 300,
                overlayTransitionDuration: 300,
            },
            options
        );

        this._$element = $element || $(`.${this._options.className}`);
        if (this._$element.length === 0) {
            return;
        }

        this._$drawer = this._$element.find(
            `.${this._options.className}__drawer`
        );
        this._$overlay = this._$element.find(
            `.${this._options.className}__overlay`
        );
        this._$trigger = $(`.${this._options.triggerClassName}`);

        this._addEventListeners();
    }
    /**
     * Toggles offcanvas visibility depending on its current state.
     * @return {Promise<Offcanvas>} Promise that resolves after offcanvas ends toggling.
     */
    public toggle(e: Event): Promise<Offcanvas> {
        e.preventDefault();

        if (
            this._$trigger.hasClass(`${this._options.triggerClassName}--active`)
        ) {
            return this.hide();
        }

        return this.show();
    }
    /**
     * Shows offcanvas.
     * @return {Promise<Offcanvas>} Promise that resolves after offcanvas is shown.
     */
    public show(): Promise<Offcanvas> {
        $('body, html').addClass('no-scroll');
        this._$trigger.addClass(`${this._options.triggerClassName}--active`);
        return Promise.all([this._showOverlay(), this._showDrawer()]).then(
            () => {
                this._$element.trigger('offcanvas-show', this);
                return this;
            }
        );
    }
    /**
     * Hides offcanvas.
     * @return {Promise<Offcanvas>} Promise that resolves after offcanvas is hidden.
     */
    public hide(): Promise<Offcanvas> {
        $('body, html').removeClass('no-scroll');
        this._$trigger.removeClass(`${this._options.triggerClassName}--active`);
        return Promise.all([this._hideOverlay(), this._hideDrawer()]).then(
            () => {
                this._$element.trigger('offcanvas-hide', this);
                return this;
            }
        );
    }
    /**
     * Shows overlay.
     * @return {Promise<Offcanvas>} Promise that resolves after overlay is shown.
     */
    protected _showOverlay(): Promise<Offcanvas> {
        return new Promise(resolve => {
            this._$overlay.addClass(
                `${this._options.className}__overlay--visible`
            );
            setTimeout(
                () => resolve(this),
                this._options.overlayTransitionDuration
            );
        });
    }
    /**
     * Hides overlay.
     * @return {Promise<Offcanvas>} Promise that resolves after offcanvas is hidden.
     */
    protected _hideOverlay(): Promise<Offcanvas> {
        return new Promise(resolve => {
            this._$overlay.removeClass(
                `${this._options.className}__overlay--visible`
            );
            setTimeout(
                () => resolve(this),
                this._options.overlayTransitionDuration
            );
        });
    }
    /**
     * Shows offcanvas drawer.
     * @return {Promise<Offcanvas>} Promise that resolves after offcanvas drawer is shown.
     */
    protected _showDrawer(): Promise<Offcanvas> {
        return new Promise(resolve => {
            this._$drawer.addClass(
                `${this._options.className}__drawer--visible`
            );
            setTimeout(
                () => resolve(this),
                this._options.drawerTransitionDuration
            );
        });
    }
    /**
     * Hides offcanvas drawer.
     * @return {Promise<Offcanvas>} Promise that resolves after offcanvas drawer is hidden.
     */
    protected _hideDrawer(): Promise<Offcanvas> {
        return new Promise(resolve => {
            this._$drawer.removeClass(
                `${this._options.className}__drawer--visible`
            );
            setTimeout(
                () => resolve(this),
                this._options.drawerTransitionDuration
            );
        });
    }
    /**
     * Attaches event listeners.
     */
    protected _addEventListeners(): void {
        this._eventListeners.triggerClick = (e: Event) => this.toggle(e);
        this._$trigger.on('click', this._eventListeners.triggerClick);

        if (this._options.closeOnBlur) {
            this._eventListeners.overlayClick = () => this.hide();
            this._$overlay.on('click', this._eventListeners.overlayClick);
        }
    }
    /**
     * Removes event listeners.
     */
    protected _removeEventListeners(): void {
        this._$trigger.off('click', this._eventListeners.triggerClick);
        this._$overlay.off('click', this._eventListeners.overlayClick);
    }
}
