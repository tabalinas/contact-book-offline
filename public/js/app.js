(function() {

    var CONTACT_ID_ATTR_NAME = "data-contractid";
    var CONTACT_REMOVE_CONFIRM = "Are you sure?";
    var NO_CONTACTS_TEXT = "No contacts";

    function ContactBook(storeClass, remote) {
        this.store = new storeClass("contacts", remote, function() {
            this.refresh();
        }.bind(this));

        this.init();
        this.refresh();
        this.toggleContactFormEditing(false);
    }

    ContactBook.prototype.init = function() {
        this.initElements();
        this.initItemTemplate();
        this.attachHandlers();
    };

    ContactBook.prototype.initElements = function() {
        this.contactList = document.getElementById("contactList");

        this.contactDetailsForm = document.getElementById("contactDetails");
        this.contactIdField = document.getElementById("contactid");
        this.firstNameField = document.getElementById("firstname");
        this.lastNameField = document.getElementById("lastname");
        this.phoneField = document.getElementById("phone");

        this.addContactButton = document.getElementById("addContact");
        this.editContactButton = document.getElementById("editContact");
        this.removeContactButton = document.getElementById("removeContact");
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
        }.bind(this));

        this.addContactButton.addEventListener("click", this.addContact.bind(this));
        this.editContactButton.addEventListener("click", this.editContact.bind(this));
        this.removeContactButton.addEventListener("click", this.removeContact.bind(this));
        this.saveContactButton.addEventListener("click", this.saveContact.bind(this));
        this.cancelEditButton.addEventListener("click", this.cancelEdit.bind(this));
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
        var result = document.createElement("li");
        result.className = "contact-list-empty";
        result.textContent = NO_CONTACTS_TEXT;
        return result;
    };

    ContactBook.prototype.createContact = function(contact) {
        var result = this._contactTemplate.cloneNode(true);
        result.setAttribute(CONTACT_ID_ATTR_NAME, contact._id);
        result.querySelector(".contact-name").innerText = contact.firstName + " " + contact.lastName;
        result.querySelector(".contact-phone").innerText = contact.phone;
        result.addEventListener("click", this.showContact.bind(this));
        return result;
    };

    ContactBook.prototype.showContact = function(event) {
        var contactId = event.currentTarget.getAttribute(CONTACT_ID_ATTR_NAME);

        this.store.get(contactId).then(function(contact) {
            this.setContactDetails(contact);
            this.toggleContactFormEditing(false);
        }.bind(this))
    };

    ContactBook.prototype.addContact = function() {
        this.setContactDetails({ firstName: "Name" });
        this.toggleContactFormEditing(true);
    };

    ContactBook.prototype.editContact = function() {
        var contactId = this.getContactId();

        this.store.get(this.getContactId()).then(function(contact) {
            this.setContactDetails(contact);
            this.toggleContactFormEditing(true);
        }.bind(this));
    };

    ContactBook.prototype.saveContact = function() {
        var contact = this.getContactDetails();

        this.store.save(contact).then(function() {
            this.setContactDetails({});
            this.toggleContactFormEditing(false);
            this.refresh();
        }.bind(this));
    };

    ContactBook.prototype.removeContact = function() {
        if(!window.confirm(CONTACT_REMOVE_CONFIRM))
            return;

        var contactId = this.getContactId();

        this.store.remove(contactId).then(function() {
            this.setContactDetails({});
            this.toggleContactFormEditing(false);
            this.refresh();
        }.bind(this));
    };

    ContactBook.prototype.cancelEdit = function() {
        this.setContactDetails({});
        this.toggleContactFormEditing(false);
    };

    ContactBook.prototype.getContactDetails = function() {
        return {
            _id: this.getContactId(),
            firstName: this.firstNameField.value,
            lastName: this.lastNameField.value,
            phone: this.phoneField.value
        };
    };

    ContactBook.prototype.getContactId = function() {
        return this.contactIdField.value;
    };

    ContactBook.prototype.setContactDetails = function(contactDetails) {
        this.contactIdField.value = contactDetails._id || "";
        this.firstNameField.value = contactDetails.firstName || "";
        this.lastNameField.value = contactDetails.lastName || "";
        this.phoneField.value = contactDetails.phone || "";
    };

    ContactBook.prototype.toggleContactFormEditing = function(isEditing) {
        var isContactSelected = !this.getContactId();

        this.toggleFade(this.contactDetailsForm, !isEditing && isContactSelected);

        this.toggleElement(this.editContactButton, !isEditing && !isContactSelected);
        this.toggleElement(this.removeContactButton, !isEditing && !isContactSelected);

        this.toggleElement(this.addContactButton, !isEditing);
        this.toggleElement(this.saveContactButton, isEditing);
        this.toggleElement(this.cancelEditButton, isEditing);

        this.toggleDisabled(this.firstNameField, !isEditing);
        this.toggleDisabled(this.lastNameField, !isEditing);
        this.toggleDisabled(this.phoneField, !isEditing);

        this.firstNameField.focus();
        this.firstNameField.setSelectionRange(0, this.firstNameField.value.length);
    };

    ContactBook.prototype.toggleElement = function(element, isShown) {
        element.style.display = isShown ? "block" : "none";
    };

    ContactBook.prototype.toggleFade = function(element, isFade) {
        element.style.opacity = isFade ? .5 : 1;
    };

    ContactBook.prototype.toggleDisabled = function(element, isDisabled) {
        if(isDisabled) {
            element.setAttribute("disabled", "");
        } else {
            element.removeAttribute("disabled");
        }
    };

    window.ContactBook = ContactBook;

}());