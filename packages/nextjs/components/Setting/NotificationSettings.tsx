"use client";
import React, { useState } from "react";
import SettingHeader from "./SettingHeader";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import toast from "react-hot-toast";
import { SecondaryButton } from "../Common/SecondaryButton";

interface EmailItem {
  id: string;
  email: string;
}

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailList, setEmailList] = useState<EmailItem[]>([
    { id: "1", email: "martin@quantum3lab.com" },
    { id: "2", email: "bill.sanders@quantum3lab.com" },
    { id: "3", email: "willie.jenningsquantum3lab.com" },
    { id: "4", email: "debra.holtquantum3lab.com" },
    { id: "5", email: "dolores.chambersquantum3lab.com" },
    { id: "6", email: "deanna.curtisquantum3lab.com" },
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState("");

  const handleAddEmail = () => {
    if (!newEmail) {
      toast.error("Please enter an email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    const newItem: EmailItem = {
      id: Date.now().toString(),
      email: newEmail,
    };
    setEmailList([...emailList, newItem]);
    setNewEmail("");
    toast.success("Email added successfully");
  };

  const handleDeleteEmail = (id: string) => {
    setEmailList(emailList.filter(item => item.id !== id));
    toast.success("Email removed");
  };

  const handleStartEdit = (id: string, email: string) => {
    setEditingId(id);
    setEditingEmail(email);
  };

  const handleUpdateEmail = () => {
    if (!editingEmail || !editingId) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    setEmailList(emailList.map(item => (item.id === editingId ? { ...item, email: editingEmail } : item)));
    setEditingId(null);
    setEditingEmail("");
    toast.success("Email updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingEmail("");
  };

  return (
    <div className="flex flex-col">
      <SettingHeader icon="/misc/notification-icon.svg" title="Notifications" />

      <div className="border border-primary-divider rounded-2xl p-5 flex flex-col gap-4 min-w-[600px]">
        {/* Email Notifications Section */}
        <h2 className="text-lg font-semibold text-text-primary tracking-[-0.36px] leading-none">Email notifications</h2>

        {/* Toggle */}
        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-text-primary leading-5 tracking-[-0.21px]">When i receive new invoice</p>
          <ToggleSwitch enabled={notificationsEnabled} onChange={setNotificationsEnabled} />
        </div>

        {/* Email List Section */}
        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-sm font-semibold text-text-primary leading-5 tracking-[-0.14px]">
            Email list to receive notifications
          </h3>

          <div className="flex flex-col gap-3 w-full">
            {/* Email List Items */}
            {emailList.map(item => (
              <div key={item.id} className="flex items-center justify-between w-full">
                <p className="text-sm text-text-primary leading-5 tracking-[-0.21px]">{item.email}</p>
                <div className="flex gap-2 items-center justify-center">
                  <button
                    onClick={() => handleDeleteEmail(item.id)}
                    className="w-4 h-4 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <img src="/trashcan-icon.svg" alt="Delete" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(item.id, item.email)}
                    className="w-4 h-4 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <img src="/misc/edit-icon.svg" alt="Edit" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Edit Email Input (if editing) */}
            {editingId && (
              <div className="flex flex-col gap-1 w-full">
                <input
                  type="email"
                  value={editingEmail}
                  onChange={e => setEditingEmail(e.target.value)}
                  className="text-sm font-medium text-text-primary leading-5 tracking-[-0.56px] outline-none w-full bg-app-background px-2 py-1 border border-primary-divider rounded-lg"
                  placeholder="Enter email"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <SecondaryButton text="Cancel" onClick={handleCancelEdit} variant="light" buttonClassName="px-4" />
                  <SecondaryButton text="Update" onClick={handleUpdateEmail} buttonClassName="px-4" />
                </div>
              </div>
            )}

            {/* Add New Email Input */}
            {!editingId && (
              <div className="flex flex-col gap-1 w-full">
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddEmail()}
                  className="text-sm font-medium text-text-primary leading-5 tracking-[-0.56px] outline-none w-full bg-app-background px-2 py-1 border border-primary-divider rounded-lg"
                  placeholder="Enter new email"
                />
                <div className="flex justify-end">
                  <SecondaryButton text="Update" onClick={handleAddEmail} buttonClassName="px-4" />
                </div>
              </div>
            )}

            {/* Add Item Button */}
            <button
              onClick={() => {
                // Focus on input
                const input = document.querySelector<HTMLInputElement>('input[type="email"]');
                input?.focus();
              }}
              className="border border-primary-divider rounded-lg px-3 py-1.5 flex items-center justify-center gap-2 w-full hover:bg-app-background transition-colors"
            >
              <img src="/misc/circle-plus-icon.svg" alt="Add" className="w-5 h-5" />
              <span className="text-sm font-medium text-text-primary tracking-[-0.56px] leading-5">Add item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
