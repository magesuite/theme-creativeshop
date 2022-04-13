import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';
import usercentrics from 'components/consent-management/vendor/usercentrics';
import amasty from 'components/consent-management/vendor/amasty';

const consentManagement = {
    vendor: deepGet(viewXml, 'vars.Magento_Theme.consent_management.vendor'),
    services: deepGet(
        viewXml,
        'vars.Magento_Theme.consent_management.services'
    ),
    defaultValue: deepGet(
        viewXml,
        'vars.Magento_Theme.consent_management.default_value'
    ),
    mapVendors: {
        usercentrics: usercentrics,
        amasty: amasty,
    },
    /**
     * Check consent status
     * @param service
     * @returns
     */
    checkConsent: function(service: string): boolean {
        if (!this.vendor || !this.mapVendors[this.vendor]) {
            return this.defaultValue;
        }

        return this.mapVendors[this.vendor].checkConsent(
            this.services[service]
        );
    },
    /**
     * Run callback on vendor initialization
     * @param callback
     * @returns
     */
    initializeEvent: function(callback: () => void): void {
        if (!this.vendor || !this.mapVendors[this.vendor]) {
            return;
        }

        return this.mapVendors[this.vendor].attachInitializeEvent(callback);
    },
    /**
     * Run callback on vendor consent change
     * @param callback
     * @returns
     */
    changeEvent: function(callback: () => void): void {
        if (!this.vendor || !this.mapVendors[this.vendor]) {
            return;
        }

        return this.mapVendors[this.vendor].attachChangeEvent(callback);
    },
};

export default consentManagement;
