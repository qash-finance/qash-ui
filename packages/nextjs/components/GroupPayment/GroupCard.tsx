"use client";
import * as React from "react";
import { ActionButton } from "../Common/ActionButton";

interface GroupCardProps {
  imageSrc: string;
  title: string;
  memberCount: number;
  onClick: () => void;
  selected?: boolean;
  onEdit: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  imageSrc,
  title,
  memberCount,
  onClick,
  selected = false,
  onEdit,
}) => {
  return (
    <div className="flex overflow-x-auto flex-col p-3 rounded-xl bg-[#1E1E1E] w-[280px]">
      <div className="flex justify-between items-start">
        <div className="flex gap-2.5 items-center self-start">
          <img src={imageSrc} alt={title} className="rounded-full w-10 h-10" />
          <div className="flex flex-col justify-center self-stretch my-auto">
            <h3 className="self-start text-base leading-none text-center text-white">{title}</h3>
            <p className="mt-1 text-base tracking-tight leading-none text-neutral-600">{memberCount} members</p>
          </div>
        </div>
        <img src="/edit-icon.svg" alt="edit" className="w-5 h-5 cursor-pointer" onClick={onEdit} />
      </div>
      <hr className="my-1" />
      <ActionButton text={selected ? "Unchoose group" : "Choose group"} onClick={onClick} className="h-8" />
    </div>
  );
};
