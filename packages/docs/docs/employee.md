---
sidebar_position: 4
slug: /employee
---

# Employees

Qash allows you to organize, manage, and pay your team members efficiently. This guide covers everything you need to know about managing employees.

## Employee Overview

The employee management interface provides a comprehensive view of all your team members. You can see employees organized by groups, view their contact information, wallet addresses, and preferred payment tokens.

![Employee Overview](/img/employee/employee-overview.png)

## Adding Employees

![Create Employee](/img/employee/create-employee.png)

### Required Information

When adding a new employee, you'll need to provide:

#### Basic Information

- **Name** - Employee's full name (required, 1-100 characters)
  - Can only contain letters, numbers, spaces, hyphens, and underscores
  - Must be unique within the selected group
- **Email** - Employee's email address (optional)
  - Must be a valid email format if provided
  - Maximum 255 characters
- **Wallet Address** - Employee's Miden wallet address (required)
  - Must start with `mtst1`
  - Must be unique within the selected group
  - Minimum 10 characters

#### Payment Configuration

- **Network** - Select the blockchain network (default: Miden Testnet)
- **Token** - Choose the preferred token for payments (default: QASH)
- **Group** - Assign the employee to a group (required)

## Employee Groups

Employee groups help you organize your team members into categories such as departments, teams, or any custom classification that fits your business needs.

### Group Features

Each group can be customized with:

- **Name** - A descriptive name for the group
- **Shape** - Visual identifier (Circle, Square, Diamond, Triangle)
- **Color** - Choose from Blue, Purple, Pink, Orange, or Green
