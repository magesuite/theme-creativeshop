import iConsentManagedScriptLoaderOptions from 'components/consent-management/script-loader/interfaces';

/**
 * Component created in order to handle loading of constent managed scripts.
 *
 * Default settings are not including MutationObserver since the main purpose
 * of the component is to track consent for Google Maps API which
 * do not requires it at the currrent configuration.
 *
 * In order to track scripts loaded with requireJS, MutationObserver option
 * has to be enabled (pass as argument: useObserver: true).
 *
 * Script that is meant to be loaded with user consent must be added
 * by developer in a certain way.
 * Steps are divided into imperative and declarative notation.
 *
 * It supports both inline scripts and scripts loaded via src attribute, event if there are multiple
 * scripts for the same service.
 * Logic in potential custom data-* attributes in script tag is also preserved in scripts.
 *
 * In order to track the script:
 * - imperative notation (raw script tag inside PTHML):
 *   - set script type prop. to text/html - this will prevent the script from
 *     being loaded and executed,
 *   - set the script with data attributes:
 *     - data-consent-service-required (required): value => true - this will
 *       add script to tracking array,
 *     - data-consent-service (required): value => name of Your choice,
 *       written in lowercase, without spaces. This name has to be then added
 *       to view.xml file to: consent_management -> vendor -> services
 *     - data-src (optional): the value for it is simply the url to the script,
 *       in case src attribute is causing issues with being loaded with requireAsync
 *       because of the *.js extension, developer can define a url without extension
 *       at the end. Value of this attribute is taken by default by the script logic,
 *       with fallback to src attribute if not present
 *     - data-is-inline (optional): value => true - use if script is inline script
 *       or have data-* attributes, which are needed to be preserved
 * - declarative notation (data-mage-init / x-magento-init):
 *   - NOTE: In this type of notation it is assumed that the script has been added
 *     via path property in requirejs-config.js file,
 *   - take all necessary steps described for imperative notation and apply them
 *     using requirejs-config.js via `attributes` property. Detailed description
 *     of this procedure has been written in theme's cs requirejs-config.js file.
 *     In order to find it just look for: `onNodeCreated`.
 *     It's a special hook available in requires js which allow to add necessary attributes
 *     to selected script before it's been inserted to the DOM.
 */

/**
 * Service load status type
 */
type serviceLoadStatusType = {
    loaded: boolean;
};

export default class ConsentManagedScriptLoader {
    public options: iConsentManagedScriptLoaderOptions = {
        useLocalStorage: false,
        useObserver: false,
        observerOptions: {
            target: document.head,
            config: {
                childList: true,
                subtree: false,
            },
        },
        dataAttributes: {
            consentServiceRequired: 'data-consent-service-required',
            consentService: 'data-consent-service',
            isInline: 'data-is-inline',
        },
    };
    private consentManagement: any;
    private serviceLoadStatus: Record<string, serviceLoadStatusType> = {};
    private observer: MutationObserver;
    private isInitialized = false;
    private consentManagedScriptsServices: Record<string, number> = {};
    private consentManagedScriptsServicesLoaded: Record<string, number> = {};

    /**
     * Creates Consent Managed Script Loader component.
     *
     * @param {iConsentManagedScriptLoaderOptions} options  Optional settings.
     */
    public constructor(options?: iConsentManagedScriptLoaderOptions) {
        this.options = { ...this.options, ...options }; // Shallow copy only!

        const consentManagedScripts: HTMLScriptElement[] = Array.from(
            document.querySelectorAll(
                `[${this.options.dataAttributes.consentServiceRequired}]`
            )
        );

        if (this.options.useObserver) {
            this.observeForNewScripts();
        }

        this.collectConsentManagedScripts(consentManagedScripts);
        this.init(consentManagedScripts);
    }

    /**
     * Initialize script if Consent Managed Scripts are present.
     */
    public init(scriptElements: HTMLScriptElement[]): void {
        if (scriptElements.length > 0) {
            this.initConsent(scriptElements);
        }
    }

    /**
     * Collect all consent managed scripts present in the document.
     */
    public collectConsentManagedScripts(
        scriptElements: HTMLScriptElement[]
    ): void {
        scriptElements.forEach((scriptTag) => {
            const service = scriptTag.getAttribute(
                `${this.options.dataAttributes.consentService}`
            );
            if (service) {
                this.consentManagedScriptsServices[service] =
                    (this.consentManagedScriptsServices[service] || 0) + 1;
            }
        });

        console.log(this.consentManagedScriptsServices);
    }

    /**
     * Observer created to observe if there are new script elements in document.head
     */
    public observeForNewScripts() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((element: HTMLScriptElement) => {
                    if (
                        element.type === 'text/html' &&
                        element.hasAttribute(
                            this.options.dataAttributes.consentServiceRequired
                        )
                    ) {
                        const consentManagedScriptsArrNew = [element];

                        if (!this.isInitialized) {
                            this.initConsent([element]);
                        } else {
                            this.attachConsentEvents(
                                consentManagedScriptsArrNew
                            );
                        }
                    }
                });
            });
        });

        this.observer.observe(
            this.options.observerOptions.target,
            this.options.observerOptions.config
        );
    }

    /**
     * ASYNC. Imports ConsentManagement module asynchronously.
     * @return Promise
     */
    public async initConsent(
        consentManagedScripts: HTMLScriptElement[]
    ): Promise<void> {
        const { default: consentManagement } = await import(
            'components/consent-management'
        );
        this.consentManagement = consentManagement;

        if (this.consentManagement) {
            this.isInitialized = true;
            this.attachConsentEvents(consentManagedScripts);
        }
    }

    /**
     * Attach ConsentManagement related events.
     */
    public attachConsentEvents(scriptTagsList: HTMLScriptElement[]): void {
        const callback = (): void => {
            scriptTagsList.forEach((el) => {
                this.handleConsentManagedScripts(el);
            });
        };

        this.consentManagement.initializeEvent(callback);
        this.consentManagement.changeEvent(callback);
    }

    /**
     * Run actions depending if consent managed scripts are present.
     *
     * @param scriptTag script tag element
     */
    public handleConsentManagedScripts(
        scriptTag: HTMLScriptElement
    ): Promise<void> {
        const scriptConsentService = scriptTag.dataset?.consentService;
        const scriptType = scriptTag.type;
        const isServiceLoaded: boolean =
            this.serviceLoadStatus?.[scriptConsentService]?.loaded;

        if (scriptType !== 'text/html') {
            return;
        }

        const consentStatus: boolean =
            this.consentManagement.checkConsent(scriptConsentService);

        if (this.options.useLocalStorage) {
            // TODO: Change single entries to object
            const localStorageItemName = `mgs_service_consent_${scriptConsentService}`;
            const localStorageConsentStatus: string =
                window.localStorage.getItem(localStorageItemName);

            if (
                localStorageConsentStatus === null ||
                localStorageConsentStatus !== consentStatus.toString()
            ) {
                this.saveToLocalStorage(
                    localStorageItemName,
                    consentStatus,
                    scriptConsentService
                );
            }
        }

        if (!isServiceLoaded && consentStatus) {
            scriptTag.remove();
            this.loadScript(scriptTag, scriptConsentService);
        }
    }

    /**
     * ASYNC. Load the script for which consent has been given.
     * Script loading is performed with requireAsync utility.
     *
     * @param scriptTag script tag element
     * @param serviceName name of the service consent is saved for
     */
    public async loadScript(
        scriptTag: HTMLScriptElement,
        serviceName: string
    ): Promise<void> {
        const isInline =
            scriptTag.hasAttribute(this.options.dataAttributes.isInline) ||
            false;

        if (isInline) {
            const script = document.createElement('script');

            for (const attr of Array.from(scriptTag.attributes)) {
                script.setAttribute(attr.name, attr.value);
            }

            if (scriptTag.textContent) {
                script.textContent = scriptTag.textContent;
            }

            script.type = 'text/javascript';
            document.head.appendChild(script);
        } else {
            const scriptSrc = scriptTag.dataset?.src ?? scriptTag.src;
            const { default: requireAsync } = await import(
                'utils/require-async'
            );
            const script = await requireAsync([scriptSrc]);
        }

        this.consentManagedScriptsServicesLoaded[serviceName] =
            (this.consentManagedScriptsServicesLoaded[serviceName] || 0) + 1;

        if (
            this.consentManagedScriptsServicesLoaded[serviceName] ===
            this.consentManagedScriptsServices[serviceName]
        ) {
            this.updateServiceLoadStatus(serviceName);
            this.eventDispatch(serviceName);
        }
    }

    /**
     * Update information about script
     * if it has been already loaded.
     *
     * @param serviceName name of the service consent is saved for
     */
    public updateServiceLoadStatus(serviceName: string): void {
        this.serviceLoadStatus[serviceName] = {
            loaded: true,
        };
    }

    /**
     * Dispatch an event as post script loading action
     * in order to inform components about it.
     *
     * @param serviceName name of the service consent is saved for
     */
    public eventDispatch(serviceName: string) {
        const event = new Event(`${serviceName}:loaded`);

        window.dispatchEvent(event);
    }

    /**
     * Save service consent status to local storage.
     *
     * @param itemName name of the saved item in localstorage
     * @param consentStatus current consent status of the selected service
     * @param serviceName name of the service consent is saved for
     */
    public saveToLocalStorage(
        itemName: string,
        consentStatus: boolean,
        serviceName: string
    ): void {
        try {
            // TODO: Change single entries to object
            window.localStorage.setItem(itemName, consentStatus.toString());
        } catch (error) {
            console.error(
                `${serviceName}: We could not save the value of the consent`
            );
        }
    }
}
