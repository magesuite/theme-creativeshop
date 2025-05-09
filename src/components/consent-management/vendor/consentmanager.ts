const consentmanager = {
    /**
     * Check consent status for Consentmanager
     * @param serviceName
     * @returns
     */
    checkConsent: async (serviceName: string) => {
        const cmpData = __cmp('getCMPData');
        if (cmpData) {
            const service = cmpData.vendorsList.find(
                (service: { name: string }) => service.name === serviceName
            );
            const serviceId = service?.id;
            return service ? cmpData.vendorConsents?.[serviceId] : false;
        } else {
            return false;
        }
    },

    /**
     * Run callback on vendor initialization
     * @param callback
     */
    attachInitializeEvent: (callback: () => void) => {
        if (typeof __cmp === 'function') {
            callback();
        } else {
            __cmp(
                'addEventListener',
                [
                    'settings',
                    () => {
                        callback();
                    },
                    false,
                ],
                null
            );
        }
    },

    /**
     * Run callback on vendor consent change
     * @param callback
     */
    attachChangeEvent: (callback: () => void) => {
        __cmp(
            'addEventListener',
            [
                'consent',
                () => {
                    callback();
                },
                false,
            ],
            null
        );
    },
};

export default consentmanager;
