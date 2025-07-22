---
sidebar_position: 2
---

# Account Deployment

Q3x provides a seamless account deployment solution for MetaMask users on Starknet. This guide explains how account deployment works and what you need to know.

## How It Works

When a MetaMask user interacts with Q3x, we deploy an Argent contract on their behalf. This is because:

- Argent contracts support EIP-191 signatures, making them compatible with MetaMask
- The deployment is done through the Universal Deployer Contract (UDC)
- Users don't need to pay any deployment fees

![Add Transaction To Batch Overview](/img/metamask/deployment.png)

## Gas Fees

Both standard and multisig accounts can pay gas fees in two ways:

- ETH (default)
- STRK (via Paymaster)

:::tip
Using Paymaster with STRK can be more cost-effective, especially for multisig transactions where multiple signers are involved.
:::

## Deployment Process

1. User connects their MetaMask wallet
2. User sign an EIP712 sign in message
3. Q3x verify the signature
4. Q3x automatically deploys an Argent contract for them
5. The deployment is handled by our Starknet Deployer Address: `0x06bf5eacd01Eb1d586E60D0384dc37bDCC7ee6C41Be44013EAa12190f6369777`
6. No additional fees are required from the user

:::info
The deployment is completely free for users as Q3x covers the deployment costs through our Starknet Deployer Address.
:::

## Account Types

Q3x supports two types of accounts for MetaMask users:

1. **Standard Account**: A single-signer Argent account
2. **Multisig Account**: A multi-signer Argent account that requires multiple approvals for transactions

For more information about multisig accounts, see our [Multisig Account](/metamask/multisig) documentation.
