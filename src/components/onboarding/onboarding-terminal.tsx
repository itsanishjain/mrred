"use client";

import { forwardRef } from "react";

interface TerminalProps {
  children: React.ReactNode;
}

export const OnboardingTerminal = forwardRef<HTMLDivElement, TerminalProps>(
  ({ children }, ref) => {
    return (
      <div className="w-full h-screen flex flex-col bg-black">
        {/* Terminal Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-2 flex items-center justify-between">
          <div className="text-white font-mono font-bold tracking-wider text-sm">
            MR.RED IDENTITY VERIFICATION v1.0
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-hidden bg-black" ref={ref}>
          {children}
        </div>

        {/* Terminal Footer */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-1 text-xs text-white/70 font-mono">
          <div className="flex justify-between">
            <div>SECURE CONNECTION</div>
            <div className="animate-pulse">█</div>
          </div>
        </div>
      </div>
    );
  }
);

OnboardingTerminal.displayName = "OnboardingTerminal";
