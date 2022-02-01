import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';
import {
    checkConsentForService,
    attachInitializeEvent,
    attachChangeEvent,
} from 'components/consent-management/vendor/usercentrics';

const consentManagement = {
    vendor: deepGet(viewXml, 'vars.Magento_Theme.consent_management.vendor'),
    services: deepGet(
        viewXml,
        'vars.Magento_Theme.consent_management.services'
    ),
    /**
     * Check consent status
     * @param service
     * @returns
     */
    checkConsent: function(service: string): boolean {
        switch (this.vendor) {
            case 'usercentrics':
                return checkConsentForService(this.services[service]);

                break;
            case 'amasty':
                break;
            default:
                // If you debugged here, then probably vendor is not set in XML
                // You can also set it to true in case you want to ignore XML settings for development purposes
                return false;
                break;
        }
    },
    /**
     * Run callback on vendor initialization
     * @param callback
     * @returns
     */
    initializeEvent: function(callback: () => void): void {
        switch (this.vendor) {
            case 'usercentrics':
                return attachInitializeEvent(callback);

                break;
            case 'amasty':
                break;
            default:
                break;
        }
    },
    /**
     * Run callback on vendor consent change
     * @param callback
     * @returns
     */
    changeEvent: function(callback: () => void): void {
        switch (this.vendor) {
            case 'usercentrics':
                return attachChangeEvent(callback);

                break;
            case 'amasty':
                break;
            default:
                break;
        }
    },
};

export default consentManagement;
