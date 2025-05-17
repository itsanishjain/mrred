import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  glowEffect?: boolean;
  pulseEffect?: boolean;
  label?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  className = "",
  glowEffect = true,
  pulseEffect = true,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const [glitchEffect, setGlitchEffect] = useState(false);

  // Random glitch effect
  useEffect(() => {
    if (progress < 100) {
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.95) {
          setGlitchEffect(true);
          setTimeout(() => setGlitchEffect(false), 150);
        }
      }, 2000);
      
      return () => clearInterval(glitchInterval);
    }
  }, [progress]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={pulseEffect ? {
          scale: [1, 1.02, 1],
          opacity: [1, 0.9, 1]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            className="text-red-950"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Progress track */}
          <circle
            className="text-red-900/30"
            stroke="currentColor"
            strokeWidth={strokeWidth - 2}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Progress circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${glowEffect ? "drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]" : ""} ${glitchEffect ? "glitch-element" : ""}`}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth - 2}
            strokeDasharray={circumference}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Define gradient for progress */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Progress text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            animate={{
              textShadow: glowEffect ? ["0 0 3px rgba(239,68,68,0.5)", "0 0 5px rgba(239,68,68,0.7)", "0 0 3px rgba(239,68,68,0.5)"] : ["none"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`text-red-500 font-mono text-sm font-bold ${glitchEffect ? "glitch-text" : ""}`}
          >
            {Math.round(progress)}%
          </motion.span>
          {label && (
            <span className="text-red-400/80 font-mono text-xs mt-1">
              {label}
            </span>
          )}
        </div>
      </motion.div>

      {/* Decorative elements */}
      {glowEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/5 rounded-full blur-md transform scale-110 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};
