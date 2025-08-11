import deepGet from "utils/deep-get/deep-get";
import viewXml from "etc/view";

declare global {
    interface Window {
        Cookiebot: {
            consent: {
                marketing: boolean;
                functional: boolean;
                necessary: boolean;
                preferences: boolean;
            }
        }
    }
}

type ServicesMap = {
    [key: string]: 'marketing' | 'functional' | 'necessary' | 'preferences';
}

const servicesMap: ServicesMap = deepGet(
    viewXml,
    'vars.Magento_Theme.consent_management.cookiebot_services_map'
) || {};

const cookiebot = {
    /**
     * Cookiebot has hardcoded 4 categories, there is no way to add custom ones
     * @see https://support.cookiebot.com/hc/en-us/articles/360003783574-Customizing-the-cookie-categories
     * @param serviceName
     * @returns
     */
    checkConsent: async (serviceName: string) => {
        const category = servicesMap[serviceName]
        if (!category) {
            console.warn(`Service "${serviceName}" is not defined in services map.`);
            return false;
        }

        return window.Cookiebot ? !!(window.Cookiebot.consent?.[category]) : false;
    },

    /**
     * Run callback on vendor initialization
     * @param callback
     */
    attachInitializeEvent: (callback: () => void) => {
        if (window.Cookiebot) {
            callback();
            return;
        }
        window.addEventListener('CookiebotOnLoad', callback)
    },

    /**
     * Run callback on vendor consent change
     * @param callback
     */
    attachChangeEvent: (callback: () => void) => {
        window.addEventListener('CookiebotOnAccept', callback)
    },
};

export default cookiebot;
