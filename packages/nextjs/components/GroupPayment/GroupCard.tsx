"use client";
import * as React from "react";
import { ActionButton } from "../Common/ActionButton";

interface GroupCardProps {
  imageSrc: string;
  title: string;
  memberCount: number;
  onClick: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ imageSrc, title, memberCount, onClick }) => {
  return (
    <div className="flex overflow-x-auto flex-col p-3 rounded-xl bg-stone-900 min-w-60">
      <div className="flex gap-2.5 items-center self-start">
        <img src={imageSrc} alt={title} className="rounded-full" />
        <div className="flex flex-col justify-center self-stretch my-auto">
          <h3 className="self-start text-base leading-none text-center text-white">{title}</h3>
          <p className="mt-1 text-base tracking-tight leading-none text-neutral-600">{memberCount} members</p>
        </div>
      </div>
      <hr className="my-2" />
      <ActionButton text="Choose group" onClick={onClick} className="h-8" />
    </div>
  );
};
