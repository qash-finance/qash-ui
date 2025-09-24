"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TitleContextType {
  title: string | ReactNode;
  showBackArrow: boolean;
  setTitle: (title: string | ReactNode) => void;
  setShowBackArrow: (show: boolean) => void;
  onBackClick?: () => void;
  setOnBackClick: (callback: (() => void) | undefined) => void;
  resetTitle: () => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export const TitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState<string | ReactNode>("Welcome to Qash");
  const [showBackArrow, setShowBackArrow] = useState<boolean>(false);
  const [onBackClick, setOnBackClick] = useState<(() => void) | undefined>(undefined);

  const resetTitle = () => {
    setTitle("Welcome to Qash");
    setShowBackArrow(false);
    setOnBackClick(undefined);
  };

  return (
    <TitleContext.Provider
      value={{
        title,
        showBackArrow,
        setTitle,
        setShowBackArrow,
        onBackClick,
        setOnBackClick,
        resetTitle,
      }}
    >
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error("useTitle must be used within a TitleProvider");
  }
  return context;
};
