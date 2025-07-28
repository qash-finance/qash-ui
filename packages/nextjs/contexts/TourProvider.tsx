"use client";

import { ReactNode, useState, useEffect } from "react";
import { StepType, TourProvider, useTour } from "@reactour/tour";
import { ActionButton } from "@/components/Common/ActionButton";

const TOUR_KEY = "tour_skipped";
type ArrowDirection = "up" | "down" | "left" | "right";

// Shared popover styles to avoid repetition
const sharedPopoverStyles = {
  backgroundColor: "#D6EDFF",
  borderRadius: "13px",
  boxShadow: "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(0, 89, 255, 0.20), 0px -2.4px 0px 0px #0059FF inset",
  color: "black",
  maxWidth: "400px",
};

const Pagination = ({
  currentStep,
  totalSteps,
  className = "",
}: {
  currentStep: number;
  totalSteps: number;
  className?: string;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;

        return (
          <div
            key={index}
            className={`
                transition-all duration-500 ease-in-out
                ${
                  isActive
                    ? "bg-[#0844C5] w-4 h-2 rounded-full"
                    : isPast
                      ? "bg-[#83CFFF] w-2 h-2 rounded-full"
                      : "bg-[#83CFFF] w-2 h-2 rounded-full"
                }
              `}
          />
        );
      })}
    </div>
  );
};

// Component that provides tour controls to step content
const TourStepContent = ({ text, arrowDirection }: { text: string; arrowDirection?: ArrowDirection }) => {
  const { setIsOpen, setCurrentStep, currentStep } = useTour();

  const handleSkip = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      localStorage.setItem(TOUR_KEY, "true");
      setIsOpen(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const getArrowSrc = (direction?: ArrowDirection) => {
    switch (direction) {
      case "up":
        return "/tooltip/tooltip-up-arrow.svg";
      case "down":
        return "/tooltip/tooltip-down-arrow.svg";
      case "left":
        return "/tooltip/tooltip-left-arrow.svg";
      case "right":
        return "/tooltip/tooltip-right-arrow.svg";
      default:
        return null;
    }
  };

  const arrowSrc = getArrowSrc(arrowDirection);

  return (
    <div className="flex flex-col gap-2">
      <img src="/tooltip-lightbulb.svg" alt="lightbulb" className="w-6 h-6" />
      <div className="text-base text-gray-500">{text}</div>
      <div className="flex flex-row gap-3">
        <Pagination currentStep={currentStep} totalSteps={steps.length} className="justify-center" />
        <div className="flex flex-row gap-2 justify-end">
          <ActionButton text="Skip" type="neutral" onClick={handleSkip} className="w-[100px] flex-1" />
          <ActionButton text="Next" type="accept" onClick={handleNext} className="w-[100px] flex-1" />
        </div>
      </div>
      {arrowSrc && (
        <img
          src={arrowSrc}
          alt={`arrow-${arrowDirection}`}
          className="absolute"
          style={{
            position: "absolute",
            ...(arrowDirection === "up" && { top: "-10px", left: "50%", transform: "translateX(-50%)" }),
            ...(arrowDirection === "down" && { bottom: "-10px", left: "50%", transform: "translateX(-50%)" }),
            ...(arrowDirection === "left" && { left: "-10px", top: "50%", transform: "translateY(-50%)" }),
            ...(arrowDirection === "right" && { right: "-10px", top: "50%", transform: "translateY(-50%)" }),
          }}
        />
      )}
    </div>
  );
};

const steps: StepType[] = [
  // Welcome step - centered on screen
  {
    selector: "#empty-state", // This is pointing to nothing
    content: (
      <TourStepContent text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
    ),
    position: "center",
    highlightedSelectors: [],
  },
  // Sidebar
  {
    selector: ".sidebar",
    content: <TourStepContent text="This is the sidebar" arrowDirection="left" />,
  },
  // Dashboard
  {
    selector: ".dashboard-tab",
    content: <TourStepContent text="This is the dashboard tab" arrowDirection="up" />,
    styles: {
      popover: base => ({
        ...base,
        ...sharedPopoverStyles,
        left: Number(base.left) + 100,
        top: Number(base.top) + 10,
      }),
    },
  },
  {
    selector: ".dashboard-tab #pending-recieve",
    content: <TourStepContent text="This is the receive tab" arrowDirection="up" />,
    styles: {
      popover: base => ({
        ...base,
        ...sharedPopoverStyles,
        left: Number(base.left) - 90,
        top: Number(base.top) + 10,
      }),
    },
  },
  {
    selector: ".dashboard-tab #pending-request",
    content: <TourStepContent text="This is the payment request tab" arrowDirection="up" />,
    styles: {
      popover: base => ({
        ...base,
        ...sharedPopoverStyles,
        left: Number(base.left) - 90,
        top: Number(base.top) + 10,
      }),
    },
  },
  {
    selector: ".dashboard-tab #cancel-transaction",
    content: <TourStepContent text="This is the cancel payment tab" arrowDirection="up" />,
    position: "bottom",
    styles: {
      popover: base => ({
        ...base,
        ...sharedPopoverStyles,
        left: Number(base.left) + 300,
        top: Number(base.top) + 60,
      }),
    },
  },
  // Portfolio
  {
    selector: ".portfolio-button",
    content: <TourStepContent text="This is the portfolio tab" arrowDirection="right" />,
    styles: {
      popover: base => ({
        ...base,
        ...sharedPopoverStyles,
        top: Number(base.top) - 10,
      }),
    },
  },
  // Receive Address
  {
    selector: ".receive-address",
    content: <TourStepContent text="This is the receive address tab" arrowDirection="right" />,
    position: "left",
  },
  // Pending To Receive
  {
    selector: ".pending-to-receive",
    content: <TourStepContent text="This is the pending to receive tab" arrowDirection="up" />,
  },
  // Fab Free Token
  {
    selector: ".fab-free-token",
    content: <TourStepContent text="This is the free token floating action button" />,
  },
  // End of tour
  {
    selector: "#empty-state", // This is pointing to nothing
    content: <TourStepContent text="Thats all for now" />,
    position: "center",
    highlightedSelectors: [],
  },
];

// Separate component to handle auto-start logic
const TourAutoStart = () => {
  const { setIsOpen } = useTour();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Check if tour has been skipped before
    const tourSkipped = localStorage.getItem(TOUR_KEY);

    // Check if we're on a page where tour shouldn't start
    const currentPath = window.location.pathname;
    const isNotFoundPage = document.querySelector('[data-testid="not-found"]');
    const shouldSkipTour = currentPath === "/mobile" || isNotFoundPage;

    if (!tourSkipped && !hasInitialized && !shouldSkipTour) {
      // Auto-start tour after a short delay to ensure components are rendered
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasInitialized(true);
      }, 1000);

      return () => clearTimeout(timer);
    }

    setHasInitialized(true);
  }, [setIsOpen, hasInitialized]);

  return null;
};

interface TourProviderWrapperProps {
  children: ReactNode;
}

export const TourProviderWrapper = ({ children }: TourProviderWrapperProps) => {
  return (
    <TourProvider
      showNavigation={false}
      showBadge={false}
      showCloseButton={false}
      disableDotsNavigation={true}
      showDots={false}
      steps={steps}
      padding={{
        popover: [5],
      }}
      onClickMask={({ setIsOpen }) => {
        // Save to localStorage when user clicks outside to skip
        localStorage.setItem(TOUR_KEY, "true");
        setIsOpen(false);
      }}
      onClickClose={({ setIsOpen }) => {
        // Save to localStorage when user clicks close button
        localStorage.setItem(TOUR_KEY, "true");
        setIsOpen(false);
      }}
      styles={{
        popover: base => ({
          ...base,
          "--reactour-accent": "#066EFF",
          ...sharedPopoverStyles,
        }),
        maskArea: base => ({ ...base, rx: 13 }),
      }}
    >
      <TourAutoStart />
      {children}
    </TourProvider>
  );
};
