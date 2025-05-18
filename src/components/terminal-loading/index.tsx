"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { SecurityCheckList } from "./security-check-list";
import { BinaryStream } from "./binary-stream";
import { ProgressCircle } from "./progress-circle";
import Onboarding from "@/components/onboarding/Onboarding";
import {
  Terminal,
  Shield,
  Lock,
  Cpu,
  Database,
  Wifi,
  Server,
  HardDrive,
  Fingerprint,
  AlertTriangle,
  Check,
  Power,
} from "lucide-react";

export const LoadingScreen: React.FC<{ onboardUser: () => Promise<void> }> = ({
  onboardUser,
}) => {
  // State management
  const [progress, setProgress] = useState(0);
  const [securityChecks, setSecurityChecks] = useState<Record<string, string>>(
    {}
  );
  const [mounted, setMounted] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [systemStatus, setSystemStatus] = useState("INITIALIZING");
  const [bootPhase, setBootPhase] = useState(0);
  const [showBootMessages, setShowBootMessages] = useState(true);

  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);

  // Boot sequence and initialization
  useEffect(() => {
    setMounted(true);

    // Boot sequence
    const bootSequence = () => {
      // Phase 0: Initial boot
      setTimeout(() => {
        setBootPhase(1); // System check
        setSystemStatus("SYSTEM CHECK");
      }, 1000);

      // Phase 1: Security verification
      setTimeout(() => {
        setBootPhase(2);
        setSystemStatus("SECURITY VERIFICATION");
      }, 3000);

      // Phase 2: Interface initialization
      setTimeout(() => {
        setBootPhase(3);
        setSystemStatus("INTERFACE INITIALIZATION");
      }, 5000);

      // Phase 3: System online
      setTimeout(() => {
        setBootPhase(4);
        setSystemStatus("ONLINE");
        setShowBootMessages(false);
      }, 7000);
    };

    bootSequence();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, Math.random() * 5000 + 3000);

    // Auto-scroll terminal if ref exists
    if (terminalRef.current) {
      const scrollInterval = setInterval(() => {
        if (terminalRef.current && bootPhase < 4) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 500);

      return () => {
        clearInterval(timeInterval);
        clearInterval(glitchInterval);
        clearInterval(scrollInterval);
      };
    }

    return () => {
      clearInterval(timeInterval);
      clearInterval(glitchInterval);
    };
  }, [bootPhase]);

  // Security checks initialization
  useEffect(() => {
    const checks = [
      { name: "SYSTEM INTEGRITY", status: "VERIFIED", icon: Shield },
      { name: "NEURAL INTERFACE", status: "CONNECTED", icon: Cpu },
      { name: "SECURITY PROTOCOLS", status: "ACTIVE", icon: Lock },
      { name: "QUANTUM ENCRYPTION", status: "ENABLED", icon: Database },
      { name: "IDENTITY VERIFICATION", status: "PENDING", icon: Fingerprint },
      { name: "BIOMETRIC SCAN", status: "COMPLETED", icon: Fingerprint },
      { name: "NETWORK SECURE", status: "ACTIVE", icon: Wifi },
      { name: "FIREWALL", status: "ENABLED", icon: Shield },
    ];

    let currentCheck = 0;
    const checkInterval = setInterval(() => {
      if (currentCheck < checks.length) {
        const check = checks[currentCheck];
        setSecurityChecks((prev) => ({ ...prev, [check.name]: check.status }));
        currentCheck++;
      } else {
        clearInterval(checkInterval);
      }
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 2;
        return next >= 100 ? 100 : next;
      });
    }, 100);

    return () => {
      clearInterval(checkInterval);
      clearInterval(progressInterval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen bg-black relative ${
        glitchEffect ? "glitch-content" : ""
      }`}
    >
      {/* Background grid and effects - using pointer-events-none to ensure they don't block interactions */}
      <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-5 z-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-0"></div>

      {/* Terminal Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-gradient-to-r from-red-950 to-red-900 p-3 flex items-center justify-between border-b border-red-800 relative z-10 shadow-lg shadow-red-950/50"
      >
        <div className="flex items-center space-x-3">
          <Terminal className="h-5 w-5 text-red-300 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]" />
          <span className="text-red-100 font-mono text-lg tracking-wider bg-gradient-to-r from-red-300 to-red-100 bg-clip-text text-transparent">
            MR.RED TERMINAL v3.0
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
          </div>
          <div className="hidden md:flex items-center text-red-300 text-xs">
            <span>{currentTime}</span>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-bold flex items-center ${
              systemStatus === "ONLINE"
                ? "bg-red-500/20 text-red-400"
                : "bg-red-900/30 text-red-500"
            }`}
          >
            {systemStatus === "ONLINE" ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {systemStatus}
          </div>
        </div>
      </motion.div>

      {/* Boot sequence messages - only shown during boot phases */}
      <AnimatePresence>
        {showBootMessages && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black border-b border-red-900/30 overflow-hidden"
          >
            <div
              ref={terminalRef}
              className="font-mono text-xs text-red-500/80 p-3 max-h-32 overflow-y-auto"
            >
              <TypeAnimation
                sequence={[
                  "Initializing MR.RED security protocol...",
                  500,
                  "Initializing MR.RED security protocol...\nLoading kernel modules...",
                  500,
                  "Initializing MR.RED security protocol...\nLoading kernel modules...\nVerifying system integrity...",
                  500,
                  "Initializing MR.RED security protocol...\nLoading kernel modules...\nVerifying system integrity...\nEstablishing secure connection...",
                  500,
                  "Initializing MR.RED security protocol...\nLoading kernel modules...\nVerifying system integrity...\nEstablishing secure connection...\nInitializing neural interface...",
                  500,
                  "Initializing MR.RED security protocol...\nLoading kernel modules...\nVerifying system integrity...\nEstablishing secure connection...\nInitializing neural interface...\nSetting up encryption protocols...",
                ]}
                wrapper="div"
                cursor={true}
                repeat={0}
                style={{ whiteSpace: "pre-line" }}
                speed={50}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-56px)]">
        {/* Left Panel */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-full md:w-[25%] p-4"
        >
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-red-900/20 h-full">
              <div className="flex items-center justify-between mb-4 border-b border-red-800/30 pb-3">
                <h3 className="text-sm font-bold text-red-300 flex items-center">
                  <Server className="mr-2 h-4 w-4" />
                  SYSTEM DIAGNOSTICS
                </h3>
                <div
                  className={`text-xs px-2 py-0.5 rounded ${
                    progress >= 100
                      ? "bg-red-500/20 text-red-400"
                      : "bg-red-900/30 text-red-500 animate-pulse"
                  }`}
                >
                  {progress >= 100 ? "COMPLETE" : "IN PROGRESS"}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <ProgressCircle
                    progress={progress}
                    size={120}
                    glowEffect={true}
                    label="SYSTEM INITIALIZATION"
                    className="mb-3"
                  />

                  <div className="w-full mt-4 space-y-3">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-red-300/80">
                        <div className="flex items-center">
                          <Cpu className="h-3.5 w-3.5 mr-2" />
                          PROCESSOR LOAD
                        </div>
                        <div>{Math.floor(Math.random() * 20 + 30)}%</div>
                      </div>
                      <div className="w-full h-1.5 bg-red-950/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-700 to-red-500 w-[35%]"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-red-300/80">
                        <div className="flex items-center">
                          <HardDrive className="h-3.5 w-3.5 mr-2" />
                          DISK USAGE
                        </div>
                        <div>{Math.floor(Math.random() * 30 + 40)}%</div>
                      </div>
                      <div className="w-full h-1.5 bg-red-950/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-700 to-red-500 w-[65%]"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-red-300/80">
                        <div className="flex items-center">
                          <Database className="h-3.5 w-3.5 mr-2" />
                          MEMORY ALLOCATION
                        </div>
                        <div>{Math.floor(Math.random() * 30 + 70)}%</div>
                      </div>
                      <div className="w-full h-1.5 bg-red-950/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-700 to-red-500 w-[85%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center Panel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-full md:w-[50%] flex flex-col p-4"
        >
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-md relative z-30">
              <Onboarding onboardUser={onboardUser} />
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="w-full md:w-[25%] p-4"
        >
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-red-900/20 h-full">
              <div className="flex items-center justify-between mb-4 border-b border-red-800/30 pb-3">
                <h3 className="text-sm font-bold text-red-300 flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  SECURITY VERIFICATION
                </h3>
                <div className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  SECURE
                </div>
              </div>
              <SecurityCheckList checks={securityChecks} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Binary Stream Footer */}
      <div className="w-full overflow-hidden h-6 border-t border-red-900/20">
        <BinaryStream
          className="opacity-70"
          length={200}
          density={5}
          height={1}
        />
      </div>

      {/* Terminal Footer */}
      <div className="bg-gradient-to-r from-red-950 to-red-900 px-4 py-2 text-xs border-t border-red-800 relative z-10 shadow-lg flex justify-between items-center text-red-300">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            <span>ENCRYPTED</span>
          </div>
          <div className="hidden md:flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            <span>SECURITY LEVEL: {Math.floor(progress)}%</span>
          </div>
        </div>
        <div className="flex items-center">
          <Wifi className="h-3 w-3 mr-1" />
          <span>SECURE CONNECTION</span>
          <span className="animate-pulse ml-1">█</span>
        </div>
      </div>
    </div>
  );
};
