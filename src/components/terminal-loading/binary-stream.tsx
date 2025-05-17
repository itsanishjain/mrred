import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BinaryStreamProps {
  length?: number;
  className?: string;
  speed?: number;
  density?: number;
}

export const BinaryStream: React.FC<BinaryStreamProps> = ({
  length = 100,
  className = "",
  speed = 100,
  density = 10,
}) => {
  const [stream, setStream] = useState<Array<{value: string, highlight: boolean}>>([]);
  const [glitchPosition, setGlitchPosition] = useState<number | null>(null);

  useEffect(() => {
    // Generate initial stream
    const initialStream = Array(length)
      .fill(0)
      .map(() => ({
        value: Math.random() > 0.5 ? "1" : "0",
        highlight: Math.random() > 0.9
      }));
    setStream(initialStream);

    // Update stream periodically
    const interval = setInterval(() => {
      setStream((prev) => {
        const newStream = [...prev];
        // Update random positions
        for (let i = 0; i < Math.floor(length / density); i++) {
          const pos = Math.floor(Math.random() * length);
          newStream[pos] = {
            value: Math.random() > 0.5 ? "1" : "0",
            highlight: Math.random() > 0.9
          };
        }
        return newStream;
      });
      
      // Random glitch effect
      if (Math.random() > 0.9) {
        setGlitchPosition(Math.floor(Math.random() * length));
        setTimeout(() => setGlitchPosition(null), 150);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [length, speed, density]);

  return (
    <div
      className={`font-mono text-xs overflow-hidden ${className}`}
    >
      <div className="flex flex-wrap">
        <AnimatePresence>
          {stream.map((bit, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                color: bit.highlight ? "#f87171" : bit.value === "1" ? "#ef4444" : "#991b1b",
                scale: bit.highlight ? 1.2 : 1,
                textShadow: bit.highlight ? "0 0 5px rgba(239, 68, 68, 0.7)" : "none"
              }}
              transition={{ duration: 0.2 }}
              className={`w-4 inline-block ${index === glitchPosition ? "glitch-text" : ""}`}
            >
              {bit.value}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
