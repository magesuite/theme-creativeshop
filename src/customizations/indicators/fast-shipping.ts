import FastShipping from 'components/indicators/fast-shipping';
import * as $ from 'jquery';

/**
 * Defines caching time (in minutes)
 */
const cachingTime: number = 5;

/**
 * Extending class is needed as in CP we have no access to Magento's storage
 */
class FastShippingCached extends FastShipping {
    /**
     * Checks if update from server is required or cached version should be loaded
     */
    protected _isUpdateRequired(): boolean {
        const now: number = Math.floor(Date.now() / 1000);

        this._getStorageData().then(storageData => {
            if (
                typeof storageData === 'undefined' || // nothing has been saved yet. sotrage is empty
                storageData.lastSave + cachingTime * 60 <= now || // storage time set in options expired
                (storageData.day === 'today' && storageData.time <= now) // time was 'today' but it has ended
            ) {
                return true;
            }

            return false;
        });
        
        return true;
    }

    /**
     * Fetches local storage data about fastShipping
     */
    protected _getStorageData(): any {
        const deferred: JQueryDeferred<any> = jQuery.Deferred();
        requirejs(['Magento_Ui/js/lib/core/storage/local'], storage => {
            deferred.resolve(storage.get('fastShipping'));
        });
        return deferred;
    }

    /**
     * If _isUpdateRequired() returns false, it will initialize...
     * ...template update based on data it has in cache
     */
    protected _updateFromCache(): void {
        this._getStorageData().then(storage => {
            this.updateTemplate(storage);
        });
    }

    /**
     * Saves data from server to local cache using magento's storage
     * @param {any} data - information object about fastShipping status
     */
    protected _saveToCache(data: any): void {
        requirejs(['Magento_Ui/js/lib/core/storage/local'], storage => {
            data.lastSave = Math.floor(Date.now() / 1000);
            storage.set('fastShipping', data);
        });
    }
}

export { FastShippingCached };
