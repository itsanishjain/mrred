"use client";

import React, { useEffect, useMemo, useState } from "react";

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [securityChecks, setSecurityChecks] = useState<{
    [key: string]: string;
  }>({});
  const [scanCoords, setScanCoords] = useState({ y1: 50, y2: 50 });
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulated security checks and progress
  useEffect(() => {
    const checks = [
      { name: "SYSTEM INTEGRITY", status: "VERIFIED" },
      { name: "NEURAL INTERFACE", status: "CONNECTED" },
      { name: "SECURITY PROTOCOLS", status: "ACTIVE" },
      { name: "QUANTUM ENCRYPTION", status: "ENABLED" },
      { name: "IDENTITY VERIFICATION", status: "PENDING" },
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
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 50);

    const scanInterval = setInterval(() => {
      const offset = 15 * Math.sin(Date.now() / 500);
      setScanCoords({ y1: 50 - offset, y2: 50 + offset });
    }, 50);

    return () => {
      clearInterval(checkInterval);
      clearInterval(progressInterval);
      clearInterval(scanInterval);
    };
  }, []);

  // Binary stream generated once
  const binaryStream = useMemo(() => {
    return [...Array(100)].map(() => Math.round(Math.random()));
  }, []);

  if (!mounted) return null; // Prevents SSR mismatch

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-red-500 p-4">
      <div className="w-64 h-64 relative mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3a0000"
            strokeWidth="1"
            className="opacity-30"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#ff0000"
            strokeWidth="1"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            className="transition-all duration-300 ease-linear"
            transform="rotate(-90 50 50)"
          />
          {[...Array(8)].map((_, i) => (
            <g
              key={i}
              className={`animate-pulse opacity-${i % 2 === 0 ? "70" : "40"}`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <path
                d={`M 50 50 L ${50 + 45 * Math.cos((i * Math.PI) / 4)} ${
                  50 + 45 * Math.sin((i * Math.PI) / 4)
                } A 45 45 0 0 1 ${
                  50 + 45 * Math.cos(((i + 1) * Math.PI) / 4)
                } ${50 + 45 * Math.sin(((i + 1) * Math.PI) / 4)} Z`}
                fill="#ff000015"
                stroke="#ff0000"
                strokeWidth="0.5"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            </g>
          ))}
          <polygon
            points="50,20 75,32.5 75,67.5 50,80 25,67.5 25,32.5"
            fill="none"
            stroke="#ff0000"
            strokeWidth="1"
            className="animate-pulse"
          />
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="#000"
            stroke="#ff0000"
            strokeWidth="1"
          />
          <text
            x="50"
            y="53"
            textAnchor="middle"
            fontSize="6"
            fill="#ff0000"
            fontWeight="bold"
            className="animate-pulse"
          >
            MR.RED
          </text>
          <line
            x1="25"
            y1={scanCoords.y1}
            x2="75"
            y2={scanCoords.y2}
            stroke="#ff0000"
            strokeWidth="0.5"
            className="animate-ping"
          />
          <text x="50" y="90" textAnchor="middle" fontSize="4" fill="#ff0000">
            INITIALIZATION: {progress}%
          </text>
        </svg>

        <div
          className="absolute top-0 left-0 w-full h-full animate-spin"
          style={{ animationDuration: "10s" }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-red-600 rounded-full"
              style={{
                top: `${50 + 48 * Math.sin((i * Math.PI) / 2)}%`,
                left: `${50 + 48 * Math.cos((i * Math.PI) / 2)}%`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-center space-y-4 max-w-md w-full">
        <h2 className="text-xl tracking-wider font-bold">
          INITIALIZING MR.RED
        </h2>

        <div className="overflow-hidden h-6 text-xs opacity-50 font-mono">
          <div className="animate-scroll whitespace-nowrap">
            {binaryStream.map((bit, i) => (
              <span
                key={i}
                className={i % 7 === 0 ? "text-red-500" : "text-red-900"}
              >
                {bit}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-md w-full px-4 py-2 border border-red-800/50 bg-black/80 text-xs">
          <p className="overflow-hidden whitespace-nowrap border-r-2 border-red-500 animate-typing">
            ESTABLISHING SECURE CONNECTION...
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-red-700 w-full max-w-md">
        {Object.entries(securityChecks).map(([name, status], index) => (
          <React.Fragment key={name}>
            <div
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {name}
            </div>
            <div
              className={`animate-fade-in ${
                ["VERIFIED", "ACTIVE", "CONNECTED", "ENABLED"].includes(status)
                  ? "text-green-500"
                  : status === "PENDING"
                  ? "text-yellow-500 animate-pulse"
                  : "text-red-500"
              }`}
              style={{ animationDelay: `${index * 0.2 + 0.1}s` }}
            >
              {status}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
