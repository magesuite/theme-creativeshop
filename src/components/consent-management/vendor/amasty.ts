import * as $ from 'jquery';
import { getCookie } from 'utils/cookies';

declare global {
    interface Window {
        isGdprCookieEnabled: boolean;
    }
}

const amasty = {
    /**
     * Check consent status for Amasty
     * @param serviceName
     * @returns
     */
    checkConsent: (serviceName: string) => {
        if (window.isGdprCookieEnabled) {
            const allowedGroups = getCookie('amcookie_allowed');
            const disallowedCookie = getCookie('amcookie_disallowed') || '';
            const cookiePolicyRestriction = getCookie('amcookie_policy_restriction');

            // Cookie policy can be restricted to specific countries, skip checking for disabled countries
            if (cookiePolicyRestriction != null ? cookiePolicyRestriction !== 'allowed' : false) {
                return true;
            }

            // %2C is encoded ','
            return !((!allowedGroups && !disallowedCookie) || disallowedCookie.split('%2C').indexOf(serviceName) !== -1);
        } else {
            // Don't allow if Amasty is disabled in Admin Panel
            return false;
        }
    },
    /**
     * Consent data is saved in cookies
     * If this is first component initialization, change event will do the work
     * Therefore this event can be skipped
     *
     * In case this event is needed in fututre for other reasons, it can be triggered using the snippet below:
     * ```
     * if (window.isGdprCookieEnabled) {
     *    requireAsync(['Amasty_GdprCookie/js/cookies']).then(([amastyComponent]) => {
     *        callback();
     *    })
     * }
     * ```
     * @param callback
     */
    attachInitializeEvent: (callback: () => void) => {
        return;
    },
    /**
     * Run callback on vendor consent change
     * Only attach if Amasty Module is enabled
     *
     * @param callback
     */
    attachChangeEvent: (callback: () => void) => {
        if (window.isGdprCookieEnabled) {
            $('body').on('amcookie_save amcookie_allow', e => {
                callback();
            });
        }
    }
}



export default amasty;
