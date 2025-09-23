"use client";

import { useTheme } from "@/contexts/ThemeProvider";
import Image from "next/image";

const ANIMATION_DURATION = 150; // Animation duration in milliseconds

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const isLight = theme === "light";

  // Base styles for all tab buttons
  const baseTabStyles =
    "flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-xl flex-[1_0_0] relative z-10";
  // Active tab styles
  const activeTabStyles = "text-text-primary";

  const disabledStyles = "cursor-not-allowed";

  return (
    <nav className="relative flex gap-1.5 justify-center items-center self-stretch p-1 rounded-full h-[35px] bg-primary-divider">
      {/* Sliding indicator */}
      <div
        className={`absolute bg-background border-b-1 border-b-primary-divider shadow-lg rounded-full transition-all duration-${ANIMATION_DURATION} ease-in-out z-0`}
        style={{
          left: isLight ? "2px" : "calc(50% + 1px)",
          width: "calc(50% - 1px)",
          height: "30px",
          top: "2px",
        }}
      />

      <button
        className={`${baseTabStyles} ${isLight && activeTabStyles} ${disabledStyles}`}
        onClick={toggleTheme}
        aria-label="Switch to dark mode"
        disabled
      >
        <Image
          src="/misc/sun-icon.svg"
          alt="Sun icon"
          width={21}
          height={20}
          className={`h-5 w-5 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${!isLight ? "opacity-20" : ""}`}
        />
      </button>

      <button
        className={`${baseTabStyles} ${!isLight && activeTabStyles} ${disabledStyles}`}
        onClick={toggleTheme}
        aria-label="Switch to light mode"
        disabled
      >
        <Image
          src="/misc/moon-icon.svg"
          alt="Moon icon"
          width={21}
          height={20}
          className={`h-5 w-5 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${isLight ? "opacity-20" : ""}`}
        />
      </button>
    </nav>
  );
}
