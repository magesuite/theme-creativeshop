import ConsentManagedScriptLoader from 'components/consent-management/script-loader/script-loader';

declare global {
    interface Window {
        ConsentManagedScriptLoader?: ConsentManagedScriptLoader;
    }
}

/**
 * Initialize Consent Managed Scripts Loader
 * with default options:
 * - no MutationObserver,
 * - no LocalStorage
 */

window.ConsentManagedScriptLoader =
    window.ConsentManagedScriptLoader || new ConsentManagedScriptLoader();

export default window.ConsentManagedScriptLoader;
