---
sidebar_position: 3
---

# Multisig Account

Q3x provides a multisig account system that enhances security through multiple signature requirements. This guide covers the multisig account creation and transaction workflow.

## Account Creation

The multisig system begins with a streamlined account creation process:

1. Users provide the addresses as signer and set a threshold
2. Q3x validate all addresses
3. Deploy an Argent multisig contract with the provided addresses and threshold
4. Once deployed, the multisig account gains access to part of Q3X features

![Add Transaction To Batch Overview](/img/multisig/create.png)

:::info
Currently, multisig accounts are only supported for MetaMask users.
:::

## Account Management

![Add Transaction To Batch Overview](/img/multisig/setting.png)

After deployment, you can manage your multisig account by:

### Adding Signers

- Add new signers to the multisig account
- Requires approval from existing signers based on the current threshold

### Removing Signers

- Remove existing signers from the multisig account
- Requires approval from remaining signers based on the current threshold

### Replacing Signers

- Replace an existing signer with a new address
- Requires approval from other signers based on the current threshold

### Updating Threshold

- Change the number of required signatures for transactions
- Requires approval from existing signers based on the current threshold

:::tip
All management operations follow the same approval process as regular transactions, requiring the current threshold number of approvals to execute.
:::

## Account Switching

Clicked on "Manage Account" button to open the following pop up:

![Add Transaction To Batch Overview](/img/multisig/switching.png)

Q3x provides seamless switching between different multisig accounts:

- Switch between multiple multisig accounts without changing your MetaMask extension
- All accounts remain connected to your MetaMask wallet
- Quick access to different multisig configurations
- Maintain separate transaction histories for each account

## Import/Export

Manage your multisig accounts across different devices:

### Export Account

- Export your multisig account

### Import Account

- Import previously exported multisig accounts
- Restore your account configuration on different devices
- Quick setup of existing multisig accounts

![Add Transaction To Batch Overview](/img/multisig/import.png)

## Gas Fees

Multisig accounts can pay gas fees in two ways:

- ETH (default)
- ERC20 (via Paymaster)

## Transaction Workflow

### Proposing Transactions

Any authorized signer can propose transactions, including:

- Token transfers
- Swaps
- Batch operations
- AI-constructed transactions
- Account management operations (add/remove/replace signers, update threshold)

### Approval Process

1. A signer proposes a transaction
2. All designated signers receive notifications
3. Signers review and approve/reject the transaction
4. Once the threshold number of approvals is reached, the transaction is executed
