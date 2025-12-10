"use client";

import React from "react";

interface BaseContainerProps {
  containerClassName?: string;
  childrenClassName?: string;
  children: React.ReactNode;
  header: React.ReactNode;
}

export const BaseContainer = ({ children, header, containerClassName, childrenClassName }: BaseContainerProps) => {
  return (
    <div className={`flex flex-col bg-base-container-main-background rounded-4xl p-[1px] ${containerClassName}`}>
      <div className="flex justify-center items-center">{header}</div>

      <div
        className={`h-full flex flex-col bg-base-container-sub-background rounded-b-4xl rounded-t-3xl border-t-1 border-base-container-sub-border-top ${childrenClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
