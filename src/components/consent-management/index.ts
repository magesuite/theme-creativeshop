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
            default:
                /**
                 * If you debugged here, then probably vendor is not set in XML
                 * Default value is used instead
                 */
                return deepGet(
                    viewXml,
                    'vars.Magento_Theme.consent_management.default_value'
                );
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
            default:
                break;
        }
    },
};

export default consentManagement;
