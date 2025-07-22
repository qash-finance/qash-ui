---
sidebar_position: 4
---

# Receiving Token

The receive token feature in Q3x simplifies the process of receiving funds by generating a QR code and link that links directly to the send page. This guide will walk you through the process of creating and customizing your receive requests.

## Basic QR Code Generation

By default, the QR code contains:

- Your wallet address
- A direct link to the Q3x send interface
- No pre-filled token or amount information

![Basic QR Code](/img/receive/qr.png)

## Customizing Receive Request

You can enhance your receive request by specifying:

1. **Token Selection**

   - Choose the specific token you want to receive
   - The token will be pre-selected when the QR code is scanned

2. **Amount Setting**

   - Set a specific amount to receive
   - The amount field will be auto-populated for the sender

3. **Message Addition**
   - Add a note or description for the transaction
   - The message will be visible on the QR code

![Customized QR Code](/img/receive/customize.png)

### Customized QR code preview

![Customized QR Code Preview](/img/receive/customized-qr.png)

## Attaching Invoice

You can also attach PDF invoices to your receive requests:

- Click "Send Invoice" checkbox
- Select your PDF invoice file
- The invoice will be accessible to the sender when they scan the QR code or opened the link
- Senders can view and download the invoice from their send page
- Enter your email address, after sender do the payment you will receive an email notifications

![Customized QR Code Preview](/img/receive/add-invoice.png)

## Dynamic Updates

- The QR code updates automatically when you modify any parameters
- Changes are reflected instantly
- Senders always see the most current request details

## Sender's View

When someone opens your QR code link, they will see:

1. **Pre-filled Information**

   - Your wallet address automatically entered
   - Selected token (if specified)
   - Requested amount (if set)

2. **Invoice Section**
   - If an invoice was attached, it will be displayed in a dedicated section
   - Options to download the PDF invoice

![Sender's View](/img/receive/sender-view.png)

## Important Notes

- Senders will be directed to Q3x's send interface
- All transaction details are pre-filled to minimize errors
- Always verify the pre-filled information matches your requirements
