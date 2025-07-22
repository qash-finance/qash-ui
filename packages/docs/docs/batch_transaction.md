---
sidebar_position: 3
---

# Batch Transactions

Q3x's batch transaction system leverages Starknet's native capability to execute multiple transactions at once, allowing you to bundle various operations into a single transaction. This feature significantly reduces gas costs and saved time on doing multiple 2FA/3FA form wallet.

## Adding Transactions to Batch

You can add various operations to a batch:

1. **Token Transfers**
   - When sending tokens, click "Add to Batch" instead of immediate execution
   - Multiple transfers can be bundled together

![Add Transaction To Batch Overview](/img/batch/add-send-to-batch.png)

2. **Token Swaps**
   - Add swap operations to your batch

![Add Transaction To Batch Overview](/img/batch/add-swap-to-batch.png)

3. **Transactions On Any Other Protocol**

:::tip 🚀 Coming Soon
We will be working on integrating more protocols into our batch transaction system by using our [connector sdk](/connector)! Soon you'll be able to:

- Bundle transactions across different protocols

Stay tuned for updates!
:::

## Managing Batch Transactions

The batch transaction overview provides a comprehensive interface where you can:

1. **Review Transactions**

   - View all pending transactions in the batch
   - Check pending transaction detail
   - Verify amounts
   - Confirm recipient addresses

2. **Edit Batch**
   - Remove specific transactions

![Batch Management](/img/batch/overview.png)

## Executing Batch

When ready to execute your batch:

1. Verify all transaction details
2. Click "Confirm & Sign" to process all transactions
3. Complete the authentication process (2FA/3FA)

:::info
Batching transactions can significantly saved your time compared to executing them individually.
:::

## Important Notes

- Transactions are executed in the order they were added
- All transactions in a batch must succeed for the batch to be processed
- You can continue adding transactions until you're ready to execute
