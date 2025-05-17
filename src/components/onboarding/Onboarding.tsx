"use client";

import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { getPublicClient } from "@/lib/lens/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  Fingerprint,
  Loader2,
  CheckCircle2,
  XCircle,
  Terminal,
  Wifi,
  Lock,
  Key,
  Database,
  Cpu,
} from "lucide-react";
import { OnboardingTerminal } from "./onboarding-terminal";
import { TypeAnimation } from "react-type-animation";

interface OnboardingProps {
  onboardUser: () => Promise<void>;
}

export default function Onboarding({ onboardUser }: OnboardingProps) {
  // State management
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasLensProfile, setHasLensProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRegistration, setProcessingRegistration] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [walletInitialized, setWalletInitialized] = useState(false);
  const [walletCheckStarted, setWalletCheckStarted] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  // Refs
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Get wallet connection status
  const { isConnected, address } = useAccount();

  // Sound effects
  const typewriterSound = new Howl({
    src: ["/assets/typewriter.wav"],
    sprite: {
      type: [0, 100],
    },
  });

  const alarmSound = new Howl({
    src: ["/assets/typewriter.wav"], // Replace with actual alarm sound
    volume: 0.3,
  });

  const successSound = new Howl({
    src: ["/assets/typewriter.wav"], // Replace with actual success sound
    volume: 0.5,
  });

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 150);
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Boot sequence animation with integrated wallet initialization
  useEffect(() => {
    const bootMessages = [
      "INITIALIZING SYSTEM...",
      "LOADING SECURITY PROTOCOLS...",
      "PREPARING IDENTITY VERIFICATION...",
      "INITIALIZING WALLET INTERFACE...",
      "WARNING: UNAUTHORIZED ACCESS WILL RESULT IN IMMEDIATE TERMINATION",
    ];

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < bootMessages.length) {
        setBootLines((prev) => [...prev, bootMessages[currentIndex]]);
        typewriterSound.play("type");

        // Start wallet initialization when we reach that step
        if (bootMessages[currentIndex].includes("INITIALIZING WALLET")) {
          setWalletInitialized(true);
        }

        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBootSequenceComplete(true);
          setCurrentStep(1); // Move to connection step after boot
          setWalletCheckStarted(true);
        }, 1000);
      }
    }, 600); // Slightly faster to keep engagement

    return () => clearInterval(interval);
  }, []);

  // Loading bar animation
  useEffect(() => {
    if (bootSequenceComplete) return;

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + 3; // Slower progress to match the longer boot sequence
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [bootSequenceComplete]);

  // Check if user has a Lens profile
  useEffect(() => {
    const checkLensProfile = async () => {
      if (isConnected && address) {
        try {
          setIsLoading(true);
          const client = getPublicClient();

          // Use the client to check if the user has a profile
          const resumed = await client.resumeSession();
          if (resumed.isOk()) {
            // If session can be resumed, user likely has a profile
            setHasLensProfile(true);
            setCurrentStep(3); // Skip to completion step
            successSound.play();
          } else {
            setHasLensProfile(false);
            setCurrentStep(2); // Move to profile creation step
          }
        } catch (error) {
          console.error("Error checking Lens profile:", error);
          setHasLensProfile(false);
          setCurrentStep(2); // Move to profile creation step
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (walletCheckStarted && isConnected) {
      checkLensProfile();
    }
  }, [walletCheckStarted, isConnected, address]);

  // Scroll to bottom of terminal when new content is added
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

      // If successful, move to completion step
      setRegistrationComplete(true);
      setCurrentStep(3);
      successSound.play();
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(
        error.message || "ERROR: PROFILE CREATION FAILED. PLEASE TRY AGAIN."
      );
      alarmSound.play();
    } finally {
      setProcessingRegistration(false);
    }
  };

  return (
    <OnboardingTerminal ref={terminalBodyRef}>
      <div
        className={`min-h-[500px] max-w-md mx-auto p-6 font-mono text-red-400 relative ${
          glitchEffect ? "glitch-text" : ""
        }`}
      >
        {/* Overlay for boot sequence */}
        <AnimatePresence>
          {!bootSequenceComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm z-10 flex flex-col justify-center p-6"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center mb-6"
              >
                <div className="h-5 w-5 bg-red-500 mr-3 animate-pulse rounded-sm"></div>
                <div className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                  MR.RED SECURITY PROTOCOL
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 space-y-2"
              >
                {bootLines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`text-sm ${
                      line?.includes("WARNING")
                        ? "text-yellow-400 font-bold"
                        : "text-red-300"
                    } mb-1 flex items-start`}
                  >
                    <span className="text-red-500 mr-2">{">"}</span>
                    {line}
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full h-2 bg-red-900/30 overflow-hidden rounded-sm backdrop-blur-sm border border-red-800/30"
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  className="h-full bg-gradient-to-r from-red-700 to-red-500 relative"
                >
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-scanline opacity-30"></div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-red-400 mt-3 flex justify-between items-center"
              >
                <span>INITIALIZING SYSTEM...</span>
                <span className="font-bold">{loadingProgress}%</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`space-y-6 ${
            !bootSequenceComplete
              ? "opacity-0"
              : "opacity-100 transition-opacity duration-500"
          }`}
        >
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className="text-lg font-bold border-b border-red-800/50 pb-2 flex items-center">
              <Terminal className="mr-2 h-5 w-5 text-red-300" />
              <span className="bg-gradient-to-r from-red-300 to-red-200 bg-clip-text text-transparent">
                MR.RED IDENTITY VERIFICATION
              </span>
            </div>
            {walletCheckStarted && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className={`text-xs px-3 py-1.5 rounded-md flex items-center ${
                  isConnected
                    ? "bg-green-900/30 text-green-400 border border-green-800/50"
                    : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                }`}
              >
                <Wifi className="mr-2 h-3 w-3" />
                {isConnected ? "CONNECTED" : "DISCONNECTED"}
              </motion.div>
            )}
          </motion.div>

          {/* Step 1: Connect Wallet */}
          <AnimatePresence>
            {bootSequenceComplete && currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                <div className="text-sm leading-relaxed">
                  <TypeAnimation
                    sequence={[
                      "IDENTITY VERIFICATION REQUIRED. PLEASE CONNECT YOUR DIGITAL WALLET TO PROCEED.",
                      1000,
                    ]}
                    wrapper="p"
                    speed={50}
                    cursor={false}
                    className="mb-3"
                  />
                  <p className="text-red-300/80">
                    YOUR DIGITAL IDENTITY WILL BE SECURELY VERIFIED THROUGH THE
                    BLOCKCHAIN NETWORK.
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-5 border border-red-800/50 bg-gradient-to-b from-red-950/50 to-red-900/20 rounded-lg shadow-inner backdrop-blur-sm"
                >
                  <div className="flex items-center text-sm mb-4 border-b border-red-800/30 pb-3">
                    <Lock className="h-4 w-4 mr-2 text-red-400" />
                    <span className="text-red-300">
                      SECURITY PROTOCOL: WALLET CONNECTION REQUIRED
                    </span>
                  </div>

                  <div className="flex justify-center py-2">
                    <ConnectKitButton />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-yellow-400 text-xs border border-yellow-500/30 p-4 bg-yellow-950/20 rounded-md flex items-start backdrop-blur-sm"
                >
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-yellow-500" />
                  <div>
                    WARNING: ONLY CONNECT IF YOU TRUST THIS APPLICATION. YOUR
                    WALLET CREDENTIALS WILL NEVER BE STORED.
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Create Profile */}
          <AnimatePresence>
            {bootSequenceComplete && currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-bold border-b border-red-800/50 pb-2 flex items-center"
                >
                  <Fingerprint className="mr-2 h-5 w-5 text-red-300" />
                  <span className="bg-gradient-to-r from-red-300 to-red-200 bg-clip-text text-transparent">
                    DIGITAL IDENTITY CREATION
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm leading-relaxed"
                >
                  <p className="mb-3 text-green-400 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    WALLET CONNECTED. PROCEED WITH DIGITAL IDENTITY CREATION.
                  </p>
                  <p className="text-red-300/80">
                    THIS PROCESS WILL REGISTER YOUR EXISTENCE IN THE
                    DECENTRALIZED NETWORK.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-5 border border-red-800/50 bg-gradient-to-b from-red-950/50 to-red-900/20 rounded-lg shadow-inner backdrop-blur-sm"
                >
                  <div className="flex items-center mb-4 border-b border-red-800/30 pb-3">
                    <Database className="h-4 w-4 mr-2 text-red-400" />
                    <span className="text-red-300 text-sm">
                      BLOCKCHAIN REGISTRATION
                    </span>
                  </div>

                  <p className="text-sm mb-4 text-red-300/90">
                    This process is irreversible. Your data will be permanently
                    recorded on the blockchain.
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
          </AnimatePresence>

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
                    Your digital identity has been verified and recorded in the
                    central database.
                  </p>

                  <p className="text-sm mt-3 text-green-300/90">
                    You now have access to the MR.RED terminal system.
                  </p>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
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

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-yellow-400 text-sm mt-4 border border-yellow-500/30 p-4 bg-yellow-950/20 rounded-md flex items-start backdrop-blur-sm"
                >
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-yellow-500" />
                  <div>
                    WARNING: ALL ACTIONS WITHIN THE TERMINAL ARE MONITORED AND
                    RECORDED
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </OnboardingTerminal>
  );
}
