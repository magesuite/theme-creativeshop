import Offcanvas, { OffcanvasOptions } from 'components/offcanvas/offcanvas';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

export default class OffcanvasFilters extends Offcanvas {
    protected offcanvasMobileEnabled = deepGet(
        viewXml,
        'vars.Magento_Catalog.offcanvas_filters_enabled.mobile'
    );
    protected offcanvasDesktopEnabled = deepGet(
        viewXml,
        'vars.Magento_Catalog.offcanvas_filters_enabled.desktop'
    );
    protected offcanvasBreakpoint = deepGet(
        viewXml,
        'vars.Magento_Catalog.filters.breakpoint_switch'
    );

    constructor(element?: HTMLElement, options?: OffcanvasOptions) {
        super(element, options);

        if (
            this._$drawer &&
            (this.offcanvasDesktopEnabled || this.offcanvasMobileEnabled)
        ) {
            document.addEventListener(
                'breakpointChange',
                this._onBreakpointChange.bind(this)
            );
            this._onBreakpointChange();
        }
    }

    protected _shouldEnableDrawer(isDesktop: boolean) {
        return isDesktop
            ? this.offcanvasDesktopEnabled
            : this.offcanvasMobileEnabled;
    }

    protected _onBreakpointChange() {
        if (
            this._shouldEnableDrawer(
                window.breakpoint.current >=
                    window.breakpoint[this.offcanvasBreakpoint]
            )
        ) {
            this._$drawer.attr('inert', '');
        } else {
            this._$drawer.removeAttr('inert');
        }
    }
}
