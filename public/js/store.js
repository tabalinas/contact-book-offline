(function(PouchDB) {

    function Store(name, remote, onChange) {
        this.db = new PouchDB(name);

        PouchDB.sync(name, remote + '/' + name, {
            live: true,
            retry: true
        }).on('change', function (info) {
            onChange(info);
        });
    }

    Store.prototype.getAll = function() {
        return this.db.allDocs({ include_docs: true })
            .then(function(db) {
                return db.rows.map(function(row) {
                    return row.doc;
                });
            });
    };

    Store.prototype.get = function(id) {
        return this.db.get(id);
    };

    Store.prototype.save = function(item) {
        return item._id
            ? this.update(item)
            : this.add(item);
    };

    Store.prototype.add = function(item) {
        return this.db.post(item);
    };

    Store.prototype.update = function(item) {
        return this.db.get(item._id)
            .then(function(updatingItem) {
                this.extend(updatingItem, item);
                return this.db.put(updatingItem);
            }.bind(this));
    };

    Store.prototype.remove = function(id) {
        return this.db.get(id)
            .then(function(item) {
                return this.db.remove(item);
            }.bind(this));
    };

    Store.prototype.extend = function(target, source) {
        for(var key in source) {
            if(source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    };

    window.Store = Store;

}(PouchDB));