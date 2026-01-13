"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

interface Transaction {
  id: string;
  date: string;
  name: string;
  email: string;
  amount: string;
  currency: string;
  type: "incoming" | "outgoing";
  displayAmount: string;
}

interface Account {
  id: string;
  name: string;
  percentage: number;
  balance: string;
  color: string;
}

const TransactionHistory = () => {
  const [timePeriod, setTimePeriod] = useState<"year" | "month" | "week">("year");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sample transaction data
  const transactions: Transaction[] = [
    {
      id: "1",
      date: "May 20, 2025",
      name: "Matthew Leblanc",
      email: "georgia.young@example.com",
      amount: "+42,3454,000",
      currency: "42,3454 USDC",
      type: "incoming",
      displayAmount: "+$42,3454,000",
    },
    {
      id: "2",
      date: "October 30, 2025",
      name: "Cameron Williamson",
      email: "jessica.hanson@example.com",
      amount: "+$42,3454,000",
      currency: "42,3454 USDC",
      type: "incoming",
      displayAmount: "+$42,3454,000",
    },
    {
      id: "3",
      date: "October 24, 2025",
      name: "Bessie Cooper",
      email: "bill.sanders@example.com",
      amount: "- $1,3454,000",
      currency: "-1,3454 USDT",
      type: "outgoing",
      displayAmount: "- $1,3454,000",
    },
    {
      id: "4",
      date: "August 7, 2025",
      name: "Ronald Richards",
      email: "alma.lawson@example.com",
      amount: "+42,3454,000",
      currency: "42,3454 USDC",
      type: "incoming",
      displayAmount: "+$42,3454,000",
    },
  ];

  // Sample account data
  const accounts: Account[] = [
    { id: "1", name: "Payroll", percentage: 46, balance: "$12,275.43", color: "#6366f1" },
    { id: "2", name: "Operations", percentage: 39, balance: "$7,882.01", color: "#3b82f6" },
    { id: "3", name: "Marketing", percentage: 8, balance: "$2,375.22", color: "#60a5fa" },
    { id: "4", name: "Others", percentage: 7, balance: "$2,097.50", color: "#93c5fd" },
  ];

  const timeOptions = ["This year", "This month", "This week"];

  return (
    <div className="w-full border border-primary-divider rounded-3xl flex flex-row gap-px overflow-hidden">
      {/* Left side - Transaction History */}
      <div className="flex-1  rounded-l-3xl border-r border-primary-divider p-4 flex gap-2 flex-col">
        <div className="flex items-center justify-between ">
          <h3 className="text-base font-medium text-text-primary">Money in & Money out</h3>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white border border-primary-divider rounded-lg px-2 py-1.5 text-sm font-medium text-text-primary flex items-center gap-2 hover:bg-gray-50"
            >
              {timePeriod === "year" ? "This year" : timePeriod === "month" ? "This month" : "This week"}
              <svg
                className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-primary-divider rounded-lg shadow-lg z-10 min-w-[140px]">
                {timeOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTimePeriod(option.split(" ")[1].toLowerCase() as "year" | "month" | "week");
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      (timePeriod === "year" && option === "This year") ||
                      (timePeriod === "month" && option === "This month") ||
                      (timePeriod === "week" && option === "This week")
                        ? "bg-gray-100 text-text-primary"
                        : "text-text-primary hover:bg-gray-50"
                    } ${index !== timeOptions.length - 1 ? "border-b border-primary-divider" : ""}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-0 bg-background rounded-2xl">
          {/* Table Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-primary-divider text-xs font-medium text-text-secondary">
            <div className="flex-1">Date</div>
            <div className="flex-1">Customer</div>
            <div className="flex-1 text-right">Amount</div>
          </div>
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={`flex items-center gap-3 px-5 py-4 ${index !== transactions.length - 1 ? "border-b border-primary-divider" : ""}`}
            >
              <div className="flex-1">
                <p className="text-sm text-text-secondary">{transaction.date}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{transaction.name}</p>
                <p className="text-xs text-text-secondary">{transaction.email}</p>
              </div>
              <div className="flex-1 text-right">
                <p
                  className={`text-sm font-semibold ${
                    transaction.type === "incoming" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {transaction.displayAmount}
                </p>
                <p className="text-xs text-text-secondary">{transaction.currency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - All Accounts */}
      <div className="flex-1 gap-2 flex flex-col p-4">
        <h3 className="text-base font-medium">All Accounts</h3>

        <div className="w-full flex flex-row bg-background border-t border-primary-divider rounded-2xl h-full justify-center items-center gap-6">
          {/* Donut Chart Section */}
          <div className="flex items-center justify-center h-64 flex-1/3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accounts.map(acc => ({ name: acc.name, value: acc.percentage }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {accounts.map(account => (
                    <Cell key={`cell-${account.id}`} fill={account.color} />
                  ))}
                </Pie>
                <Tooltip content={() => null} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Account Items */}
          <div className="space-y-px flex-2/3">
            <div className="flex items-center px-4 py-2 gap-4 border-b border-primary-divider text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Weight</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Account</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium">Balance</p>
              </div>
            </div>
            {accounts.map((account, index) => (
              <div
                key={account.id}
                className={`flex items-center px-4 py-3 gap-4 ${index !== accounts.length - 1 ? "border-b border-primary-divider" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account.color }}></div>
                  <span className="text-sm font-medium">{account.percentage}%</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{account.name}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium">{account.balance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
