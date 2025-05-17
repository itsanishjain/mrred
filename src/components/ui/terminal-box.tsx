import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalBoxProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  statusText?: string;
  statusColor?: "red" | "green" | "yellow";
  className?: string;
  animate?: boolean;
  glowEffect?: boolean;
}

export const TerminalBox: React.FC<TerminalBoxProps> = ({
  children,
  title = "TERMINAL",
  icon = <Terminal className="h-4 w-4" />,
  statusText,
  statusColor = "red",
  className,
  animate = true,
  glowEffect = true,
}) => {
  const statusColorClasses = {
    red: "bg-red-500/20 text-red-400 shadow-glow-red",
    green: "bg-green-500/20 text-green-400 shadow-glow-green",
    yellow: "bg-yellow-500/20 text-yellow-400 shadow-glow-yellow",
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ type: "spring", stiffness: 100 }}
      className={cn(
        "bg-black/60 backdrop-blur-sm rounded-lg shadow-lg border border-red-900/20",
        glowEffect && "shadow-red-950/10",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-red-800/30">
        <h3 className="text-sm font-bold text-red-300 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        {statusText && (
          <div className={`text-xs px-2 py-0.5 rounded flex items-center ${statusColorClasses[statusColor]}`}>
            {statusText}
          </div>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
};
