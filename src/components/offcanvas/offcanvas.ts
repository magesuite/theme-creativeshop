import * as $ from 'jquery';

/**
 * Component options interface.
 */
export interface OffcanvasOptions {
    className?: string; // Component class name.
    triggerClassName?: string; // Offcanvas trigger class name.
    closeOnBlur?: boolean; // Should offcanvas be closed on overlay click.
    closeOnOtherOffcanvasOpened?: boolean; // Should offcanvas be closed when other offcanvas is about to be opened.
    drawerTransitionDuration?: number; // How long does the drawer CSS transition take in ms.
    overlayTransitionDuration?: number; // How long does the overlay CSS transition take in ms.
    topbarSelector?: string; // Topbar element selector
    pagewrapperSelector?: string; // Page wrapper element selector
    bodyOpenClass?: string; // Class added to the body element when given instance of offcanvas is open
    closeButtonClassName?: string; // Optional, additional close button name.
    offcanvasShowTriggerEvent?: string; // Adds event to be listened to on body, that will trigger ofcanvas open.
    offcanvasHideTriggerEvent?: string; // Adds event to be listened to on body, that will trigger ofcanvas close.
}

/**
 * Offcanvas component for mobile off-screen content.
 */
export default class Offcanvas {
    protected _$element: JQuery;
    protected _$overlay: JQuery;
    protected _$drawer: JQuery;
    protected _$trigger: JQuery;
    protected _$topbar: JQuery;
    protected _$pageWrapper: JQuery<HTMLElement>;
    protected _$closeButton: JQuery;
    protected _options: OffcanvasOptions;
    protected _eventListeners: {
        triggerClick?: (event: Event) => void;
        overlayClick?: (event: Event) => void;
        closeClick?: (event: Event) => void;
    } = {};

    /**
     * Creates new offcanvas component with optional settings.
     * @param {HTMLElement} element Optional, element to be initialized on.
     * @param {OffcanvasOptions} options  Optional settings object.
     */
    public constructor(element?: HTMLElement, options?: OffcanvasOptions) {
        this._options = $.extend(
            {
                className: 'cs-offcanvas',
                triggerClassName: 'cs-offcanvas-trigger',
                closeOnBlur: true,
                closeOnOtherOffcanvasOpened: true,
                drawerTransitionDuration: 300,
                overlayTransitionDuration: 300,
                topbarSelector: '.cs-topbar',
                pagewrapperSelector: '.page-wrapper',
                bodyOpenClass: '',
                closeButtonClassName: '',
            },
            options
        );

        this._$element = element
            ? $(element)
            : $(`.${this._options.className}`);
        if (this._$element.length === 0) {
            return;
        }

        this._$drawer = this._$element.find(`.drawer`);
        this._$overlay = this._$element.find(`.overlay`);
        this._$trigger = $(`.${this._options.triggerClassName}`);
        this._$topbar = $(this._options.topbarSelector);
        this._$pageWrapper = $(this._options.pagewrapperSelector);

        if (this._options.closeButtonClassName) {
            this._$closeButton = $(`.${this._options.closeButtonClassName}`);
        }

        this._addEventListeners();

        // Hide offcanvas when search is opened
        $('body').on('before-search-open', () => {
            if (
                this._$trigger.hasClass(
                    `${this._options.triggerClassName}--active`
                )
            ) {
                this.hide();
            }
        });
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
        const $currentTopOffset: number = window.scrollY;
        $('body')
            .addClass('no-scroll ' + this._options.bodyOpenClass)
            .css({ top: -$currentTopOffset })
            .trigger('before-offcanvas-open', [this]);
        this._$pageWrapper.addClass('no-scroll-child');

        this._$trigger
            .addClass(`${this._options.triggerClassName}--active`)
            .attr('aria-expanded', 'true');
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
        const $currentTopOffset: string = $('body').css('top');
        $('body')
            .removeClass('no-scroll ' + this._options.bodyOpenClass)
            .css('top', '');
        this._$pageWrapper.removeClass('no-scroll-child');
        window.scrollTo(0, parseInt($currentTopOffset || '0', 10) * -1);

        this._$trigger
            .removeClass(`${this._options.triggerClassName}--active`)
            .attr('aria-expanded', 'false');
        return Promise.all([this._hideOverlay(), this._hideDrawer()]).then(
            () => {
                this._$element.trigger('offcanvas-hide', this);
                this._$topbar.css('z-index', '');
                return this;
            }
        );
    }

    /**
     * Hides offcanvas but leave body and topbar state. This method is trigger when another offcanvas will be opened.
     * @return {Promise<Offcanvas>} Promise that resolves after offcanvas is hidden.
     */
    public softHide(): Promise<Offcanvas> {
        this._$trigger
            .removeClass(`${this._options.triggerClassName}--active`)
            .attr('aria-expanded', 'false');
        $('body').removeClass(this._options.bodyOpenClass);
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
        return new Promise((resolve) => {
            this._$topbar.css('z-index', 'auto');
            this._$overlay.addClass(`overlay--visible`);
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
        return new Promise((resolve) => {
            this._$overlay.removeClass(`overlay--visible`);
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
        return new Promise((resolve) => {
            this._$drawer.addClass(`drawer--visible`);
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
        return new Promise((resolve) => {
            this._$drawer.removeClass(`drawer--visible`);
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
        $(document).on(
            'click',
            `.${this._options.triggerClassName}`,
            this._eventListeners.triggerClick
        );

        if (this._options.offcanvasShowTriggerEvent) {
            $('body').on(this._options.offcanvasShowTriggerEvent, () =>
                this.show()
            );
        }

        if (this._options.offcanvasHideTriggerEvent) {
            $('body').on(this._options.offcanvasHideTriggerEvent, () =>
                this.hide()
            );
        }

        if (this._options.closeOnBlur) {
            this._eventListeners.overlayClick = () => this.hide();
            this._$overlay.on('click', this._eventListeners.overlayClick);
        }

        if (this._options.closeButtonClassName && this._$closeButton.length) {
            this._eventListeners.closeClick = () => this.hide();
            this._$closeButton.on('click', this._eventListeners.closeClick);
        }

        if (this._options.closeOnOtherOffcanvasOpened) {
            $('body').on('before-offcanvas-open', (e, instance) => {
                if (!instance._$element.is(this._$element)) {
                    this.softHide();
                }
            });
        }
    }
    /**
     * Removes event listeners.
     */
    protected _removeEventListeners(): void {
        this._$trigger.off('click', this._eventListeners.triggerClick);
        this._$overlay.off('click', this._eventListeners.overlayClick);

        if (this._options.closeButtonClassName && this._$closeButton.length) {
            this._$closeButton.off('click', this._eventListeners.closeClick);
        }
    }
}
