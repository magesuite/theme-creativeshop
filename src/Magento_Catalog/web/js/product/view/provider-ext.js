/**
 *  Cleaning the storage after visiting 100 products
 *  Aligned with Magento 2.4.7 in 04/2024
 */
define([], function () {
    'use strict';

    return function (Provider) {
        return Provider.extend({
            dataStorageHandler: function (dataStorage) {
                if (Object.keys(this.data).length > 100) {
                    dataStorage.dataHandler({});
                }

                this._super(dataStorage);
            },
            idsStorageHandler: function (idsStorage) {
                if (Object.keys(this.data).length > 100) {
                    idsStorage.localStorage.removeAll();
                    idsStorage.data({});
                }

                this._super(idsStorage);
            },
        });
    };
});
