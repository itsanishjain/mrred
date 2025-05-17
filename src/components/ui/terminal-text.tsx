import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TypeAnimation } from "react-type-animation";

interface TerminalTextProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  typing?: boolean;
  typingSpeed?: number;
  blinkCursor?: boolean;
  glitchEffect?: boolean;
  prefix?: string;
  highlight?: boolean;
  variant?: "default" | "success" | "error" | "warning" | "info";
  animate?: boolean;
}

export const TerminalText: React.FC<TerminalTextProps> = ({
  children,
  text,
  className,
  typing = false,
  typingSpeed = 40,
  blinkCursor = true,
  glitchEffect = false,
  prefix = ">",
  highlight = false,
  variant = "default",
  animate = false,
}) => {
  const [randomGlitch, setRandomGlitch] = useState(false);
  
  // Random glitch effect
  useEffect(() => {
    if (glitchEffect) {
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.9) {
          setRandomGlitch(true);
          setTimeout(() => setRandomGlitch(false), 150);
        }
      }, 3000);
      
      return () => clearInterval(glitchInterval);
    }
  }, [glitchEffect]);
  
  const variantClasses = {
    default: "text-red-400",
    success: "text-green-400",
    error: "text-red-500",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };
  
  const highlightClasses = highlight ? "bg-red-900/20 px-2 py-1 rounded" : "";
  
  const content = text || children;
  
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn(
        "font-mono text-sm",
        variantClasses[variant],
        highlightClasses,
        randomGlitch ? "glitch-text" : "",
        className
      )}
    >
      {typing && typeof text === "string" ? (
        <div className="flex">
          {prefix && <span className="mr-2">{prefix}</span>}
          <TypeAnimation
            sequence={[text]}
            wrapper="span"
            cursor={blinkCursor}
            repeat={0}
            speed={typingSpeed}
          />
        </div>
      ) : (
        <div className="flex">
          {prefix && <span className="mr-2">{prefix}</span>}
          <span>{content}</span>
        </div>
      )}
    </motion.div>
  );
};
