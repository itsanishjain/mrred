"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, Loader2 } from "lucide-react";

export const TerminalLoader = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
      
      {/* Terminal window */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-black border border-red-900/50 rounded-md overflow-hidden shadow-2xl relative w-[500px]"
      >
        {/* Terminal header */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 px-4 py-2 flex items-center justify-between border-b border-red-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-white font-mono text-sm">MR.RED Terminal</div>
          <div className="w-4"></div>
        </div>
        
        {/* Terminal content */}
        <div className="p-6 font-mono text-sm text-green-500 h-full overflow-y-auto bg-black">
          <div className="flex flex-col items-center space-y-4">
            <Terminal className="h-16 w-16 text-red-500 mb-2" />
            
            <div className="text-center">
              <h3 className="text-red-500 text-xl font-bold mb-2">INITIALIZING TERMINAL</h3>
              <p className="text-red-400/80 text-sm mb-4">Establishing secure connection...</p>
            </div>
            
            {/* Loading animation */}
            <div className="flex items-center space-x-2 mt-2">
              <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
              <div className="flex space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className="text-red-500"
                  >
                    .
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-red-950/50 rounded-full overflow-hidden mt-4">
              <motion.div
                className="h-full bg-gradient-to-r from-red-800 to-red-500"
                animate={{ width: ["0%", "100%"] }}
                transition={{ 
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              />
            </div>
            
            {/* Status messages */}
            <div className="w-full mt-4 text-xs text-red-400/70">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {">"}  Loading system modules...
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                {">"}  Authenticating user credentials...
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                {">"}  Establishing blockchain connection...
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.5 }}
              >
                {">"}  Initializing Lens Protocol interface...
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <p className="text-red-500/50 text-xs mt-6 font-mono">
        MR.RED TERMINAL v3.0 © 2025
      </p>
    </div>
  );
};
