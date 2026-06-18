import 'components/consent-management/consent-management.scss';
import * as $ from 'jquery';
import 'mage/translate';

import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';
import usercentrics from 'components/consent-management/vendor/usercentrics';
import usercentricsv3 from 'components/consent-management/vendor/usercentricsv3';
import amasty from 'components/consent-management/vendor/amasty';
import consentmanager from 'components/consent-management/vendor/consentmanager';
import cookiebot from 'components/consent-management/vendor/cookiebot';
import cookiefirst from 'components/consent-management/vendor/cookiefirst';

// This module provides a unified interface for managing user consent across different consent management vendors.
// It exports an object with methods to check consent status, initialize event listeners, handle consent changes, and show vendor-specific privacy settings layers.
// The module automatically detects the configured consent management vendor and delegates the operations to the appropriate vendor-specific implementation.

declare global {
    interface Window {
        consentManagement?: typeof consentManagement;
    }
}

const usercentricsVersion = document
    .querySelector('[data-usercentrics-version]')
    ?.getAttribute('data-usercentrics-version');
const consentManagement = {
    vendor:
        (window as any).consentManagementConfig?.vendor ||
        deepGet(viewXml, 'vars.Magento_Theme.consent_management.vendor'),
    services: deepGet(viewXml, 'vars.Magento_Theme.consent_management.services'),
    defaultValue: deepGet(viewXml, 'vars.Magento_Theme.consent_management.default_value'),
    mapVendors: {
        usercentrics: usercentricsVersion === 'v3' ? usercentricsv3 : usercentrics,
        usercentricsv3: usercentricsv3,
        amasty: amasty,
        consentmanager: consentmanager,
        cookiebot: cookiebot,
        cookiefirst: cookiefirst,
    },
    consentLayerClassName:
        deepGet(viewXml, 'vars.Magento_Theme.consent_management.consent_template_class_selector') ||
        'cs-consent-management',
    consentLayerTriggerClassName:
        deepGet(
            viewXml,
            'vars.Magento_Theme.consent_management.consent_layer_trigger_class_selector'
        ) || 'cs-consent-management__button',
    /**
     * Check consent status
     * @param service
     * @returns boolean or Promise<boolean> - depending on Consent Management Provider
     */
    checkConsent: function (service: string): boolean | Promise<boolean> {
        if (!this.vendor || !this.mapVendors[this.vendor]) {
            return this.defaultValue;
        }

        return this.mapVendors[this.vendor].checkConsent(this.services[service]);
    },
    /**
     * Run callback on vendor initialization
     * @param callback
     * @returns
     */
    initializeEvent: function (callback: () => void): void {
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
    changeEvent: function (callback: () => void): void {
        if (!this.vendor || !this.mapVendors[this.vendor]) {
            return;
        }

        return this.mapVendors[this.vendor].attachChangeEvent(callback);
    },

    /**
     * Show vendor privacy settings layer.
     * @returns
     */
    showVendorLayer: function (): void {
        if (!this.vendor || !this.mapVendors[this.vendor]) {
            return;
        }

        return this.mapVendors[this.vendor].showLayer();
    },

    /**
     * Mount consent layer overlay to main element (container)
     * @param container
     * @param templateOptions
     */
    mountConsentLayer: async function (
        container: HTMLElement,
        templateOptions = {
            classModifier: '',
            text: $.mage.__(
                'To view this content, please adjust <button class="cs-consent-management__button">Privacy Settings</button>'
            ),
        }
    ): Promise<void> {
        const { default: requireAsync } = await import('utils/require-async');
        const { consentTemplate } =
            await import('components/consent-management/templates/template');

        await requireAsync(['mage/template']).then(([mageTemplate]) => {
            container.insertAdjacentHTML(
                'beforeend',
                mageTemplate(consentTemplate, templateOptions)
            );

            const link = container.querySelector(`.${this.consentLayerTriggerClassName}`);

            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showVendorLayer();
                });
            }
        });
    },

    /**
     * Toggle consent layer visibility
     * @param container
     * @param isVisible
     */
    toggleConsentLayerVisibility: function (container: HTMLElement, isVisible: boolean) {
        container
            .querySelector(`.${this.consentLayerClassName}`)
            ?.classList.toggle(`${this.consentLayerClassName}--active`, isVisible);
    },
};

window.consentManagement = window.consentManagement || consentManagement;
export default window.consentManagement;
