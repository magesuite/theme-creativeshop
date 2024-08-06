const usercentrics = {
    /**
     * Check consent status for Usercentrics
     * @param serviceName
     * @returns
     */
    checkConsent: async (serviceName: string) => {
        try {
            if (window['__ucCmp']) {
                const isInitialized = await window['__ucCmp'].isInitialized();

                if (isInitialized) {
                    const data = await window['__ucCmp'].getConsentDetails();
                    const service = Object.values(data?.services ?? []).find(service => service.name === serviceName);
                    return service ? service.consent.given : false;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.error("An error occurred while checking consent:", error);
            return false;
        }
    },

    /**
     * Run callback on vendor initialization
     * @param callback
     */
    attachInitializeEvent: (callback: () => void) => {
        window.addEventListener('UC_UI_INITIALIZED', (e) => {
            callback();
        });
    },
    /**
     * Run callback on vendor consent change
     * @param callback
     */
    attachChangeEvent: (callback: () => void) => {
        window.addEventListener('UC_UI_CMP_EVENT', (e) => {
            if (['ACCEPT_ALL', 'DENY_ALL', 'SAVE'].includes(e['detail']['type'])) {
                callback();
            }
        });
    }
}

export default usercentrics;
