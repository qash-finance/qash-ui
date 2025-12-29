---
sidebar_position: 5
slug: /payroll
---

# Payrolls

Qash allows you to organize, manage, and pay your team members efficiently. This guide covers everything you need to know about creating and managing payrolls for your employees.

## Payroll Overview

Payroll in Qash enables you to set up automated monthly payments for your employees. The system generates invoices automatically and handles recurring payments based on the contract terms you define. Each payroll includes employee information, payment details, contract duration, and scheduled payment dates.

## Prerequisites

Before creating a payroll, you must have at least one employee added to your contact book

:::info Need to Add an Employee?
If you haven't added any employees yet, please refer to the [Employee Management](/employee) guide to learn how to add employees to your contact book before creating a payroll.
:::

## Creating a New Payroll

The payroll creation process consists of two main steps:

1. **Create Payroll** - Fill in all the required information
2. **Review Payroll** - Preview the invoice and confirm the details

![Create Payroll Page](/img/payroll/create-payroll.png)

The left section of the create payroll form contains the basic information required for the payroll:

#### Employee Selection

- Click on the **Employee** field to open the employee selection modal
- Choose an employee from your contact book
- The system will automatically populate:
  - Employee name
  - Wallet address
  - Preferred network
  - Preferred token

#### Duration

- Enter the contract duration as a number
- The duration determines how long the payroll will run
- Examples:
  - `12` months = 12 monthly payments
  - `1` year = 12 monthly payments
  - `6` months = 6 monthly payments

#### Monthly Amount

- Enter the monthly payment amount

#### Scheduled Pay Date

- Select the day of the month when payments should be made
- Payments will be scheduled for this day each month
- **Important**: Payrolls start from the next month after creation

:::warning Payment Start Date
Payrolls always start from the next month after creation. For example, if you create a payroll in January with pay day set to the 15th, the first payment will be scheduled for February 15th.
:::

#### Item Description

- Enter a description for the payroll (required)
- Examples: "Monthly Salary", "Contractor Payment", "Consulting Fee"

#### Note (Optional)

- Add any additional notes or comments

## Review and Confirmation

After clicking "Create now", you'll be taken to the review screen:

![Payroll Review and Preview Screen](/img/payroll/preview-payroll.png)

By confirming, you should see the created payroll on the payroll management page.

![Payroll Management Page](/img/payroll/payroll-management.png)

## Payroll Details

By clicking on the payroll item, companies can also view the payroll detail as shown below:

![Payroll Detail Page](/img/payroll/payroll-detail.png)

Companies can also preview the invoice by clicking on the invoice:

![Payroll Invoice Preview](/img/payroll/payroll-invoice-preview.png)

## Automatic Invoice Generation

Once a payroll has been created, the system automatically generates and sends an invoice to the employee via email **5 days before each scheduled payment date**. Companies do not need to take any action—the process is fully automated.

:::info Invoice Timing
Invoices are automatically generated and emailed to employees 5 days before the payment due date. This gives employees time to review and confirm their payment details before the payment is processed.
:::

## Employee View

When an invoice is generated, employees receive an email notification with a link to review and confirm their payment details. Here's the step-by-step process:

### Step 1: Receive Invoice Email

The employee will receive an email notification containing the invoice details:

![Review Invoice Email](/img/payroll/review-invoice-email.png)

### Step 2: Access the Invoice

1. Click the **`View Invoice`** button in the email
2. Employee will be redirected to the Qash login page
3. Log in using the employee company email address to access the invoice

![Employee Login](/img/payroll/employee-login.png)

<details>
<summary><strong>What happens if I use a different email address?</strong></summary>

If you try to log in with an email address that doesn't match the employee email associated with the invoice, you will see the following image:

![Wrong Email Login Error](/img/payroll/wrong-email.png)

</details>

### Step 3: Review and Update Information

Once logged in, employee can:

1. **Review the invoice details** including:

   - Payment amount
   - Payment date
   - Company information
   - Payment description

2. **Update necessary information** if needed:
   - Wallet address
   - Resident address
   - Preferred receiving network
   - Preferred receiving token

![Employee Review Invoice](/img/payroll/employee-review-invoice.png)

### Step 4: Confirm the Invoice

1. Review all information to ensure accuracy
2. Make any necessary updates to your payment details
3. Click the **`Confirm`** button to submit the invoice back to the company

![Confirm Invoice](/img/payroll/confirm-invoice.png)

Once confirmed, the invoice is sent to the company.
