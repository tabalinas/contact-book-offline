(function(global) {

    function Store() { }

    // TODO: replace with real data storage
    var contacts = [
        { _id: 1, firstName: "Artem", lastName: "Tabalin", phone: "+33 6 12 34 56 78" },
        { _id: 2, firstName: "Jack", lastName: "Husbur", phone: "+33 6 12 34 56 89" },
        { _id: 3, firstName: "Jane", lastName: "Christy", phone: "+33 6 12 34 56 90" }
    ];

    Store.prototype.getAll = function() {
        return contacts;
    };

    Store.prototype.get = function(id) {
        return contacts.filter(function(c) {
            return c._id === id;
        })[0];
    };

    Store.prototype.save = function(contact) {
        contacts.push(contact);
    };

    Store.prototype.remove = function(id) {
        contacts = contacts.filter(function(c) {
            return c._id !== id;
        });
    };

    global.Store = Store;


}(this));