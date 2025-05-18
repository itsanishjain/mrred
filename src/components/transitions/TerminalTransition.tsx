"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface TerminalTransitionProps {
  children: React.ReactNode;
  location: string;
}

export const TerminalTransition = ({ children, location }: TerminalTransitionProps) => {
  const router = useRouter();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  // Terminal boot sequence lines
  const bootSequence = [
    "$ ssh user@mr-red-terminal",
    "Password: ********",
    "Establishing secure connection...",
    "Connection established to MR.RED terminal system",
    "Initializing session...",
    "Loading user profile...",
    "Mounting file systems...",
    "Starting MR.RED terminal interface...",
    "Welcome to MR.RED Terminal v3.0"
  ];

  useEffect(() => {
    if (children !== displayChildren) {
      setIsTransitioning(true);
      
      // Simulate terminal boot sequence
      let lineIndex = 0;
      const typingInterval = setInterval(() => {
        if (lineIndex < bootSequence.length) {
          setTerminalLines(prev => [...prev, bootSequence[lineIndex]]);
          lineIndex++;
        } else {
          clearInterval(typingInterval);
          
          // After boot sequence completes, show the new content
          setTimeout(() => {
            setDisplayChildren(children);
            setIsTransitioning(false);
            setTerminalLines([]);
          }, 500);
        }
      }, 200);
      
      return () => clearInterval(typingInterval);
    }
  }, [children, displayChildren]);

  // Terminal window animation variants
  const terminalVariants = {
    initial: { 
      width: "600px", 
      height: "400px",
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    animate: { 
      width: "100%", 
      height: "100%",
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 } 
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          className="w-full h-full"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {isTransitioning ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
              <motion.div 
                className="bg-black border border-red-900/50 rounded-md overflow-hidden shadow-2xl relative"
                variants={terminalVariants}
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
                <div className="p-4 font-mono text-sm text-green-500 h-full overflow-y-auto bg-black">
                  {terminalLines.map((line, index) => (
                    <div key={index} className="mb-1 flex">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {line}
                      </motion.div>
                      {index === terminalLines.length - 1 && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="ml-1"
                        >
                          █
                        </motion.span>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Scan lines effect */}
                <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none"></div>
                
                {/* Vignette effect */}
                <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none"></div>
              </motion.div>
            </div>
          ) : (
            <div className="w-full h-full">{displayChildren}</div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
