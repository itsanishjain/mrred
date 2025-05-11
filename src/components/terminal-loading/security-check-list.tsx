import React from "react";
import { motion } from "framer-motion";

interface SecurityCheckListProps {
  checks: Record<string, string>;
  className?: string;
}

export const SecurityCheckList: React.FC<SecurityCheckListProps> = ({
  checks,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-1 text-xs w-full ${className}`}
    >
      {Object.entries(checks).map(([name, status], index) => (
        <React.Fragment key={name}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="font-medium border-l border-red-800/50 pl-2"
          >
            {name}
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`
              font-bold tracking-wider
              ${
                [
                  "VERIFIED",
                  "ACTIVE",
                  "CONNECTED",
                  "ENABLED",
                  "COMPLETED",
                ].includes(status)
                  ? "text-green-500"
                  : status === "PENDING"
                  ? "text-yellow-500"
                  : "text-red-500"
              }
            `}
          >
            <motion.span
              animate={
                status === "PENDING"
                  ? {
                      opacity: [1, 0.5, 1],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{ duration: 1, repeat: Infinity }}
            >
              {status}
            </motion.span>
          </motion.div>
        </React.Fragment>
      ))}
    </div>
  );
};
