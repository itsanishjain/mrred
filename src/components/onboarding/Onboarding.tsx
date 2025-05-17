"use client";

import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { getPublicClient } from "@/lib/lens/client";
import {
  AlertTriangle,
  Shield,
  Fingerprint,
  Loader2,
  CheckCircle2,
  XCircle,
  Terminal,
  Wifi,
} from "lucide-react";

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
            setCurrentStep(2); // Move to registration step
          }
        } catch (error) {
          console.error("Error checking Lens profile:", error);
          setHasLensProfile(false);
          setErrorMessage("Error verifying identity. Retrying...");
          alarmSound.play();
        } finally {
          setIsLoading(false);
        }
      } else {
        setHasLensProfile(false);
        setIsLoading(false);
      }
    };

    if (isConnected && walletCheckStarted) {
      checkLensProfile();
    }
  }, [
    isConnected,
    address,
    walletCheckStarted,
    alarmSound,
    successSound,
    setCurrentStep,
    setHasLensProfile,
    setIsLoading,
    setErrorMessage,
  ]);

  // Handle registration process
  const handleRegistration = async () => {
    if (!isConnected) {
      setErrorMessage("WALLET CONNECTION REQUIRED");
      alarmSound.play();
      return;
    }

    setProcessingRegistration(true);
    setErrorMessage(null);

    try {
      await onboardUser();
      setRegistrationComplete(true);
      setCurrentStep(3); // Move to completion step
      successSound.play();
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("PROFILE CREATION FAILED: SYSTEM MALFUNCTION");
      alarmSound.play();
    } finally {
      setProcessingRegistration(false);
    }
  };

  // Scroll to bottom when step changes
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [currentStep, processingRegistration, registrationComplete, bootLines]);

  return (
    <div className="w-full">
      {/* Terminal Body */}
      <div className="font-mono text-red-300">
        {/* Boot Sequence */}
        <div className="">
          {bootLines.map((line, index) => (
            <div
              key={index}
              className={`${
                line?.includes("WARNING")
                  ? "text-yellow-500 font-bold"
                  : line?.includes("WALLET")
                  ? "text-cyan-400"
                  : "text-red-400"
              } flex items-start`}
            >
              <span className="mr-2 opacity-50">
                [{String(index).padStart(2, "0")}]
              </span>
              <span className="flex-1">{line}</span>
            </div>
          ))}

          {!bootSequenceComplete && (
            <div className="w-full h-2 bg-red-900/30 mt-4 overflow-hidden rounded-sm">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-150"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          )}

          {/* Show wallet initialization during boot sequence */}
          {walletInitialized && !bootSequenceComplete && (
            <div className="mt-4 p-3 border border-cyan-800/50 bg-cyan-900/10 rounded backdrop-blur-sm">
              <div className="text-cyan-400 text-sm flex items-center">
                <Wifi className="w-4 h-4 mr-2 animate-pulse" />
                WALLET INTERFACE INITIALIZING...
              </div>

              <div className="mt-2">
                <ConnectKitButton.Custom>
                  {({ isConnected, isConnecting, show }) => (
                    <div className="text-xs text-cyan-300/70">
                      {isConnecting ? (
                        <span className="animate-pulse">
                          ESTABLISHING CONNECTION...
                        </span>
                      ) : isConnected ? (
                        "CONNECTION ESTABLISHED"
                      ) : (
                        "PREPARING SECURE CONNECTION..."
                      )}
                    </div>
                  )}
                </ConnectKitButton.Custom>
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {bootSequenceComplete && (
          <div className="flex justify-between my-6 px-2">
            <div
              className={`flex flex-col items-center ${
                currentStep >= 1 ? "text-red-500" : "text-red-900"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 1 ? "border-red-500" : "border-red-900"
                } ${currentStep > 1 ? "bg-red-500 text-black" : ""}`}
              >
                1
              </div>
              <div className="mt-1 text-xs">CONNECT</div>
            </div>

            <div className="flex-1 self-center px-2">
              <div
                className={`h-0.5 ${
                  currentStep > 1 ? "bg-red-500" : "bg-red-900"
                }`}
              ></div>
            </div>

            <div
              className={`flex flex-col items-center ${
                currentStep >= 2 ? "text-red-500" : "text-red-900"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 2 ? "border-red-500" : "border-red-900"
                } ${currentStep > 2 ? "bg-red-500 text-black" : ""}`}
              >
                2
              </div>
              <div className="mt-1 text-xs">VERIFY</div>
            </div>

            <div className="flex-1 self-center px-2">
              <div
                className={`h-0.5 ${
                  currentStep > 2 ? "bg-red-500" : "bg-red-900"
                }`}
              ></div>
            </div>

            <div
              className={`flex flex-col items-center ${
                currentStep >= 3 ? "text-red-500" : "text-red-900"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 3 ? "border-red-500" : "border-red-900"
                } ${currentStep > 3 ? "bg-red-500 text-black" : ""}`}
              >
                3
              </div>
              <div className="mt-1 text-xs">ACCESS</div>
            </div>
          </div>
        )}

        {/* Step 1: Connect Wallet */}
        {bootSequenceComplete && currentStep === 1 && (
          <div className="space-y-4 mt-6">
            <div className="text-lg font-bold border-b border-red-800 pb-2 flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              IDENTITY VERIFICATION REQUIRED
            </div>

            <div className="text-yellow-500 font-bold flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              CONNECT YOUR DIGITAL WALLET TO PROCEED
            </div>

            <p className="text-sm">
              Your biometric data will be scanned and recorded for future
              reference.
            </p>

            <div className="my-4 h-16 w-full bg-red-900/20 flex items-center justify-center border border-red-800/50 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-scan"></div>
              <div className="text-xs flex items-center">
                <Fingerprint className="mr-2 h-4 w-4 animate-pulse" />
                BIOMETRIC SCAN IN PROGRESS
              </div>
            </div>

            <ConnectKitButton.Custom>
              {({ isConnected, isConnecting, show }) => (
                <button
                  onClick={() => {
                    show && show();
                    typewriterSound.play("type");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold border border-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors shadow-lg shadow-red-900/30"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      ESTABLISHING CONNECTION...
                    </span>
                  ) : isConnected ? (
                    <span className="flex items-center justify-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      CONNECTION ESTABLISHED
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Wifi className="mr-2 h-4 w-4" />
                      INITIATE WALLET CONNECTION
                    </span>
                  )}
                </button>
              )}
            </ConnectKitButton.Custom>

            <p className="text-sm mt-4">
              {isConnected ? (
                <span className="text-green-500 flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  WALLET CONNECTED. VERIFYING CREDENTIALS...
                </span>
              ) : (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  AWAITING CONNECTION. TIMEOUT IN 120 SECONDS.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Step 2: Register Profile */}
        {bootSequenceComplete && currentStep === 2 && (
          <div className="space-y-4 mt-6">
            <div className="text-lg font-bold border-b border-red-800 pb-2 flex items-center">
              <Fingerprint className="mr-2 h-5 w-5" />
              DIGITAL IDENTITY CREATION
            </div>

            <div className="text-yellow-500 font-bold flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              NO EXISTING PROFILE DETECTED
            </div>

            <p className="text-sm">
              You must register your digital identity to access the system.
            </p>

            <div className="p-3 border border-red-800/50 bg-red-900/10 rounded text-sm">
              <p className="text-red-300">
                This process is irreversible. Your data will be permanently
                recorded on the blockchain.
              </p>

              <div className="mt-2 flex items-center text-xs text-red-400">
                <AlertTriangle className="mr-2 h-3 w-3" />
                By proceeding, you consent to all terms and conditions.
              </div>
            </div>

            <button
              onClick={() => {
                handleRegistration();
                typewriterSound.play("type");
              }}
              className="w-full py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold border border-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors shadow-lg shadow-red-900/30"
              disabled={processingRegistration}
            >
              {processingRegistration ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  CREATING DIGITAL IDENTITY...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Fingerprint className="mr-2 h-4 w-4" />
                  INITIATE PROFILE CREATION
                </span>
              )}
            </button>

            {processingRegistration && (
              <div className="w-full h-2 bg-red-900/30 mt-4 overflow-hidden rounded-sm">
                <div className="h-full bg-red-600 animate-pulse w-full"></div>
              </div>
            )}

            {errorMessage && (
              <div className="text-yellow-500 border border-yellow-500 p-3 mt-4 bg-yellow-500/10 rounded flex items-start">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Complete */}
        {bootSequenceComplete && currentStep === 3 && (
          <div className="space-y-4 mt-6">
            <div className="text-lg font-bold border-b border-green-800 pb-2 text-green-500 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              IDENTITY VERIFICATION COMPLETE
            </div>

            <div className="text-green-500 font-bold flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              ACCESS GRANTED
            </div>

            <div className="p-4 border border-green-800/50 bg-green-900/10 rounded">
              <p className="text-sm">
                Your digital identity has been verified and recorded in the
                central database.
              </p>

              <p className="text-sm mt-2">
                You now have access to the MR.RED terminal system.
              </p>

              <div className="mt-4 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            <a
              href="/"
              className="block w-full py-3 bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white font-bold border border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors text-center shadow-lg shadow-green-900/30"
            >
              PROCEED TO TERMINAL
            </a>

            <div className="text-yellow-500 text-sm mt-4 border border-yellow-500/50 p-3 bg-yellow-500/10 rounded flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                WARNING: ALL ACTIONS WITHIN THE TERMINAL ARE MONITORED AND
                RECORDED
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
