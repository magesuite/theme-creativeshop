import deepGet from 'utils/deep-get/deep-get';
import viewXml from 'etc/view';

declare global {
    interface Window {
        CookieFirst: {
            openPanel: () => void;
            consent: {
                advertising: boolean;
                functional: boolean;
                necessary: boolean;
                performance: boolean;
            }
        }
    }
}

type ServicesMap = {
    [key: string]: 'advertising' | 'functional' | 'necessary' | 'performance';
}

const servicesMap: ServicesMap = deepGet(
    viewXml,
    'vars.Magento_Theme.consent_management.cookiefirst_services_map'
) || {};

const cookiefirst = {
    checkConsent: (serviceName: string) => {
        const category = servicesMap[serviceName]
        if (!category) {
            console.warn(`Service "${serviceName}" is not defined in services map.`);
            return false;
        }

        return window.CookieFirst ? !!(window.CookieFirst.consent?.[category]) : false;
    },

    attachInitializeEvent: (callback: () => void) => {
        if (window.CookieFirst) {
            callback();
            return;
        }

        window.addEventListener('cf_init', (e) => {
            callback();
        });
    },

    attachChangeEvent: (callback: () => void) => {
        window.addEventListener('cf_consent', callback);
    },

    showLayer: (): void => {
        if (window.CookieFirst) {
            window.CookieFirst.openPanel()
        }
    }
}

export default cookiefirst;
