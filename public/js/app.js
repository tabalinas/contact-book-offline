(function(global, Store) {

    var CONTACT_ID_ATTR_NAME = "data-contractid";

    function ContactBook() {
        this.init();
        this.render();
    }

    ContactBook.prototype.init = function() {
        this.initStore();
        this.initElements();
        this.initItemTemplate();
        this.attachHandlers();
    };

    ContactBook.prototype.initStore = function() {
        this.store = new Store();
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
        var contactListItem = this.contactList.firstChild;
        this.contactList.removeChild(contactListItem);
        this._contactTemplate = contactListItem;
    };

    ContactBook.prototype.attachHandlers = function() {
        this.addContactButton.addEventListener("click", this.addContact.bind(this));
        this.saveContactButton.addEventListener("click", this.saveContact.bind(this));
        this.cancelEditButton.addEventListener("click", this.cancelEdit.bind(this));

        this.contactList.addEventListener("click", ((function(event) {
            var getContractId = function() {
                var contactIdAttr = event.target.parentElement.getAttribute(CONTACT_ID_ATTR_NAME);
                return parseInt(contactIdAttr, 10);
            };

            if(event.target.className === "contact-edit") {
                this.editContact(getContractId());
            }

            if(event.target.className === "contact-remove") {
                this.removeContact(getContractId());
            }
        }).bind(this)));
    };

    ContactBook.prototype.render = function() {
        this.renderContactList();
    };

    ContactBook.prototype.renderContactList = function() {
        var elements = document.createDocumentFragment();
        var contacts = this.store.getAll();

        contacts.forEach((function(contact) {
            elements.appendChild(this.createContact(contact))
        }).bind(this));

        this.contactList.innerHTML = "";
        this.contactList.appendChild(elements);
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
    };

    ContactBook.prototype.editContact = function(contactId) {
        this.setContactDetails(this.store.get(contactId));
        this.toggleContactForm(true);
    };

    ContactBook.prototype.saveContact = function() {
        var contact = this.getContactDetails();
        this.store.save(contact);
        this.toggleContactForm(false);
    };

    ContactBook.prototype.removeContact = function(contactId) {
        this.store.remove(contactId);
    };

    ContactBook.prototype.cancelEdit = function() {
        this.toggleContactForm(false);
    };

    ContactBook.prototype.getContactDetails = function() {
        return {
            _id: parseInt(this.contactIdField.val() || "0", 10),
            firstName: this.firstNameField.val(),
            lastName: this.lastNameField.val(),
            phone: this.phoneField.val()
        };
    };

    ContactBook.prototype.setContactDetails = function(contactDetails) {
        this.contactIdField.val(contactDetails._id || 0);
        this.firstNameField.val(contactDetails.firstName);
        this.lastNameField.val(contactDetails.lastName);
        this.phoneField.val(contactDetails.phone);
    };

    ContactBook.prototype.toggleContactForm = function(isShowing) {
        this.contactDetailsForm.style.display = isShowing ? "" : "none";
    };


    global.ContactBook = ContactBook;

}(this, Store));