"use client";

import { ReactNode } from "react";

interface CustomTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function CustomTooltip({
  children,
  content,
  position = "top",
  className = "",
}: CustomTooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -translate-y-[5px] border-b border-r",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 translate-y-[5px] border-t border-l",
    left: "left-full top-1/2 -translate-y-1/2 -translate-x-[5px] border-t border-r",
    right:
      "right-full top-1/2 -translate-y-1/2 translate-x-[5px] border-b border-l",
  };

  return (
    <div className="relative group inline-flex items-center justify-center">
      {children}
      <div
        className={`absolute ${positionClasses[position]} z-[100] px-3 py-2 min-w-max max-w-xs bg-white border border-[#dfe3e8] shadow-[0_12px_28px_rgba(145,158,171,0.2)] rounded-xl text-[#212B36] text-[11px] font-bold opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-200 ease-out pointer-events-none ${className}`}
      >
        <span className="relative z-10">{content}</span>
        <div
          className={`absolute w-2.5 h-2.5 bg-white border-[#dfe3e8] rotate-45 z-0 ${arrowClasses[position]}`}
        />
      </div>
    </div>
  );
}
