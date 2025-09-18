"use client";

import React, { useMemo } from "react";

interface StatusCircleProps {
  progress?: number; // 0-100
  className?: string;
  showCheckIcon?: boolean; // Whether to show check icon (for consumed transactions)
}

// Constants for better performance and maintainability
const COMPONENT_SIZE = 50;
const CIRCLE_RADIUS = 22;
const SVG_SIZE = 50;
const SVG_CENTER = 25;
const STROKE_WIDTH = 4;

// Pre-calculated values
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Optimized class strings - extracted to avoid string concatenation in render
const CONTAINER_BASE_CLASSES =
  "backdrop-blur-[30px] backdrop-filter flex flex-row items-center justify-center relative rounded-full transition-colors duration-500 ease-in-out";
const ICON_CLASSES = "bg-center bg-cover bg-no-repeat shrink-0 w-5 h-5";
const SVG_CONTAINER_CLASSES = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
const SVG_CLASSES = "absolute inset-0 transform -rotate-90";

export default function StatusCircle({ progress = 0, className = "", showCheckIcon = false }: StatusCircleProps) {
  // Memoize expensive calculations to prevent recalculation on every render
  const progressCalculations = useMemo(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const strokeDashoffset = CIRCUMFERENCE - (clampedProgress / 100) * CIRCUMFERENCE;

    return {
      strokeDasharray: CIRCUMFERENCE,
      strokeDashoffset,
    };
  }, [progress]);

  // Memoize style objects to prevent object recreation on every render
  const containerStyle = useMemo(
    () => ({
      width: COMPONENT_SIZE,
      height: COMPONENT_SIZE,
      backgroundColor: showCheckIcon ? "#1E8FFF" : "#3E4655",
    }),
    [showCheckIcon],
  );

  const svgContainerStyle = useMemo(
    () => ({
      width: `${SVG_SIZE}px`,
      height: `${SVG_SIZE}px`,
    }),
    [],
  );

  const iconStyle = useMemo(
    () => ({
      backgroundImage: showCheckIcon ? "url('/schedule-payment/check.svg')" : "url('/modal/coin-icon.gif')",
      transition: "opacity 0.3s ease-in-out",
    }),
    [showCheckIcon],
  );

  const progressCircleStyle = useMemo(
    () => ({
      transition: "stroke-dashoffset 0.3s ease-in-out, stroke 0.5s ease-in-out",
    }),
    [],
  );

  // Memoize combined className to avoid string concatenation on every render
  const containerClassName = useMemo(
    () => (className ? `${CONTAINER_BASE_CLASSES} ${className}` : CONTAINER_BASE_CLASSES),
    [className],
  );

  return (
    <div className={containerClassName} style={containerStyle} data-name="LoadingCircle">
      <div className={ICON_CLASSES} style={iconStyle} data-name="pie-chart-icon" />

      {/* Progress circle */}
      <div className={SVG_CONTAINER_CLASSES} style={svgContainerStyle}>
        {/* Background circle */}
        <svg className={SVG_CLASSES} width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
          <circle
            cx={SVG_CENTER}
            cy={SVG_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={STROKE_WIDTH}
          />

          <circle
            cx={SVG_CENTER}
            cy={SVG_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={showCheckIcon ? "#ffffff" : "#066eff"}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={progressCalculations.strokeDasharray}
            strokeDashoffset={progressCalculations.strokeDashoffset}
            style={progressCircleStyle}
          />
        </svg>
      </div>
    </div>
  );
}
