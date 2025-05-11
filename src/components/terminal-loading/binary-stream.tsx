import React from "react";
import { motion } from "framer-motion";

interface BinaryStreamProps {
  length?: number;
  className?: string;
}

export const BinaryStream: React.FC<BinaryStreamProps> = ({
  length = 100,
  className = "",
}) => {
  const binaryStream = React.useMemo(
    () => Array.from({ length }, () => Math.round(Math.random())),
    [length]
  );

  return (
    <div className={`overflow-hidden h-6 text-xs font-mono ${className}`}>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="whitespace-nowrap"
      >
        {binaryStream.map((bit, i) => (
          <motion.span
            key={i}
            animate={{
              opacity: [0.3, 1, 0.3],
              color:
                i % 13 === 0 ? ["#ef4444", "#991b1b", "#ef4444"] : undefined,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.05,
            }}
            className={`
              ${i % 7 === 0 ? "text-red-500" : "text-red-900"}
              ${i % 23 === 0 ? "font-bold" : ""}
            `}
          >
            {bit}
          </motion.span>
        ))}
        {binaryStream.map((bit, i) => (
          <motion.span
            key={`dup-${i}`}
            animate={{
              opacity: [0.3, 1, 0.3],
              color:
                i % 13 === 0 ? ["#ef4444", "#991b1b", "#ef4444"] : undefined,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.05,
            }}
            className={`
              ${i % 7 === 0 ? "text-red-500" : "text-red-900"}
              ${i % 23 === 0 ? "font-bold" : ""}
            `}
          >
            {bit}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};
