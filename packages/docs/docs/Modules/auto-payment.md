---
sidebar_position: 2
---

# Auto Payment Module

:::note Premium Feature
Auto payment functionality is available as part of our [Premium](/premium) subscription.
:::

:::info Payment Execution Time
We perform all the scheduled payment at 11pm everyday (GMT +7)
:::

The Auto Payment module enables teams to automate recurring payments with flexible configuration options. This module is particularly useful for managing regular expenses such as salaries, vendor payments, or subscription fees. This feature is based on ERC20 `approve` function.

## Creating Auto Payment

1. Navigate to Modules section
2. Select "Auto Payment"
3. Click "New Event"
4. Fill in required parameters
5. Review and confirm

![Dashboard Overview](/img/auto-payment/create.png)

### Available configuration:

| Setting               | Description                             | Example                                             |
| --------------------- | --------------------------------------- | --------------------------------------------------- |
| Recipient\*           | Payment destination address             | 0x1234...5678                                       |
| Token\*               | Asset to be transferred                 | **Only** supporting ETH, USDC, USDT, STRK           |
| Amount\*              | Payment amount                          | 1000 USDT                                           |
| Frequency\*           | Payment schedule                        | Support One Time, Daily, Weekly, Monthly and Yearly |
| Start Date\*          | When payments begin                     | 2024-03-01                                          |
| Attachment (Optional) | Attachment file related to this payment | Invoice                                             |
| Message (Optional)    | Description for this payment            | Salary                                              |

### Using AI Assistant (COMING SOON)

Simply tell the AI assistant what you want to set up:

```
"Set up monthly payment of 1000 USDT to the finance team starting next month"
```

The AI will:

1. Parse your request
2. Fetch addresses from your address book
3. Prepare the configuration
4. Show you a preview
5. Set up the payment schedule upon confirmation

:::tip Coming Soon
Using AI assistant is coming soon! Stay tuned!
:::

## Monitoring and Management

### Dashboard View

- View all scheduled payments
- Track payment history

![Dashboard Overview](/img/auto-payment/overview.png)

### Notifications (COMING SOON)

- Payment execution alerts to your phone
- Failed transaction notifications
- Low balance approval warnings
- Google calender integration

:::tip Coming Soon
Notification feature is coming soon! Stay tuned!
:::

## Allowance Dashboard

The Allowance Dashboard provides a comprehensive view of all token allowances for auto payments. This helps you manage and monitor the approved amounts for each token used in your automated payments.

### Viewing Allowances

1. Navigate to the Auto Payment module
2. Click on "Allowance Dashboard" tab
3. View the following information for each token:
   - Required amount for next payment
   - Current approved allowance
   - Status (Sufficient/Insufficient)

![Allowance Dashboard](/img/auto-payment/allowance.png)

### Updating Allowances

You can update the allowance for any token directly from the dashboard:

1. Find the token you want to update
2. Enter the new allowance amount
3. Confirm the transaction from your wallet extension

![Allowance Dashboard](/img/auto-payment/update-allowance.png)

:::note

- The allowance should be sufficient to cover all future scheduled payments
- You can set a higher allowance to avoid frequent updates
- The system will show a warning if the allowance is insufficient for upcoming payments
- The allowance you set here is increasing the allowance, we are using `increaseAllowance` function from contract

:::

### Best Practices

1. **Regular Monitoring**

   - Check the allowance dashboard weekly (We will carry out notification system soon!)
   - Ensure allowances cover all scheduled payments
   - Update allowances before they run low

2. **Security Considerations**
   - Only approve necessary amounts
   - Review allowances regularly
   - Revoke unnecessary approvals

## Managing Existing Auto Payments

You can manage your scheduled payments with the following actions:

### Skip Next Payment

Temporarily skip the next scheduled payment while keeping future payments intact.

1. Find the payment schedule in the dashboard
2. Click the "Actions" menu
3. Select "Delete this payment only"
4. Confirm the action from your wallet extension

![Skip Payment](/img/auto-payment/skip.png)

:::note
The skipped payment will be automatically rescheduled for the next cycle.
:::

### Force Execution Upcoming Payment

You have the flexibility of force **executing** the upcoming payment without the need to wait until the scheduled time.

1. Find the payment schedule in the dashboard
2. Click the "Actions" menu
3. Select "Send Now"
4. Confirm the action from your wallet extension

![Skip Payment](/img/auto-payment/skip.png)

:::note
The force executed payment will be automatically rescheduled for the next cycle.
:::

### Delete All Future Payments

Stop all future payments for a specific schedule.

1. Find the payment schedule in the dashboard
2. Click the "Actions" menu
3. Select "Delete all future payments"
4. Confirm the action from your wallet extension

![Skip Payment](/img/auto-payment/skip.png)

:::caution
This action cannot be undone. All future payments will be permanently deleted.
:::

### Update Payment Schedule

Modify the details of an existing payment schedule.

1. Find the payment schedule in the dashboard
2. Click the "Actions" menu
3. Select "Edit payment details"
4. Update any of the following:
   - Recipient address
   - Token selection
   - Payment amount
   - Frequency
   - Start date
   - Attachment
   - Message
5. Save changes

![Skip Payment](/img/auto-payment/edit.png)

:::note
Changes will apply to all future payments in the schedule.
:::
