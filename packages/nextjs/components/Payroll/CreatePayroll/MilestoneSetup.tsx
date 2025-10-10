"use client";
import { ToggleSwitch } from "@/components/Common/ToggleSwitch";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import React, { useState } from "react";
import { AssetWithMetadata } from "@/types/faucet";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatUnits } from "viem";

interface Milestone {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  description: string;
}

interface MilestoneSetupProps {
  isMilestoneSetupEnabled: boolean;
  setIsMilestoneSetupEnabled: (enabled: boolean) => void;
  selectedToken: AssetWithMetadata;
  handleTokenSelect: (token: AssetWithMetadata) => void;
  inputContainerClass: string;
  register: any;
  watch: any;
  errors: any;
}

const MilestoneItem = ({
  milestone,
  index,
  selectedToken,
  openModal,
  inputContainerClass,
  onRemove,
  canRemove,
  onUpdate,
}: {
  milestone: Milestone;
  index: number;
  selectedToken: AssetWithMetadata;
  openModal: any;
  inputContainerClass: string;
  onRemove: () => void;
  canRemove: boolean;
  onUpdate: (field: keyof Milestone, value: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2 justify-center items-start border border-primary-divider rounded-2xl p-3">
      {/* Milestone number */}
      <div className="flex flex-row gap-1 items-center justify-between w-full">
        <p className="text-text-primary ">Milestone {index + 1}</p>
        {canRemove && (
          <span
            className="text-text-secondary text-xl bg-background rounded-lg w-8 h-8 flex items-center justify-center leading-none border border-primary-divider cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"
            onClick={onRemove}
          >
            --
          </span>
        )}
      </div>
      {/* Name and amount input */}
      <div className="flex flex-row gap-2 w-full">
        <input
          type="text"
          placeholder="Milestone name"
          value={milestone.name}
          onChange={e => onUpdate("name", e.target.value)}
          className="w-[60%] rounded-lg p-2 border-b-2 border-primary-divider bg-background"
        />
        <div className="w-[40%] flex items-center justify-between rounded-lg p-2 border-b-2 border-primary-divider bg-background">
          <input
            type="text"
            placeholder="Amount"
            value={milestone.amount}
            onChange={e => onUpdate("amount", e.target.value)}
            className="w-[100px] text-text-primary outline-none"
          />
          {selectedToken.metadata.symbol}
        </div>
      </div>
      {/* Due date input */}
      <div className="bg-background flex gap-2 items-center px-2 py-2.5 rounded-lg w-full">
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-text-secondary text-[14px] leading-none text-left">Due date</span>
          <input
            type="text"
            disabled
            placeholder="DD/MM/YYYY"
            value={milestone.dueDate}
            className="text-[16px] text-text-primary placeholder:text-text-secondary outline-none w-full"
          />
        </div>
        <img
          src="/modal/calendar-icon.svg"
          alt="Calendar"
          className="w-6 h-6 cursor-pointer"
          style={{ filter: "brightness(0)" }}
          onClick={e => {
            e.stopPropagation();
            openModal(MODAL_IDS.DATE_PICKER, {
              defaultSelected: new Date(),
              onSelect: (date: Date) => {
                const day = date.getDate().toString().padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear();
                onUpdate("dueDate", `${day}/${month}/${year}`);
              },
            });
          }}
        />
      </div>
      {/* Description Input */}
      <div className="flex flex-col gap-1 w-full">
        <div className={`${inputContainerClass} min-h-[175px] flex flex-col gap-2`}>
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="text-text-secondary text-sm">Description</p>
            <textarea
              value={milestone.description}
              onChange={e => onUpdate("description", e.target.value)}
              className={`w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary h-full resize-none`}
              autoComplete="off"
              placeholder="Write description about this milestone"
              maxLength={250}
            />
          </div>
        </div>
        <div className="flex justify-between px-3">
          <p className="text-xs text-text-secondary">(Optional)</p>
          <p className="text-xs text-text-secondary">{milestone.description.length}/250</p>
        </div>
      </div>
    </div>
  );
};

export const MilestoneSetup = ({
  isMilestoneSetupEnabled,
  setIsMilestoneSetupEnabled,
  selectedToken,
  handleTokenSelect,
  inputContainerClass,
  register,
  watch,
  errors,
}: MilestoneSetupProps) => {
  const { openModal } = useModal();
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      name: "",
      amount: "",
      dueDate: "",
      description: "",
    },
  ]);

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      name: "",
      amount: "",
      dueDate: "",
      description: "",
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(milestone => milestone.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map(milestone => (milestone.id === id ? { ...milestone, [field]: value } : milestone)));
  };

  return (
    <div className="bg-payroll-sub-background border-t-2 border-background rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
        <h3 className="text-[18px] font-medium text-text-primary">Milestone setup</h3>
        <ToggleSwitch
          enabled={isMilestoneSetupEnabled}
          onChange={() => {
            setIsMilestoneSetupEnabled(!isMilestoneSetupEnabled);
          }}
        />
      </div>
      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isMilestoneSetupEnabled ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 flex flex-col gap-4">
          {/* Token Selector */}
          <div
            className={`${inputContainerClass} flex items-center justify-between cursor-pointer`}
            onClick={() =>
              openModal(MODAL_IDS.SELECT_TOKEN, {
                selectedToken,
                onTokenSelect: handleTokenSelect,
              })
            }
          >
            <div className="flex gap-3 items-center">
              {selectedToken.metadata.symbol ? (
                <>
                  <div className="relative w-10 h-10">
                    <img
                      alt=""
                      className="w-full h-full"
                      src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                    />
                    <img alt="" className="absolute bottom-0 right-0 w-5 h-5" src="/chain/miden.svg" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-text-primary text-sm">{selectedToken.metadata.symbol}</p>
                    <p className="text-text-secondary text-sm">Miden</p>
                  </div>
                </>
              ) : (
                <span className="text-text-primary py-1">Select token</span>
              )}
            </div>
            <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
          </div>

          <div className="flex justify-end px-3">
            <p className="text-xs text-text-secondary">
              Available:{" "}
              <span className="text-text-primary">
                {formatNumberWithCommas(
                  formatUnits(BigInt(Math.round(Number(selectedToken.amount))), selectedToken.metadata.decimals),
                )}{" "}
                {selectedToken.metadata.symbol}
              </span>
            </p>
          </div>

          {milestones.map((milestone, index) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              index={index}
              selectedToken={selectedToken}
              openModal={openModal}
              inputContainerClass={inputContainerClass}
              onRemove={() => removeMilestone(milestone.id)}
              canRemove={milestones.length > 1}
              onUpdate={(field, value) => updateMilestone(milestone.id, field, value)}
            />
          ))}

          <div className="flex w-full justify-end items-center">
            <div
              className="flex items-center justify-center rounded-lg p-2 border border-primary-divider gap-2 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={addMilestone}
            >
              <img src="/misc/circle-plus-icon.svg" alt="plus" className="w-5 h-5" />
              <span className="text-text-primary text-sm">Add new</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
