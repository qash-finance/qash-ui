---
sidebar_position: 5
---

# Gift

Q3x's gift feature allows you to send digital gifts to anyone using secure, shareable links. Create gift notes with
tokens and share them with friends, family, or anyone you want to surprise with a digital gift.

## How It Works

The gift system creates secure, shareable links that contain digital assets (tokens). When someone opens the gift link,
they can claim the tokens directly to their wallet. The system uses cryptographic secrets to ensure only the person with
the link can claim the gift.

## Creating Gifts

### Setting Up Your Gift

1. **Access the Gift Feature**

   - Navigate to the Gift section in Q3x
   - Ensure your wallet is connected
   - You'll see the gift creation form on the left side

2. **Configure Gift Details**

   - **Select Token**: Choose from available tokens (QASH, ETH, etc.)
   - **Enter Amount**: Specify how much you want to gift
   - **Verify Balance**: Ensure you have sufficient tokens

3. **Generate Your Gift**
   - Click "Generate Link" to create the gift
   - Confirm the transaction details in the overview modal
   - Wait for the gift generation process to complete

## Gift Statistics Dashboard

### Overview Metrics

The right side of the interface shows your gift statistics:

- **Total Gift Value Sent**: Total dollar value of all gifts you've created
- **Gifts Opened**: Number of gifts that have been claimed by recipients

### Gift History

Below the statistics, you'll see a list of all your created gifts:

- **Gift ID**: Sequential numbering of your gifts
- **Token & Amount**: Shows the token icon and gifted amount
- **Status**: Indicates if the gift has been opened (claimed) or is still pending
- **Date/Time**: When the gift was created
- **Gift Link**: The shareable URL for each gift

## Sharing Your Gifts

### Gift Links

Each gift generates a unique link in this format:

```
https://qash.finance/gift/open-gift?code=SECRET_CODE
```

### Sharing Options

1. **Copy Link**: Click the "Copy link" button to copy the gift URL
2. **Direct Sharing**: Send the link via messaging apps, email, or social media
3. **Private Sharing**: Share only with intended recipients

### Security Features

- **Unique Secrets**: Each gift has a cryptographically secure secret
- **One-time Use**: Links can only be used once to claim the gift
- **Private Access**: Only people with the link can access the gift

## Gift Status Tracking

### Pending Gifts

- **Status**: Shows as unopened/pending
- **Link Color**: Blue background with active copy functionality
- **Action**: Recipients can still claim these gifts

### Opened Gifts

- **Status**: Marked as "Opened" with a badge
- **Link Color**: Gray background indicating completion
- **Action**: Copy function is disabled (gift already claimed)

## Opening Gifts (Recipient Experience)

### Accessing a Gift

1. **Receive Link**: Get the gift link from the sender
2. **Open Link**: Click or paste the link in a browser
3. **Connect Wallet**: Ensure your wallet is connected to Q3x
4. **Claim Gift**: Follow the prompts to receive the tokens

### What Happens When Opening

- The system verifies the gift link is valid
- Checks that the gift hasn't been claimed
- Transfers the tokens to your wallet
- Updates the gift status to "Opened"

## Important Notes

### Technical Details

- **Blockchain Transactions**: Gifts are recorded on the blockchain
- **Secret Generation**: Uses cryptographically secure random generation
- **Note System**: Leverages Miden's note-based architecture
- **24-Hour Cancellation**: Gifts can be cancelled within 24 hours

### Limitations

- **One-time Use**: Each gift link can only be used once
- **Token Requirements**: You must have sufficient tokens in your wallet
- **Network Fees**: Standard blockchain transaction fees apply
- **Recipient Requirements**: Recipients need a compatible wallet

### Privacy Features

- **No Public Records**: Gift contents are private
- **Secure Links**: Links contain encrypted information
- **Anonymous Gifting**: No personal information is required
- **Self-destructing**: Links become inactive after use

## Troubleshooting

### Common Issues

- **Insufficient Balance**: Ensure you have enough tokens before creating gifts
- **Link Not Working**: Verify the gift hasn't been claimed or expired
- **Transaction Failures**: Check your wallet connection and network status
- **Gift Not Showing**: Refresh the dashboard to see latest updates

### Getting Help

- Check your wallet connection status
- Verify you have sufficient token balance
- Ensure the gift link is correct and complete
- Contact support if technical issues persist

The gift feature in Q3x provides a secure, private, and user-friendly way to send digital gifts to anyone, making it
easy to share tokens and create memorable experiences for your recipients.
