import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  glowEffect?: boolean;
  glitchOnHover?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  variant = "primary",
  size = "md",
  glowEffect = true,
  glitchOnHover = false,
  icon,
  isLoading = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = "font-mono rounded-sm border transition-all duration-200 flex items-center justify-center relative overflow-hidden";
  
  const variantClasses = {
    primary: "bg-red-900/80 hover:bg-red-800 text-red-50 border-red-700",
    secondary: "bg-black/60 hover:bg-black/80 text-red-400 border-red-900/50",
    outline: "bg-transparent hover:bg-red-950/30 text-red-400 border-red-800/60",
    ghost: "bg-transparent hover:bg-red-950/20 text-red-400 border-transparent",
  };
  
  const sizeClasses = {
    sm: "text-xs py-1 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-3 px-6",
  };
  
  const glowClasses = glowEffect ? "shadow-glow-red" : "";
  
  // Loading animation
  const loadingAnimation = isLoading ? (
    <span className="absolute inset-0 flex items-center justify-center bg-inherit">
      <motion.span 
        className="inline-block h-4 w-4 rounded-full bg-red-500"
        animate={{ 
          opacity: [0.2, 1, 0.2],
          scale: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </span>
  ) : null;

  return (
    <motion.button
      whileHover={glitchOnHover ? { 
        x: [0, -2, 2, -1, 0],
        transition: { duration: 0.3 }
      } : { 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        glowClasses,
        isLoading && "text-transparent",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {icon && <span className={`mr-2 ${isLoading ? 'opacity-0' : ''}`}>{icon}</span>}
      <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
      {loadingAnimation}
      
      {/* Scanline effect on hover */}
      <div className="absolute inset-0 bg-scanline opacity-0 group-hover:opacity-10 pointer-events-none" />
    </motion.button>
  );
};
