---
sidebar_position: 7
---

# Cancel Payment

Q3x's cancel payment feature allows you to recall or cancel pending transactions and gift notes before they are claimed
by recipients. This feature provides a safety mechanism for payments that haven't been processed yet, giving you control
over your funds.

## How It Works

The cancel payment system works with two types of cancellable items:

1. **Transaction Notes**: Regular payments that can be cancelled
2. **Gift Notes**: Gift payments that can be recalled before claiming

Each item has a specific time window during which it can be cancelled, providing a grace period for you to change your
mind or correct mistakes.

## Dashboard Overview

### Status Cards

The top section displays key metrics:

- **Next Cancel Payment**: Countdown timer showing when the next payment becomes cancellable
- **Waiting for Cancel Payment**: Number of payments that will become cancellable soon
- **Cancelled**: Total count of successfully cancelled payments

### Next Cancel Payment Timer

- **Visual Countdown**: Large countdown display showing hours, minutes, and seconds
- **Real-time Updates**: Updates every second to show accurate timing
- **Automatic Enable**: Cancel buttons become active when the timer reaches zero

## Ready to Cancel Section

### Current Cancellable Payments

This section shows payments that are immediately available for cancellation:

- **Amount**: Token amount and type with visual indicators
- **To**: Recipient address (shows "-" for gift notes)
- **Date/Time**: When the payment was created
- **Action**: Cancel button (enabled when ready)

### Payment Types

- **Regular Transactions**: Show recipient addresses
- **Gift Notes**: Marked with "Gift" badge and no recipient display
- **Token Support**: Works with QASH, ETH, and other supported tokens

### Batch Cancellation

- **Select Multiple**: Use checkboxes to select multiple payments
- **Select All**: Check all payments at once
- **Cancel Selection**: Clear selected items without cancelling
- **Cancel All Selected**: Process multiple cancellations simultaneously

## Upcoming Cancellations Section

### Future Cancellable Payments

This section shows payments that will become cancellable later:

- **Amount**: Token amount and type
- **To**: Recipient information
- **Date/Time**: Creation timestamp
- **Recall in**: When the payment becomes cancellable
- **Action**: Cancel button (disabled until ready)

### Timing Information

- **Scheduled Cancellation**: Each payment has a specific cancellation time
- **Countdown Display**: Shows when each payment becomes available
- **Automatic Enable**: Cancel buttons activate automatically at the right time

## Cancellation Process

### Individual Cancellation

1. **Review Payment**: Check amount, recipient, and timing
2. **Click Cancel**: Press the cancel button when enabled
3. **Confirm Action**: Review the cancellation details
4. **Process Transaction**: System submits the cancellation to the blockchain
5. **View Result**: See transaction confirmation with explorer link

### Batch Cancellation

1. **Select Payments**: Check multiple payments you want to cancel
2. **Review Selection**: Verify all selected items
3. **Click "Cancel all selected"**: Process multiple cancellations
4. **Wait for Completion**: System processes each cancellation
5. **View Results**: See success message and updated counts

## Payment Types and Handling

### Transaction Notes

- **Regular Payments**: Standard transfers to specific addresses
- **Recipient Display**: Shows the destination address
- **Direct Cancellation**: Can be cancelled through standard note consumption

### Gift Notes

- **Gift Payments**: Tokens sent via gift links
- **No Recipient**: Shows "-" since gifts don't have specific recipients
- **Secret-based**: Cancelled using the original gift secret
- **Special Handling**: Requires gift note recreation and consumption

## Security and Limitations

### Cancellation Windows

- **Time-based**: Each payment has a specific cancellation period
- **Automatic Enable**: Cancel buttons activate at the right time
- **No Early Cancellation**: Cannot cancel before the scheduled time

### Transaction Requirements

- **Wallet Connection**: Must be connected to your wallet
- **Sufficient Balance**: Need tokens to cover cancellation fees
- **Network Conditions**: Subject to blockchain network status

### What Cannot Be Cancelled

- **Already Claimed**: Payments that recipients have already received
- **Expired Notes**: Notes that have passed their cancellation window
- **Failed Transactions**: Payments that failed to process

## Best Practices

### When to Use Cancel Payment

1. **Mistake Correction**: Wrong amount or recipient
2. **Timing Issues**: Need to delay or modify payment
3. **Security Concerns**: Unauthorized or suspicious payments
4. **Planning Changes**: Financial situation has changed

## Important Notes

### Limitations

- **Time Windows**: Cannot cancel outside scheduled periods
- **One-time Use**: Each payment can only be cancelled once
- **Network Dependencies**: Subject to blockchain network conditions
- **Recipient Actions**: Cannot cancel if recipient has already claimed

### Privacy Features

- **Private Cancellations**: Cancellation details are private
- **No Recipient Notification**: Recipients aren't notified of cancellations
- **Secure Processing**: All cancellations use secure cryptographic methods

## Troubleshooting

### Common Issues

- **Cancel Button Disabled**: Payment hasn't reached cancellation time yet
- **Transaction Failed**: Check wallet connection and network status
- **Payment Not Showing**: Refresh the dashboard to see latest updates
- **Batch Cancellation Error**: Ensure all selected payments are valid

### Getting Help

- Check your wallet connection status
- Verify the payment is within the cancellation window
- Ensure you have sufficient balance for transaction fees
- Contact support if technical issues persist

The cancel payment feature in Q3x provides essential control over your pending transactions, allowing you to recover
funds and correct mistakes before payments are finalized.
