const usercentrics = {
    /**
     * Check consent status for Usercentrics
     * @param serviceName
     * @returns
     */
    checkConsent: (serviceName: string) => {
        if (window['UC_UI'] && window['UC_UI'].isInitialized()) {
            const service: any = window['UC_UI'].getServicesBaseInfo().find((service: any) => service.name === serviceName);

            return service ? service.consent.status : false;
        } else {
            // Don't allow until usercentrics has loaded && consent is accepted
            return false;
        }
    },
    /**
     * Run callback on vendor initialization
     * @param callback
     */
    attachInitializeEvent: (callback: () => void) => {
        if (window['UC_UI'] && window['UC_UI'].isInitialized()) {
            callback();
            return;
        }

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
    },
    /**
     * Show Usercentrics layer.
     */
    showLayer: (): void => {
        if (
            window['UC_UI'] &&
            window['UC_UI'].isInitialized()
        ) {
            window['UC_UI'].showSecondLayer();
        }
    }
}

export default usercentrics;
