"use client";
import React from "react";
import { EmailShareModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import toast from "react-hot-toast";

export function EmailShareModal({ isOpen, onClose, ...props }: ModalProp<EmailShareModalProps>) {
  const { link, subject, body, recipientEmail, htmlBody } = props;

  if (!isOpen) return null;

  const instruction = [
    "",
    "— Instructions —",
    "1) Click 'Copy Content' in the dialog.",
    "2) Return to this email and paste (Cmd/Ctrl + V) to render the design.",
    "",
    "If pasting is not possible, send this claim link:",
    link,
  ].join("\n");

  const composedBody = instruction;

  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail || "")}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(composedBody)}`;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Share via Email" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-2 p-2 bg-[#1E1E1E] rounded-b-2xl w-full">
        <div className="bg-[#292929] rounded-lg p-3">
          <div className="text-[#989898] text-sm mb-1">Email Content</div>
          <div className="flex flex-col gap-2">
            <div className="bg-[#3d3d3d] rounded-md p-2">
              <div className="text-[#cfcfcf] text-xs mb-1">Subject</div>
              <div className="text-white text-sm break-all">{subject}</div>
            </div>
            <div className="bg-[#3d3d3d] rounded-md p-2">
              <div className="text-[#cfcfcf] text-xs mb-2">Preview</div>
              <div className="rounded border border-[#2a2a2a] overflow-hidden">
                <div className="bg-black/20 p-2" dangerouslySetInnerHTML={{ __html: htmlBody || "" }} />
              </div>
              <div className="w-full">
                <ActionButton
                  className="w-full"
                  text="Copy Content"
                  onClick={async () => {
                    try {
                      if ((navigator as any).clipboard?.write) {
                        const item = new (window as any).ClipboardItem({
                          "text/html": new Blob([htmlBody || ""], { type: "text/html" }),
                          "text/plain": new Blob([body], { type: "text/plain" }),
                        });
                        await (navigator as any).clipboard.write([item]);
                        toast.success("Rich content copied. Paste in your email.");
                      } else {
                        await navigator.clipboard.writeText(htmlBody || "");
                        toast.success("HTML copied (fallback)");
                      }
                    } catch (e) {
                      await navigator.clipboard.writeText(htmlBody || "");
                      toast.success("HTML copied");
                    }
                  }}
                />
              </div>
              <div className="text-[#989898] text-lg mt-2">Open your email and paste the content into your email.</div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex gap-2 w-full">
          <ActionButton text="Close" type="neutral" className="flex-1" onClick={onClose} />
          <ActionButton
            text="Open Email"
            className="flex-1"
            onClick={() => {
              try {
                window.location.href = mailtoUrl;
              } catch {
                window.open(mailtoUrl, "_blank");
              }
            }}
          />
        </div>
      </div>
    </BaseModal>
  );
}

export default EmailShareModal;
