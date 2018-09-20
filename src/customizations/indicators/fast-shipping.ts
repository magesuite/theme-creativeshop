import FastShipping from 'components/indicators/fast-shipping';
import storage from 'Magento_Ui/js/lib/core/storage/local';
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
        const storageData: any = storage.get('fastShipping');
        const now: number = Math.floor(Date.now() / 1000);

        if (
            typeof storageData === 'undefined' || // nothing has been saved yet. sotrage is empty
            storageData.lastSave + cachingTime * 60 <= now || // storage time set in options expired
            (storageData.day === 'today' && storageData.time <= now) // time was 'today' but it has ended
        ) {
            return true;
        }

        return false;
    }

    /**
     * If _isUpdateRequired() returns false, it will initialize...
     * ...template update based on data it has in cache
     */
    protected _updateFromCache(): void {
        this.updateTemplate(storage.get('fastShipping'));
    }

    /**
     * Saves data from server to local cache using magento's storage
     */
    protected _saveToCache(data: any): void {
        data.lastSave = Math.floor(Date.now() / 1000);
        storage.set('fastShipping', data);
    }
}

export { FastShippingCached };
