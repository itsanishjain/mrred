"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  location: string;
}

export const PageTransition = ({ children, location }: PageTransitionProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (children !== displayChildren) {
      setIsTransitioning(true);
      // After transition completes, update the children
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, 1000); // Match this with your transition duration
      return () => clearTimeout(timeout);
    }
  }, [children, displayChildren]);

  // Glitch animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const glitchVariants = {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  };

  // Overlay lines for the glitch effect
  const overlayLines = Array.from({ length: 10 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute inset-0 bg-red-500 mix-blend-screen"
      style={{
        height: `${Math.random() * 2 + 0.5}px`,
        top: `${Math.random() * 100}%`,
        left: 0,
        right: 0,
        opacity: 0.3,
      }}
      animate={{
        opacity: [0.1, 0.3, 0.1],
        x: ["-100%", "100%"],
        transition: {
          duration: Math.random() * 0.5 + 0.3,
          repeat: Infinity,
          repeatType: "mirror",
        },
      }}
    />
  ));

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          className="w-full h-full"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Glitch effect overlay */}
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 z-50 overflow-hidden bg-black bg-opacity-80"
              variants={glitchVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Horizontal scan lines */}
              <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
              
              {/* Moving red lines */}
              {overlayLines}
              
              {/* Glitch text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-red-500 font-mono text-2xl font-bold glitch-text">
                  <span className="absolute" style={{ left: "-2px", top: "-2px", color: "cyan", opacity: 0.5 }}>SYSTEM TRANSFER</span>
                  <span>SYSTEM TRANSFER</span>
                  <span className="absolute" style={{ left: "2px", top: "2px", color: "red", opacity: 0.5 }}>SYSTEM TRANSFER</span>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Actual page content */}
          <div className="w-full h-full">{displayChildren}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
