"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import {
  Terminal as TerminalIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Database,
  Key,
  Loader2,
} from "lucide-react";
import { OnboardingTerminal } from "./onboarding-terminal";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

interface OnboardingProps {
  onboardUser: () => Promise<void>;
}

// Sound effects
const typewriterSound = new Howl({
  src: ["/sounds/typewriter.mp3"],
  sprite: {
    type: [0, 300],
  },
  volume: 0.5,
});

const bootSound = new Howl({
  src: ["/sounds/boot.mp3"],
  volume: 0.5,
});

export default function Onboarding({ onboardUser }: OnboardingProps) {
  // State management
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasLensProfile, setHasLensProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRegistration, setProcessingRegistration] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bootLines, setBootLines] = useState<string[]>([]);

  // Refs
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Wallet connection
  const { isConnected, address } = useAccount();

  // Boot sequence lines
  const bootSequence = [
    "INITIALIZING SYSTEM...",
    "LOADING KERNEL MODULES...",
    "CHECKING HARDWARE COMPATIBILITY...",
    "ESTABLISHING SECURE CONNECTION...",
    "INITIALIZING MEMORY ALLOCATION...",
    "LOADING ENCRYPTION PROTOCOLS...",
    "VERIFYING SYSTEM INTEGRITY...",
    "INITIALIZING NEURAL INTERFACE...",
    "LOADING USER AUTHENTICATION MODULE...",
    "SYSTEM READY.",
  ];

  // Check if user has a Lens profile
  const checkLensProfile = async () => {
    if (isConnected && address) {
      // Check if user has a profile
      // This is a placeholder for the actual check
      // In a real app, you would query the Lens API here
      setHasLensProfile(false);
      setIsLoading(false);
    }
  };

  // Initialize boot sequence
  useEffect(() => {
    let bootInterval: NodeJS.Timeout;

    if (isConnected) {
      bootSound.play();

      let lineIndex = 0;
      bootInterval = setInterval(() => {
        if (lineIndex < bootSequence.length) {
          setBootLines((prev) => [...prev, bootSequence[lineIndex]]);
          typewriterSound.play("type");
          lineIndex++;
        } else {
          clearInterval(bootInterval);
          setBootSequenceComplete(true);
          checkLensProfile();
        }
      }, 500);
    } else {
      setBootSequenceComplete(true);
      setIsLoading(false);
    }

    return () => {
      if (bootInterval) clearInterval(bootInterval);
    };
  }, [isConnected]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [bootLines, currentStep, processingRegistration, errorMessage]);

  // Handle registration process
  const handleRegistration = async () => {
    try {
      setProcessingRegistration(true);
      setErrorMessage(null);
      typewriterSound.play("type");

      // Call the onboarding function from parent component
      await onboardUser();

      // If successful, move to next step
      setRegistrationComplete(true);
      setCurrentStep(3);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("ERROR: IDENTITY VERIFICATION FAILED. PLEASE TRY AGAIN.");
    } finally {
      setProcessingRegistration(false);
    }
  };

  return (
    <OnboardingTerminal>
      <div className="p-1 md:p-2">
        <div className="space-y-4">
          {/* Terminal Header */}
          <div className="flex items-center justify-between border-b border-red-800/30 pb-3">
            <div className="flex items-center">
              <TerminalIcon className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-400 font-bold text-sm">
                MR.RED IDENTITY VERIFICATION v2.0
              </span>
            </div>
            <div className="text-xs text-red-400/70">
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalBodyRef}
            className="font-mono text-xs space-y-1 h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent pr-2"
          >
            {/* Boot Sequence */}
            {bootLines.map((line, index) => (
              <div
                key={index}
                className={`${
                  line.includes("ERROR")
                    ? "text-red-500"
                    : line.includes("READY")
                    ? "text-green-500"
                    : line.includes("WARNING")
                    ? "text-yellow-500"
                    : "text-red-400"
                }`}
              >
                <span className="text-red-600 mr-2">{">"}</span>
                {line}
              </div>
            ))}

            {/* Connection Status */}
            {bootSequenceComplete && !isLoading && (
              <>
                {isConnected ? (
                  <div className="text-green-500">
                    <span className="text-red-600 mr-2">{">"}</span>
                    WALLET CONNECTED: {address?.slice(0, 6)}...
                    {address?.slice(-4)}
                  </div>
                ) : (
                  <div className="text-yellow-500">
                    <span className="text-red-600 mr-2">{">"}</span>
                    NO WALLET CONNECTED. PLEASE CONNECT TO CONTINUE.
                  </div>
                )}
              </>
            )}

            {/* Registration Process */}
            {processingRegistration && (
              <>
                <div className="text-red-400">
                  <span className="text-red-600 mr-2">{">"}</span>
                  INITIALIZING IDENTITY VERIFICATION PROCESS...
                </div>
                <div className="text-red-400">
                  <span className="text-red-600 mr-2">{">"}</span>
                  CREATING DIGITAL IDENTITY...
                </div>
                <div className="text-red-400">
                  <span className="text-red-600 mr-2">{">"}</span>
                  RECORDING IDENTITY ON BLOCKCHAIN...
                </div>
              </>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="text-red-500">
                <span className="text-red-600 mr-2">{">"}</span>
                {errorMessage}
              </div>
            )}

            {/* Registration Complete */}
            {registrationComplete && (
              <>
                <div className="text-green-500">
                  <span className="text-red-600 mr-2">{">"}</span>
                  IDENTITY VERIFICATION COMPLETE
                </div>
                <div className="text-green-500">
                  <span className="text-red-600 mr-2">{">"}</span>
                  ACCESS GRANTED
                </div>
                <div className="text-green-500">
                  <span className="text-red-600 mr-2">{">"}</span>
                  PROFILE CREATED
                </div>
              </>
            )}
          </div>

          {/* Terminal Content */}
          <div className="mt-4">
            {/* Step 0: Not Connected */}
            {bootSequenceComplete && !isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-6 p-4 rounded-full bg-red-950/30 border border-red-800/50"
                >
                  <TerminalIcon className="h-10 w-10 text-red-500" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-bold text-red-400 mb-2"
                >
                  CONNECT YOUR WALLET
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-red-400/80 text-center mb-6"
                >
                  Connect your wallet to verify your identity and access the
                  MR.RED terminal.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full"
                >
                  <ConnectKitButton.Custom>
                    {({ isConnected, show }) => {
                      return (
                        <button
                          onClick={show}
                          className="w-full py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold border border-red-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all shadow-lg shadow-red-900/30"
                        >
                          CONNECT WALLET
                        </button>
                      );
                    }}
                  </ConnectKitButton.Custom>
                </motion.div>
              </motion.div>
            )}

            {/* Step 1: Connected, No Profile */}
            {bootSequenceComplete &&
              isConnected &&
              !isLoading &&
              !hasLensProfile &&
              currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold border-b border-red-800/50 pb-2 text-red-400"
                  >
                    IDENTITY VERIFICATION REQUIRED
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 border border-red-800/50 bg-gradient-to-b from-red-950/30 to-red-900/10 rounded-lg shadow-inner backdrop-blur-sm"
                  >
                    <p className="text-sm mb-4 text-red-300/90">
                      This process is irreversible. Your data will be
                      permanently recorded on the blockchain.
                    </p>

                    <div className="mt-3 flex items-center text-xs text-red-400/80 border-t border-red-800/30 pt-3">
                      <AlertTriangle className="mr-2 h-3 w-3 text-yellow-500" />
                      By proceeding, you consent to all terms and conditions.
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleRegistration();
                      typewriterSound.play("type");
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold border border-red-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all shadow-lg shadow-red-900/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={processingRegistration}
                  >
                    {processingRegistration ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        CREATING DIGITAL IDENTITY...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Key className="mr-2 h-4 w-4" />
                        INITIATE PROFILE CREATION
                      </span>
                    )}
                  </motion.button>

                  {processingRegistration && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="w-full h-2 bg-red-900/30 mt-4 overflow-hidden rounded-md backdrop-blur-sm border border-red-800/30"
                    >
                      <div className="h-full bg-gradient-to-r from-red-700 to-red-500 animate-pulse w-full relative">
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-scanline opacity-30"></div>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-yellow-400 border border-yellow-500/30 p-4 mt-4 bg-yellow-950/20 rounded-md flex items-start backdrop-blur-sm"
                      >
                        <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-yellow-500" />
                        <div>{errorMessage}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

            {/* Step 3: Complete */}
            <AnimatePresence>
              {bootSequenceComplete && currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5 mt-6"
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold border-b border-green-800/50 pb-2 text-green-400 flex items-center"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    <span className="bg-gradient-to-r from-green-300 to-green-200 bg-clip-text text-transparent">
                      IDENTITY VERIFICATION COMPLETE
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-green-400 font-bold flex items-center"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    ACCESS GRANTED
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-5 border border-green-800/50 bg-gradient-to-b from-green-950/30 to-green-900/10 rounded-lg shadow-inner backdrop-blur-sm"
                  >
                    <div className="flex items-center mb-4 border-b border-green-800/30 pb-3">
                      <Database className="h-4 w-4 mr-2 text-green-400" />
                      <span className="text-green-300 text-sm">
                        PROFILE CREATED
                      </span>
                    </div>

                    <p className="text-sm text-green-300/90">
                      Your digital identity has been verified and recorded in
                      the central database.
                    </p>

                    <p className="text-sm mt-3 text-green-300/90">
                      You now have access to the MR.RED terminal system.
                    </p>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.6,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="mt-6 flex items-center justify-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-900/30 border border-green-500/50 flex items-center justify-center shadow-lg shadow-green-900/20">
                        <CheckCircle2 className="h-10 w-10 text-green-400" />
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.a
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/"
                    className="block w-full py-3.5 bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white font-bold border border-green-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all text-center shadow-lg shadow-green-900/30"
                  >
                    PROCEED TO TERMINAL
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </OnboardingTerminal>
  );
}
