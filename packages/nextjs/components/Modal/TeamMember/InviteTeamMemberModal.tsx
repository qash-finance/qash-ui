"use client";
import React, { useState } from "react";
import { ValidatingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { PrimaryButton } from "../../Common/PrimaryButton";
import { SecondaryButton } from "../../Common/SecondaryButton";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "Owner" | "Admin" | "Member";
  isCurrentUser?: boolean;
}

interface InvitedEmail {
  id: string;
  email: string;
  displayName: string;
}

export function InviteTeamMemberModal({ isOpen, onClose, zIndex }: ModalProp<ValidatingModalProps>) {
  // Local state
  const [emailInput, setEmailInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<InvitedEmail[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Martin Ramos",
      email: "carlos2000@gmail.com",
      role: "Owner",
      isCurrentUser: true,
    },
  ]);

  // Handle email input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);

    // Check if user typed comma+space
    if (value.endsWith(", ")) {
      const emailToAdd = value.slice(0, -2).trim();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailToAdd && emailRegex.test(emailToAdd)) {
        // Add email to invited list
        const newEmail: InvitedEmail = {
          id: Date.now().toString(),
          email: emailToAdd,
          displayName: emailToAdd,
        };
        setInvitedEmails([...invitedEmails, newEmail]);
        setEmailInput("");
      }
    }
  };

  // Remove invited email
  const handleRemoveEmail = (id: string) => {
    setInvitedEmails(invitedEmails.filter(item => item.id !== id));
  };

  // Handle invite submission
  const handleInvite = () => {
    if (invitedEmails.length === 0 && !emailInput.trim()) return;
    // TODO: Add invite logic here
    console.log(
      "Inviting emails:",
      invitedEmails.map(e => e.email),
    );
    setInvitedEmails([]);
    setEmailInput("");
  };

  // Handle done button
  const handleDone = () => {
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="flex flex-col w-[600px] rounded-3xl overflow-hidden border border-primary-divider bg-background">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-primary-divider">
          <h2 className="text-base font-semibold text-text-primary">Invite new member</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-lg bg-app-background border-b-2 border-secondary-divider hover:opacity-80 transition-opacity"
          >
            <img src="/misc/close-icon.svg" alt="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Email Input Section */}
          <div className="flex w-full justify-between items-center bg-app-background border-b-2 border-primary-divider py-2 px-3 rounded-xl">
            <div className="flex-1 flex flex-row gap-3 items-center justify-start flex-wrap">
              {/* Invited Emails Chips */}
              {invitedEmails.length > 0 && (
                <div className="flex flex-row gap-2 flex-wrap">
                  {invitedEmails.map(invitedEmail => (
                    <div key={invitedEmail.id} className="flex gap-2 items-center rounded-lg bg-white px-3 py-1">
                      <p className="font-medium text-sm">{invitedEmail.email}</p>
                      <button
                        onClick={() => handleRemoveEmail(invitedEmail.id)}
                        className="flex items-center justify-center w-4 h-4 hover:opacity-80 transition-opacity"
                        aria-label={`Remove ${invitedEmail.email}`}
                      >
                        <img src="/misc/close-icon.svg" alt="remove" className="w-2" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={emailInput}
                onChange={handleEmailChange}
                placeholder={invitedEmails.length === 0 ? "Enter email addresses, separated by commas" : "Email"}
                className="w-fit text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-primary-blue transition-colors"
              />
            </div>
            <PrimaryButton
              text="Invite"
              onClick={handleInvite}
              disabled={invitedEmails.length === 0 && !emailInput.trim()}
              containerClassName="w-[80px]"
            />
          </div>

          {/* Who has access Section */}
          <div className="flex flex-col gap-3 mt-2">
            <h3 className="text-sm font-medium text-text-secondary">Who has access</h3>

            {/* Team Members List */}
            <div className="flex flex-col gap-3">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  {/* Member Info */}
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-white">{member.name.charAt(0)}</span>
                      </div>
                    )}

                    {/* Name and Email */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {member.name}
                          {member.isCurrentUser && " (You)"}
                        </p>
                      </div>
                      <p className="text-xs text-text-secondary truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {member.role === "Owner" && (
                      <img src="/misc/purple-crown-icon.svg" alt="owner" className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium text-text-primary whitespace-nowrap">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-primary-divider">
          <div className="w-[120px]">
            <SecondaryButton text="Done" onClick={handleDone} />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default InviteTeamMemberModal;
