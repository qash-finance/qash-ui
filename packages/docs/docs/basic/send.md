---
sidebar_position: 1
---

# Sending Token

The send token feature allows you to transfer tokens to other addresses. This guide will walk you through the process of sending tokens in Q3x.

## Selecting Token and Amount

1. **Token Selection**

   - Click on the token dropdown to view available tokens in your wallet
   - Select the token you wish to send
   - The current balance of the selected token will be displayed

![Token Selection Example](/img/send/token-selection.png)

2. **Amount Input**
   - Enter the amount you wish to send in the amount field
   - The USD equivalent will be automatically calculated and displayed
   - You can use the percentage button to send proportion of your balance

![Percentage Example](/img/send/percentage.png)

## Recipient Address

You have two options for specifying the recipient:

---

1. **Address Book Selection**

   - Click on the input
   - Select a saved contact from the list
   - The address will be automatically filled in

![Address Book Example](/img/send/address-book.png)

2. **Manual Address Entry**
   - Enter the recipient's address directly in the address field
   - The system will automatically validate the address format
   - Invalid addresses will be highlighted in red, and address that is not deployed will be mark as yellow

<div style={{display: 'flex', justifyContent: 'space-between', margin: '20px 0'}}>
  <div style={{width: '48%'}}>
    <img src="/img/send/not-deploy-address.png" alt="Percentage Input" style={{width: '100%'}} />
  </div>
  <div style={{width: '48%'}}>
    <img src="/img/send/invalid-address.png" alt="Amount Input" style={{width: '100%'}} />
  </div>
</div>

## Transaction Confirmation

Before sending:

- Review the transaction details including:
  - Token amount
  - USD equivalent
  - Recipient address
- Click "Send" to proceed with the transaction
- Complete any required authentication (2FA/3FA)
- Or add it to your [batch transaction](/batch_transaction) and execute in once

![Transaction Overview Example](/img/send/transaction-overview.png)

## Important Notes

- Always double-check the recipient address before sending
- Ensure you have sufficient balance to cover both the send amount and network **fees**
- Transactions cannot be reversed once confirmed on the blockchain
- For frequently used addresses, consider saving them to your for convenience
