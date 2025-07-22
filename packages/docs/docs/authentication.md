---
sidebar_position: 2
---

# Authentication

Authentication in Q3x ensures secure access. This guide explains how our authentication system works and why it's essential for your security.

## Why Authentication Matters

:::info
Authentication is crucial in Q3x because it:

- Verifies your identity and ownership of accounts
- Protects your information from unauthorized access
- Prevents impersonation attempts
- Maintains a secure connection throughout your session

:::

## Authentication Methods Based On Connected Wallet

1. **MetaMask**

   - Connect your MetaMask wallet
   - Signing signin message
   - First-time users get need an account setup, check [metamask integration](/metamask) for more detail
   - Seamless interaction on Starknet

2. **Argent/Braavos**
   - No extra action needed, just signing message

![Authentication Methods](/img/authentication/signin.png)

## Authentication Flow

1. **Initial Connection**

   - Connect your preferred wallet
   - System verifies wallet compatibility
   - Prepares appropriate authentication method

2. **Message Signing**

   - You'll be prompted to sign a message
   - This proves your ownership of the wallet
   - No gas fees required for signing

3. **Account Setup (First-time MetaMask Users)**
   - System checks for existing Starknet account
   - If none exists, we need to deploy new account, deployment fee is covered by Q3x team
   - Links Ethereum identity to Starknet account

<!-- ![Authentication Flow](/img/auth/flow.png) -->

## Technical Implementation

<details>
<summary>Technical Details</summary>

- Uses EIP-712 standard for message signing
- Using Universal Deployer Contract (UDC) for account deployment for Metamask user
- Verifies signatures on server side

```typescript
// Example EIP-712 Message Structure
const domain = {
  name: "Q3x Authentication",
  version: "1",
  chainId: 1,
  verifyingContract: "0x...",
};

const types = {
  Authentication: [
    { name: "wallet", type: "address" },
    { name: "nonce", type: "string" },
  ],
};
```

</details>

## Important Notes

- Authentication is required for part of Q3x actions
- Multiple devices cant be authenticated simultaneously
- Always verify the authentication request source
