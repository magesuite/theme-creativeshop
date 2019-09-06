define([], function() {
    'use strict';

    return function(Provider) {
        return Provider.extend({
            dataStorageHandler: function(dataStorage) {
                if (Object.keys(this.data).length > 100) {
                    dataStorage.dataHandler({});
                }

                this._super(dataStorage);
            },
            idsStorageHandler: function(idsStorage) {
                if (Object.keys(this.data).length > 100) {
                    idsStorage.localStorage.removeAll();
                    idsStorage.data({});
                }

                this._super(idsStorage);
            },
        });
    };
});
