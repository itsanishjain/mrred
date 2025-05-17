"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { SecurityCheckList } from "./security-check-list";
import { BinaryStream } from "./binary-stream";
import { ProgressCircle } from "./progress-circle";

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [securityChecks, setSecurityChecks] = useState<Record<string, string>>(
    {}
  );
  const [scanCoords, setScanCoords] = useState({ y1: 50, y2: 50 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checks = [
      { name: "SYSTEM INTEGRITY", status: "VERIFIED" },
      { name: "NEURAL INTERFACE", status: "CONNECTED" },
      { name: "SECURITY PROTOCOLS", status: "ACTIVE" },
      { name: "QUANTUM ENCRYPTION", status: "ENABLED" },
      { name: "IDENTITY VERIFICATION", status: "PENDING" },
      { name: "BIOMETRIC SCAN", status: "COMPLETED" },
      { name: "NETWORK SECURE", status: "ACTIVE" },
      { name: "FIREWALL", status: "ENABLED" },
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

    const scanInterval = setInterval(() => {
      setScanCoords(calculateScanCoordinates(50, 15));
    }, 50);

    return () => {
      clearInterval(checkInterval);
      clearInterval(progressInterval);
      clearInterval(scanInterval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-red-500 overflow-hidden relative">
      {/* Background Matrix Effect */}
      <div className="fixed inset-0 opacity-20">
        <BinaryStream length={200} className="h-screen" />
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Left Panel */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1 flex flex-col gap-4"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 h-full shadow-lg md:h-[calc(100vh-4rem)]">
            <h3 className="text-sm font-bold mb-4 border-b border-red-500/10 pb-2">
              SYSTEM DIAGNOSTICS
            </h3>
            <div className="space-y-4">
              <TypeAnimation
                sequence={[
                  "> Initializing core systems...",
                  1000,
                  "> Running security protocols...",
                  1000,
                  "> Establishing neural links...",
                  1000,
                  "> Scanning for threats...",
                  1000,
                  "> Optimizing performance...",
                  1000,
                ]}
                wrapper="div"
                speed={50}
                className="font-mono text-xs"
                repeat={Infinity}
              />
            </div>
          </div>
        </motion.div>

        {/* Center Panel */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-1 flex flex-col items-center justify-center gap-8"
        >
          <motion.h1 className="text-4xl font-bold tracking-widest text-center text-red-500">
            MR.RED
          </motion.h1>

          {/* <ProgressCircle progress={progress} scanCoords={scanCoords} /> */}

          <div className="w-full">
            <BinaryStream className="opacity-50" />
          </div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1 flex flex-col gap-4"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h3 className="text-sm font-bold mb-4 border-b border-red-500/10 pb-2">
              SECURITY VERIFICATION
            </h3>
            <SecurityCheckList checks={securityChecks} />
          </div>
        </motion.div>
      </div>

      {/* Bottom Status Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 shadow-md"
      >
        <div className="flex justify-between items-center text-[10px] text-red-700 max-w-7xl mx-auto px-4">
          <span>MR.RED v2.0.25</span>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1 w-1 bg-red-700 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
          <span>{new Date().toISOString().split("T")[0]}</span>
        </div>
      </motion.div>
    </div>
  );
};

function calculateScanCoordinates(baseY: number, amplitude: number) {
  const offset = amplitude * Math.sin(Date.now() / 500);
  return {
    y1: baseY - offset,
    y2: baseY + offset,
  };
}
