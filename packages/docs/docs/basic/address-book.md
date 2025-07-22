---
sidebar_position: 3
---

# Address Book

The address book feature in Q3x simplifies the management of Starknet addresses, providing a user-friendly experience. It allows you to interact with addresses using recognizable names instead of long hexadecimal strings, enhancing security and efficiency while reducing the risk of errors.

## Managing Address Book

### Adding New Contacts

1. **Add Contact**
   - Click the "New Address" button
   - Enter a memorable name for the contact
   - Input the Starknet address
   - The system automatically validates the address format and check if the address is deployed, if not, a warning message is show
   - Click "Save" to add the contact

![Add Contact Example](/img/address-book/adding.png)

### Editing Contacts

1. **Edit Existing Contact**
   - Click on the contact you wish to edit
   - Modify either the contact name or address
   - The system validates any changes
   - Click "Save Address" to update the contact

![Edit Contact Example](/img/address-book/edit.png)

### Removing Contacts

1. **Delete Contact**
   - Click the delete icon next to the contact
   - Confirm the deletion in the prompt
   - The contact will be removed from your address book

![Delete Contact Example](/img/address-book/delete.png)

## Import and Export

The import and export functionality is essential for managing your address book efficiently. It allows you to:

- Backup your contacts
- Transfer contacts between different Q3x accounts
- Share addresses with team members
- Restore your address book if needed
- Manage large contact lists more effectively

### Importing Contacts

1. **Import from CSV**
   - Click the "Import" button
   - Select your CSV file
   - The system performs validation checks:
     - Verifies Starknet address format
     - Checks for duplicate entries
     - Validates file structure
   - Review and confirm the import

![Import Example](/img/address-book/import.png)

:::info
When importing contacts, if there are any duplicate names in your address book:

- The system will automatically rename the new contact by appending a number
- You'll see a list of renamed contacts
- You can choose to:
  - Keep the auto-generated name
  - Rename the contact to something else
  - Remove importing that contact

![Duplicated Example](/img/address-book/duplicated.png)

:::

### Exporting Contacts

1. **Export to CSV**
   - Click the "Export" button
   - Choose the contacts to export or one click selecting all
   - A CSV file will be generated containing:
     - Contact names
     - Starknet addresses
   - Save the file for backup or transfer

![Export Example](/img/address-book/export.png)

## Using Address Book

The address book integrates with other Q3x features:

- Quick selection in [send transactions](/basic/send)
- Recipient selection in [recurring payment](/recurring)
- Using saved contacts in [AI assistant](/agent)

## Important Notes

- Always verify addresses before saving
- Keep your address book updated
- Regular backups are recommended
- Use descriptive names for easy identification
- The system validates all Starknet addresses automatically
