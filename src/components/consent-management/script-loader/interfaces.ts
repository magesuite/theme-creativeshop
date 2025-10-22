export default interface iConsentManagedScriptLoaderOptions {
    /**
     * Decides if Mutation Observer should be utilized.
     * Scripts initialized with requireJs via data-mage-init
     * or x-magento-init will not be registered untill
     * this option is enabled.
     *
     * @default false
     */
    useObserver?: boolean;
    /**
     * Mutation Observer options object.
     */
    observerOptions?: mutationObserverOptions;
    /**
     * Option to save current consent status
     * of each tracked service in local storage.
     *
     * @default false
     */
    useLocalStorage?: boolean;
    /**
     * Additional data attributes in script tag
     */
    dataAttributes?: {
        consentServiceRequired?: string;
        consentService?: string;
        isInline?: string;
    };
}

export interface mutationObserverConfig {
    /**
     * @default true
     */
    childList?: boolean;
    /**
     * @default false
     */
    subtree?: boolean;
}

export interface mutationObserverOptions {
    /**
     * A DOM Node (which may be an Element) within the DOM tree
     * to watch for changes, or to be the root of a subtree
     * of nodes to be watched.
     *
     * @default document.head
     */
    target?: Node | HTMLElement;
    /**
     * Mustation Observer basic (childList, subtree) observe configuration options.
     * https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
     */
    config?: mutationObserverConfig;
}
