import React from "react";
import { motion } from "framer-motion";

interface ProgressCircleProps {
  progress: number;
  scanCoords: { y1: number; y2: number };
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  scanCoords,
}) => {
  return (
    <div className="w-64 h-64 md:w-80 md:h-80 relative">
      <motion.div
        className="absolute inset-0 bg-red-700/10 rounded-full filter blur-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="w-full h-full relative">
        {/* Outer ring with gradient */}
        <motion.div
          className="absolute inset-0 rounded-full "
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Progress ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeDasharray={`${progress * 2.83} 283`}
            className="transition-all duration-300 ease-linear drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          />
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-red-500">
              {Math.round(progress)}%
            </div>
            <div className="text-sm md:text-base uppercase tracking-widest text-red-700 mt-2 font-mono font-semibold">
              INITIALIZING
            </div>
          </div>
        </div>

        {/* Rotating markers */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `rotate(${i * 45}deg) translateY(-150px)`,
            }}
          >
            <motion.div
              className="w-full h-full bg-red-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
