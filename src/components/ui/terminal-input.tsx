import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface TerminalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  prefix?: string | React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  glowEffect?: boolean;
  className?: string;
  containerClassName?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  label,
  prefix = ">",
  error,
  icon,
  clearable = false,
  glowEffect = true,
  className,
  containerClassName,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState(props.value || "");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };
  
  const handleClear = () => {
    setValue("");
    const input = document.getElementById(props.id || "") as HTMLInputElement;
    if (input) {
      input.value = "";
      input.focus();
      
      // Create a synthetic event
      const event = new Event("input", { bubbles: true });
      input.dispatchEvent(event);
      
      // Call onChange if provided
      if (props.onChange) {
        // @ts-ignore - Creating a synthetic event
        props.onChange({ target: { value: "", name: props.name } });
      }
    }
  };

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label htmlFor={props.id} className="block text-xs font-mono text-red-400">
          {label}
        </label>
      )}
      
      <div className="relative">
        <motion.div
          animate={isFocused ? { 
            boxShadow: glowEffect ? "0 0 0 1px rgba(239, 68, 68, 0.3), 0 0 5px rgba(239, 68, 68, 0.2)" : "none"
          } : {}}
          className={cn(
            "flex items-center bg-black/60 border rounded-sm overflow-hidden",
            error ? "border-red-500" : "border-red-900/50 focus-within:border-red-700",
            className
          )}
        >
          {prefix && (
            <div className="pl-3 pr-1 text-red-500 font-mono flex items-center">
              {typeof prefix === "string" ? prefix : prefix}
            </div>
          )}
          
          {icon && (
            <div className="pl-3">
              {icon}
            </div>
          )}
          
          <input
            {...props}
            value={value as string}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
            className={cn(
              "bg-transparent w-full py-2 px-3 text-red-200 placeholder:text-red-900/70 font-mono text-sm focus:outline-none",
              props.disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="pr-3 text-red-500/70 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
        
        {error && (
          <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
        )}
      </div>
    </div>
  );
};
