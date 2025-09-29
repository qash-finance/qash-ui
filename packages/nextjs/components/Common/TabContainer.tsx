"use client";
import React, { useRef, useState, useEffect } from "react";

interface TabContainerProps {
  tabs: { id: string; label: string | React.ReactNode; disabled?: boolean }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  textSize?: "sm" | "base";
  tabWidth?: number;
}

const ANIMATION_DURATION = 150; // Animation duration in milliseconds

export function TabContainer({ tabs, activeTab, setActiveTab, textSize = "base", tabWidth = 150 }: TabContainerProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      const containerRect = activeTabElement.parentElement?.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      if (containerRect) {
        setIndicatorStyle({
          left: tabRect.left - containerRect.left - 2.5,
          width: tabRect.width,
        });
      }
    }
  }, [activeTab, tabs]);

  // Base styles for all tab buttons
  const baseTabStyles = `flex gap-0.5 justify-center items-center self-stretch py-1.5 rounded-xl flex-[1_0_0] relative z-0 w-[${tabWidth}px]`;
  // Active tab styles
  const activeTabStyles = "text-text-primary cursor-pointer";
  // Disabled tab styles
  const disabledTabStyles = "cursor-not-allowed opacity-50";

  // Base styles for all tab text
  const baseTextStyles = `text-${textSize} font-medium transition-colors duration-${ANIMATION_DURATION} ease-in-out w-full`;
  // Non-active text styles
  const inactiveTextStyles = "text-text-primary opacity-20";

  return (
    <nav className="relative flex gap-1.5 justify-center items-center self-stretch p-1 rounded-xl bg-app-background h-[40px] border-2 border-primary-divider">
      {/* Sliding indicator */}
      <div
        className={`absolute bg-background border-b-1 border-b-primary-divider shadow-lg rounded-lg transition-all duration-${ANIMATION_DURATION} ease-in-out z-0`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          height: "30px",
          top: "2px",
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={el => {
            if (el) {
              tabRefs.current[index] = el;
            }
          }}
          className={`${baseTabStyles} ${
            tab.disabled ? disabledTabStyles : activeTab === tab.id ? activeTabStyles : "cursor-pointer"
          }`}
          onClick={() => !tab.disabled && setActiveTab(tab.id)}
          disabled={tab.disabled}
        >
          {typeof tab.label === "string" ? (
            <span className={`${baseTextStyles} ${activeTab !== tab.id && inactiveTextStyles}`}>{tab.label}</span>
          ) : (
            <div className={`${baseTextStyles} ${activeTab !== tab.id && inactiveTextStyles}`}>{tab.label}</div>
          )}
        </button>
      ))}
    </nav>
  );
}
