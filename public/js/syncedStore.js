(function(Store) {

    function SyncedStore(name, serverUrl) {
        this.serverUrl = serverUrl;
        this.reqQueue = [];

        Store.call(this, name);
        this.attachOnlineHandler();
    }

    SyncedStore.prototype = Object.create(Store.prototype);

    SyncedStore.prototype.attachOnlineHandler = function() {
        window.addEventListener("online", function() {
            this.processQueue();
        }.bind(this));
    };

    SyncedStore.prototype.add = function(item) {
        var promise = Store.prototype.add.call(this, item);

        return promise.then(function(res) {
            return this.get(res.id);
        }.bind(this)).then(function(addedItem) {
            this.enqueueRequest("POST", addedItem);
        }.bind(this));
    };

    SyncedStore.prototype.update = function(item) {
        var promise = Store.prototype.update.call(this, item);

        return promise.then(function(res) {
            return this.get(res.id);
        }.bind(this)).then(function(updatedItem) {
            this.enqueueRequest("PUT", updatedItem);
        }.bind(this));
    };

    SyncedStore.prototype.remove = function(id) {
        var promise = Store.prototype.remove.call(this, id);

        return promise.then(function() {
            this.enqueueRequest("DELETE", id);
        }.bind(this));
    };

    SyncedStore.prototype.enqueueRequest = function(type, data) {
        this.reqQueue.push({
            method: type,
            data: data
        });
        this.processQueue();
    };

    SyncedStore.prototype.processQueue = function() {
        if(!navigator.onLine)
            return;

        while(this.reqQueue.length) {
            var req = this.reqQueue[0];

            this.sendRequest(req).then(function() {
                this.reqQueue.unshift();
                this.processQueue();
            }.bind(this));
        }
    };

    SyncedStore.prototype.sendRequest = function(req) {
        // TODO: implement sending request
    };

    window.SyncedStore = SyncedStore;

}(PouchDB));