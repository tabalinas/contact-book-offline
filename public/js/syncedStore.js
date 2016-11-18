(function(Store) {

    var REQUEST_RETRY_DELAY = 500;

    function SyncedStore(name, endpointUrl) {
        this.endpointUrl = endpointUrl;

        this.attachOnlineHandler();

        Store.call(this, name);

        this.loadRequestQueue(name);
        this.processQueue();
    }

    SyncedStore.prototype = Object.create(Store.prototype);

    SyncedStore.prototype.loadRequestQueue = function(storeName) {
        this.requestQueueStorageName = "__requests_" + storeName;

        var storedQueue = localStorage.getItem(this.requestQueueStorageName) || "[]";

        this.requestQueue = JSON.parse(storedQueue);
    };

    SyncedStore.prototype.saveRequestQueue = function() {
        localStorage.setItem(this.requestQueueStorageName, JSON.stringify(this.requestQueue));
    };

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
            this.enqueueRequest({
                method: "POST",
                data: addedItem
            });
        }.bind(this));
    };

    SyncedStore.prototype.update = function(item) {
        var promise = Store.prototype.update.call(this, item);

        return promise.then(function(res) {
            return this.get(res.id);
        }.bind(this)).then(function(updatedItem) {
            this.enqueueRequest({
                method: "PUT",
                id: updatedItem._id,
                data: updatedItem
            });
        }.bind(this));
    };

    SyncedStore.prototype.remove = function(id) {
        var promise = Store.prototype.remove.call(this, id);

        return promise.then(function() {
            this.enqueueRequest({
                method: "DELETE",
                id: id
            });
        }.bind(this));
    };

    SyncedStore.prototype.enqueueRequest = function(req) {
        this.requestQueue.push(req);
        this.saveRequestQueue();
        this.processQueue();
    };

    SyncedStore.prototype.processQueue = function() {
        if(!navigator.onLine || !this.requestQueue.length)
            return;

        var req = this.requestQueue[0];

        this.sendRequest(req,
            function() {
                this.requestQueue.shift();
                this.saveRequestQueue();

                this.processQueue();
            }.bind(this), function(e) {
                console.error(e);

                setTimeout(function() {
                    this.processQueue();
                }.bind(this), REQUEST_RETRY_DELAY);
            }.bind(this));
    };

    SyncedStore.prototype.sendRequest = function(req, done, fail) {
        try {
            var url = this.endpointUrl + (req.id ? "/" + req.id : "");

            var xhr = new XMLHttpRequest();
            xhr.open(req.method, url, true);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function() {
                if(xhr.status >= 200 && xhr.status < 300) {
                    done(xhr.responseText);
                } else {
                    fail(xhr.statusText);
                }
            };

            xhr.send(req.data ? JSON.stringify(req.data) : null);

        } catch(e) {
            fail(JSON.stringify(e));
        }
    };

    window.SyncedStore = SyncedStore;

}(Store));