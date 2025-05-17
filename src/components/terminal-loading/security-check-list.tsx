import React from "react";
import { CheckCircle2, XCircle, Clock, Shield, Lock, Cpu, Database, Wifi, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

interface SecurityCheckListProps {
  checks: Record<string, string>;
}

export const SecurityCheckList: React.FC<SecurityCheckListProps> = ({
  checks,
}) => {
  // Map of icons for different security checks
  const getIcon = (name: string) => {
    if (name.includes("INTEGRITY") || name.includes("FIREWALL")) return Shield;
    if (name.includes("INTERFACE")) return Cpu;
    if (name.includes("PROTOCOLS") || name.includes("SECURE")) return Lock;
    if (name.includes("ENCRYPTION")) return Database;
    if (name.includes("NETWORK")) return Wifi;
    if (name.includes("IDENTITY") || name.includes("BIOMETRIC")) return Fingerprint;
    return Shield; // Default
  };

  return (
    <div className="space-y-3 text-xs">
      {Object.entries(checks).map(([name, status], index) => {
        const Icon = getIcon(name);
        const isPositive = status === "VERIFIED" || status === "ACTIVE" || status === "ENABLED" || status === "CONNECTED" || status === "COMPLETED";
        const isPending = status === "PENDING";
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black/40 border border-red-900/20 rounded-md p-2.5 shadow-inner"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center text-red-300">
                <Icon className="h-3.5 w-3.5 mr-2 text-red-400" />
                <span>{name}</span>
              </div>
              <div
                className={`flex items-center px-2 py-0.5 rounded-sm ${isPositive
                  ? "text-green-400 bg-green-900/30 border border-green-800/30"
                  : isPending
                  ? "text-yellow-400 bg-yellow-900/30 border border-yellow-800/30"
                  : "text-red-400 bg-red-900/30 border border-red-800/30"
                  }`}
              >
                {isPositive ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                    <span>{status}</span>
                  </>
                ) : isPending ? (
                  <>
                    <Clock className="h-3 w-3 mr-1.5 animate-pulse" />
                    <span>{status}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1.5" />
                    <span>{status}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
