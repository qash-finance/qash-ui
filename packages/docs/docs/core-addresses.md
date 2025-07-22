---
sidebar_position: 7
---

# Core Addresses

Q3x utilizes several core contracts and addresses on Starknet Mainnet for various essential functions. Below is the complete list of core addresses with their purposes and details.

| Address Name                  | Purpose                                                  | Contract Address                                                     |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| Auto Payment Contract         | Handles automated payment processing                     | `0x7d5f59f22e1ae2b8964a93a259fb6ad0cb3ed9d61d30751998e9b51fd09e57e`  |
| Executor Address              | Aggregates auto payments and executes batch transactions | `0x06bf5eacd01Eb1d586E60D0384dc37bDCC7ee6C41Be44013EAa12190f6369777` |
| Subscription Payment Token    | Token used for subscription payments (USDT)              | `0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8`  |
| Subscription Receiver Address | Receives subscription payments                           | `0x0135353f55784cb5f1c1c7d2ec3f5d4dab42eff301834a9d8588550ae7a33ed4` |
| Starknet Deployer Address     | Deploys accounts for MetaMask users                      | `0x06bf5eacd01Eb1d586E60D0384dc37bDCC7ee6C41Be44013EAa12190f6369777` |

:::info
All addresses are on Starknet Mainnet
:::

## Address Descriptions

### Auto Payment Contract

The Auto Payment Contract is responsible for managing and processing automated payments within the Q3x system. It handles the execution of scheduled payments.

### Executor Address

The Executor Address is a critical component that:

- Aggregates multiple auto payments
- Executes transactions in batches

### Subscription Payment Token

This is the token address used for all subscription payments within Q3x. Currently, USDT is used as the primary payment token for subscriptions.

### Subscription Receiver Address

This address receives all subscription payments from users.

### Starknet Deployer Address

The Starknet Deployer Address is specifically used to:

- Deploy new accounts for MetaMask users
- Handle account creation and initialization
- Manage account deployment transactions
