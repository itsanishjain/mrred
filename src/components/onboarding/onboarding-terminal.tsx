"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Shield, Lock, Wifi } from "lucide-react";

interface TerminalProps {
  children: React.ReactNode;
}

export const OnboardingTerminal = forwardRef<HTMLDivElement, TerminalProps>(
  ({ children }, ref) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [securityLevel, setSecurityLevel] = useState(0);

    // Update time every second
    useEffect(() => {
      const timer = setInterval(() => {
        setTime(new Date().toLocaleTimeString());
      }, 1000);

      // Simulate security level increasing
      const securityTimer = setInterval(() => {
        setSecurityLevel((prev) => (prev < 100 ? prev + 1 : 100));
      }, 50);

      return () => {
        clearInterval(timer);
        clearInterval(securityTimer);
      };
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-screen flex flex-col bg-black relative overflow-hidden"
      >
        {/* Background grid effect */}
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-5 z-0"></div>

        {/* Terminal Header */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="bg-gradient-to-r from-red-950 to-red-900 px-4 py-3 flex items-center justify-between border-b border-red-800 relative z-10 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <Terminal className="h-5 w-5 text-red-300" />
            <div className="text-white font-mono font-bold tracking-wider text-sm bg-gradient-to-r from-red-300 to-red-100 bg-clip-text text-transparent">
              MR.RED IDENTITdfadsY VERIFICATION v2.0
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-red-300 font-mono">{time}</div>
            {/* <div className="flex items-center space-x-2">
              <motion.div 
                whileHover={{ scale: 1.2 }}
                className="w-3 h-3 rounded-full bg-yellow-500 shadow-glow-yellow"
              ></motion.div>
              <motion.div 
                whileHover={{ scale: 1.2 }}
                className="w-3 h-3 rounded-full bg-green-500 shadow-glow-green"
              ></motion.div>
              <motion.div 
                whileHover={{ scale: 1.2 }}
                className="w-3 h-3 rounded-full bg-red-500 shadow-glow-red"
              ></motion.div>
            </div> */}
          </div>
        </motion.div>

        {/* Terminal Body */}
        <div
          className="flex-1 overflow-hidden bg-black/90 relative z-10"
          ref={ref}
        >
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-scanline pointer-events-none"></div>
          {/* Vignette effect */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
          {/* Glitch effect overlay */}
          <div className="absolute inset-0 bg-glitch opacity-10 pointer-events-none"></div>

          <div className="relative z-20">{children}</div>
        </div>

        {/* Terminal Footer */}
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
          className="bg-gradient-to-r from-red-950 to-red-900 px-4 py-2 text-xs border-t border-red-800 relative z-10 shadow-lg"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-300">
                <Lock className="h-3 w-3" />
                <span>ENCRYPTED</span>
              </div>
              <div className="flex items-center space-x-2 text-red-300">
                <Shield className="h-3 w-3" />
                <span>SECURITY LEVEL: {securityLevel}%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-red-300">
              <Wifi className="h-3 w-3" />
              <span>SECURE CONNECTION</span>
              <span className="animate-pulse ml-1">█</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

OnboardingTerminal.displayName = "OnboardingTerminal";
