import React from "react";
import { Check, AlertTriangle, Clock, Shield, Lock, Cpu, Database, Wifi, Fingerprint } from "lucide-react";

interface SecurityCheckListProps {
  checks: Record<string, string>;
}

export const SecurityCheckList: React.FC<SecurityCheckListProps> = ({ checks }) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
      case "CONNECTED":
      case "ACTIVE":
      case "ENABLED":
      case "COMPLETED":
        return <Check className="h-3.5 w-3.5 text-green-400" />;
      case "PENDING":
        return <Clock className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />;
      default:
        return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "VERIFIED":
      case "CONNECTED":
      case "ACTIVE":
      case "ENABLED":
      case "COMPLETED":
        return "text-green-400";
      case "PENDING":
        return "text-yellow-400";
      default:
        return "text-red-400";
    }
  };

  return (
    <div className="space-y-2">
      {Object.entries(checks).map(([name, status], index) => {
        const Icon = getIcon(name);
        
        return (
          <div
            key={name}
            className="flex items-center justify-between text-xs py-1.5 border-b border-red-900/10 last:border-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center">
              <Icon className="h-3.5 w-3.5 mr-2 text-red-400" />
              <span className="text-red-300">{name}</span>
            </div>
            <div className="flex items-center">
              <span className={`${getStatusClass(status)} font-bold mr-2`}>{status}</span>
              {getStatusIcon(status)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
