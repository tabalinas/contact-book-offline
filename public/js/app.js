(function(Store) {

    var CONTACT_ID_ATTR_NAME = "data-contractid";
    var CONTACT_REMOVE_CONFIRM = "Are you sure?";
    var NO_CONTACTS_TEXT = "No contacts";

    function ContactBook() {
        this.init();
        this.refresh();
    }

    ContactBook.prototype.init = function() {
        this.initStore();
        this.initElements();
        this.initItemTemplate();
        this.attachHandlers();
    };

    ContactBook.prototype.initStore = function() {
        this.store = new Store("contacts");
    };

    ContactBook.prototype.initElements = function() {
        this.contactList = document.getElementById("contactList");

        this.contactDetailsForm = document.getElementById("contactDetails");
        this.contactIdField = document.getElementById("contactid");
        this.firstNameField = document.getElementById("firstname");
        this.lastNameField = document.getElementById("lastname");
        this.phoneField = document.getElementById("phone");

        this.addContactButton = document.getElementById("addContact");
        this.saveContactButton = document.getElementById("saveContact");
        this.cancelEditButton = document.getElementById("cancelEdit");
    };

    ContactBook.prototype.initItemTemplate = function() {
        var contactListItem = this.contactList.querySelector("li");
        this.contactList.removeChild(contactListItem);
        this._contactTemplate = contactListItem;
    };

    ContactBook.prototype.attachHandlers = function() {
        this.contactDetailsForm.addEventListener("submit", function(event) {
            event.preventDefault();
        });

        this.addContactButton.addEventListener("click", this.addContact.bind(this));
        this.saveContactButton.addEventListener("click", this.saveContact.bind(this));
        this.cancelEditButton.addEventListener("click", this.cancelEdit.bind(this));

        this.contactList.addEventListener("click", ((function(event) {
            var getContractId = function() {
                return event.target.parentElement.getAttribute(CONTACT_ID_ATTR_NAME);
            };

            if(event.target.className === "contact-edit") {
                this.editContact(getContractId());
            }

            if(event.target.className === "contact-remove") {
                this.removeContact(getContractId());
            }
        }).bind(this)));
    };

    ContactBook.prototype.refresh = function() {
        this.renderContactList();
    };

    ContactBook.prototype.renderContactList = function() {
        this.store.getAll().then(function(contacts) {
            this.contactList.innerHTML = "";
            this.contactList.appendChild(this.createContactList(contacts));
        }.bind(this));
    };

    ContactBook.prototype.createContactList = function(contacts) {
        if(!contacts.length)
            return this.createNoDataItem();

        var result = document.createDocumentFragment();

        contacts.forEach(function(contact) {
            result.appendChild(this.createContact(contact))
        }.bind(this));

        return result;
    };

    ContactBook.prototype.createNoDataItem = function() {
        var result = document.createElement("div");
        result.className = "contact-list-empty";
        result.textContent = NO_CONTACTS_TEXT;
        return result;
    };

    ContactBook.prototype.createContact = function(contact) {
        var result = this._contactTemplate.cloneNode(true);
        result.setAttribute(CONTACT_ID_ATTR_NAME, contact._id);
        result.querySelector(".contact-name").innerText = contact.firstName + " " + contact.lastName;
        result.querySelector(".contact-phone").innerText = contact.phone;
        return result;
    };

    ContactBook.prototype.addContact = function() {
        this.setContactDetails({});
        this.toggleContactForm(true);
        this.refresh();
    };

    ContactBook.prototype.editContact = function(contactId) {
        this.store.get(contactId).then(function(contact) {
            this.setContactDetails(contact);
            this.toggleContactForm(true);
        }.bind(this));
    };

    ContactBook.prototype.saveContact = function() {
        var contact = this.getContactDetails();

        this.store.save(contact).then(function() {
            this.toggleContactForm(false);
            this.refresh();
        }.bind(this));
    };

    ContactBook.prototype.removeContact = function(contactId) {
        if(!window.confirm(CONTACT_REMOVE_CONFIRM))
            return;

        this.store.remove(contactId).then(function() {
            this.refresh();
        }.bind(this));
    };

    ContactBook.prototype.cancelEdit = function() {
        this.toggleContactForm(false);
    };

    ContactBook.prototype.getContactDetails = function() {
        return {
            _id: this.contactIdField.value,
            firstName: this.firstNameField.value,
            lastName: this.lastNameField.value,
            phone: this.phoneField.value
        };
    };

    ContactBook.prototype.setContactDetails = function(contactDetails) {
        this.contactIdField.value = contactDetails._id || "";
        this.firstNameField.value = contactDetails.firstName || "";
        this.lastNameField.value = contactDetails.lastName || "";
        this.phoneField.value = contactDetails.phone || "";
    };

    ContactBook.prototype.toggleContactForm = function(isShowing) {
        this.contactDetailsForm.style.display = isShowing ? "" : "none";
    };


    window.ContactBook = ContactBook;

}(Store));