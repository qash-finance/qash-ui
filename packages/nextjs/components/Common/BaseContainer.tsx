"use client";

import React from "react";

interface BaseContainerProps {
  containerClassName?: string;
  children: React.ReactNode;
  header: React.ReactNode;
}

export const BaseContainer = ({ children, header, containerClassName }: BaseContainerProps) => {
  return (
    <div className={`flex flex-col bg-base-container-main-background rounded-4xl p-[1px] ${containerClassName}`}>
      <div className="flex min-h-[50px] justify-center items-center">{header}</div>

      <div className="flex flex-col bg-base-container-sub-background rounded-b-4xl rounded-t-3xl border-t-1 border-base-container-sub-border-top">
        {children}
      </div>
    </div>
  );
};
