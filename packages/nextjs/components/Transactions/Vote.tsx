"use client";

import React from "react";
import { SecondaryButton } from "../Common/SecondaryButton";
import { PrimaryButton } from "../Common/PrimaryButton";

const ConfirmVote = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md bg-app-background p-3 rounded-2xl">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Icon Badge */}
        <img src="/vote/confirm-vote-icon.svg" alt="Vote" className="w-10" />

        {/* Title and Description */}
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-text-primary">Confirm Your Final Vote</h3>
          <p className="text-xs text-text-secondary font-normal">
            You're one of the account members. Once submitted, your vote can't be reverted.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        <SecondaryButton text="Deny" onClick={() => {}} buttonClassName="flex-1" />
        <PrimaryButton text="Approve" onClick={() => {}} containerClassName="flex-1" />
      </div>
    </div>
  );
};

const ApproveVote = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md bg-green-50 p-3 rounded-2xl">
      {/* Icon Badge */}
      <img src="/vote/approve-vote-icon.svg" alt="Vote" className="w-10" />

      {/* Content */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-text-primary">You've approved this transaction</h3>
        <p className="text-xs text-text-secondary font-normal">
          Your approval has been recorded and cannot be reversed.
        </p>
      </div>
    </div>
  );
};

const RejectVote = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md bg-pink-50 p-3 rounded-2xl">
      {/* Icon Badge */}
      <img src="/vote/reject-vote-icon.svg" alt="Vote" className="w-10" />

      {/* Content */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-text-primary">You've rejected this transaction</h3>
        <p className="text-xs text-text-secondary font-normal">
          Your approval has been recorded and cannot be reversed.
        </p>
      </div>
    </div>
  );
};

const FinalVoteApproved = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md bg-app-background p-4 rounded-2xl">
      {/* Content */}
      <div className="flex gap-2 justify-center items-start">
        {/* Icon */}
        <img src="/vote/approve-vote-icon.svg" alt="Vote" className="w-10" />

        {/* Text Content */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold">Transaction Approved</h3>
            <p className="text-xs text-text-secondary font-normal">
              Enough approvals have been collected. This transaction is now approved.
            </p>
          </div>

          {/* View Transactions Button */}
          <button className="flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <span>View Transactions</span>
            <img src="/arrow/chevron-right.svg" alt="Arrow Right" className="w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FinalVoteRejected = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md bg-app-background p-4 rounded-2xl">
      {/* Content */}
      <div className="flex gap-2 justify-center items-start">
        {/* Icon */}
        <img src="/vote/reject-vote-icon.svg" alt="Vote" className="w-10" />

        {/* Text Content */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold">Action Not Approved</h3>
            <p className="text-xs text-text-secondary font-normal">
              Too many deny votes were submitted, so this transaction won’t be executed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ConfirmVote, ApproveVote, RejectVote, FinalVoteApproved, FinalVoteRejected };
