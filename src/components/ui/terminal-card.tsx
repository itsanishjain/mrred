import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalCardProps {
  children: React.ReactNode;
  className?: string;
  glowEffect?: boolean;
  hoverEffect?: boolean;
  variant?: "default" | "outline" | "ghost";
  interactive?: boolean;
  onClick?: () => void;
}

export const TerminalCard: React.FC<TerminalCardProps> = ({
  children,
  className,
  glowEffect = false,
  hoverEffect = false,
  variant = "default",
  interactive = false,
  onClick,
}) => {
  const baseClasses = "rounded-md overflow-hidden";
  
  const variantClasses = {
    default: "bg-black/60 backdrop-blur-sm border border-red-900/30",
    outline: "bg-transparent border border-red-800/40",
    ghost: "bg-transparent",
  };
  
  const glowClasses = glowEffect ? "shadow-glow-red" : "";
  
  const interactiveClasses = interactive ? "cursor-pointer" : "";
  
  const MotionComponent = motion.div;
  
  const animationProps = hoverEffect ? {
    whileHover: { 
      scale: 1.02,
      borderColor: "rgba(239, 68, 68, 0.5)",
    },
    transition: { 
      duration: 0.2,
    }
  } : {};

  return (
    <MotionComponent
      className={cn(
        baseClasses,
        variantClasses[variant],
        glowClasses,
        interactiveClasses,
        className
      )}
      onClick={interactive ? onClick : undefined}
      {...animationProps}
    >
      {children}
    </MotionComponent>
  );
};
