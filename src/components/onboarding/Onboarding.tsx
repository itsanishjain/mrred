"use client";

import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { getPublicClient } from "@/lib/lens/client";
import { OnboardingTerminal } from "./onboarding-terminal";

export default function OnboardingPage({ onboardUser }: OnboardingProps) {
  return (
    <div className="min-h-screen bg-black">
      <Onboarding onboardUser={onboardUser} />
    </div>
  );
}

interface OnboardingProps {
  onboardUser: () => Promise<void>;
}

function Onboarding({ onboardUser }: OnboardingProps) {
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
      "ESTABLISHING SECURE CONNECTION...",
      "ACCESSING CENTRAL DATABASE...",
      "INITIALIZING WALLET CONNECTION...",
      "PREPARING IDENTITY VERIFICATION...",
      "WARNING: UNAUTHORIZED ACCESS WILL RESULT IN IMMEDIATE TERMINATION",
    ];

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < bootMessages.length) {
        setBootLines((prev) => [...prev, bootMessages[currentIndex]]);

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
  }, [isConnected, address, walletCheckStarted, alarmSound, successSound]);

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
    <div className="w-full h-screen">
      <div className="absolute top-0 left-0 right-0 text-center z-10 pointer-events-none">
        <div className="inline-block px-4 py-1 bg-red-800 text-white font-mono text-xs tracking-widest border border-red-600 rounded-md">
          CLASSIFIED
        </div>
      </div>

      <OnboardingTerminal ref={terminalBodyRef}>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side - Scrolling text */}
          <div className="w-full md:w-1/2 border-r border-red-800/50 h-full overflow-hidden">
            <div className="h-full overflow-hidden relative">
              <div className="animate-scroll font-mono text-red-400 text-sm p-4">
                {Array(20)
                  .fill(0)
                  .map((_, i) => (
                    <React.Fragment key={i}>
                      <div className="my-2">
                        // INITIALIZING NEURAL INTERFACE...
                      </div>
                      <div className="my-2">// DECRYPTING DATA STREAMS...</div>
                      <div className="my-2">
                        // SYNCHRONIZING PARALLEL REALITIES...
                      </div>
                      <div className="my-2">
                        // TRANSMITTING QUANTUM SIGNALS...
                      </div>
                      <div className="my-2">
                        // UNLOCKING DIGITAL DIMENSIONS...
                      </div>
                      <div className="my-2">
                        // YOU'RE ABOUT TO ENTER THE FUTURE...
                      </div>
                    </React.Fragment>
                  ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
            </div>
          </div>

          {/* Right side - Terminal content */}
          <div
            className="w-full md:w-1/2 p-4 font-mono text-red-400 overflow-y-auto h-full"
            ref={terminalBodyRef}
          >
            {/* Boot Sequence */}
            <div className="space-y-2">
              {bootLines.map((line, index) => (
                <div
                  key={index}
                  className={`${
                    line?.includes("WARNING")
                      ? "text-yellow-500"
                      : line?.includes("WALLET")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {line}
                </div>
              ))}

              {!bootSequenceComplete && (
                <div className="w-full h-2 bg-red-900/30 mt-4 overflow-hidden rounded-sm">
                  <div
                    className="h-full bg-red-600 transition-all duration-150"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Show wallet initialization during boot sequence */}
              {walletInitialized && !bootSequenceComplete && (
                <div className="mt-4 p-3 border border-green-800/50 bg-green-900/10 rounded">
                  <div className="text-green-400 text-sm flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    WALLET INTERFACE INITIALIZING...
                  </div>

                  <div className="mt-2">
                    <ConnectKitButton.Custom>
                      {({ isConnected, isConnecting, show }) => (
                        <div className="text-xs text-green-300/70">
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
                <div className="text-lg font-bold border-b border-red-800 pb-2">
                  IDENTITY VERIFICATION REQUIRED
                </div>

                <div className="text-yellow-500 font-bold">
                  CONNECT YOUR DIGITAL WALLET TO PROCEED
                </div>

                <p className="text-sm">
                  Your biometric data will be scanned and recorded for future
                  reference.
                </p>

                <div className="my-4 h-16 w-full bg-red-900/20 flex items-center justify-center border border-red-800/50 rounded">
                  <div className="text-xs animate-pulse">
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
                      className="w-full py-2 bg-red-800 hover:bg-red-700 text-white font-bold border border-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <span className="animate-pulse">
                          ESTABLISHING CONNECTION...
                        </span>
                      ) : isConnected ? (
                        "CONNECTION ESTABLISHED"
                      ) : (
                        "INITIATE WALLET CONNECTION"
                      )}
                    </button>
                  )}
                </ConnectKitButton.Custom>

                <p className="text-sm mt-4">
                  {isConnected ? (
                    <span className="text-green-500">
                      WALLET CONNECTED. VERIFYING CREDENTIALS...
                    </span>
                  ) : (
                    "AWAITING CONNECTION. TIMEOUT IN 120 SECONDS."
                  )}
                </p>
              </div>
            )}

            {/* Step 2: Register Profile */}
            {bootSequenceComplete && currentStep === 2 && (
              <div className="space-y-4 mt-6">
                <div className="text-lg font-bold border-b border-red-800 pb-2">
                  DIGITAL IDENTITY CREATION
                </div>

                <div className="text-yellow-500 font-bold">
                  NO EXISTING PROFILE DETECTED
                </div>

                <p className="text-sm">
                  You must register your digital identity to access the system.
                </p>

                <p className="text-sm">
                  This process is irreversible. Your data will be permanently
                  recorded on the blockchain.
                </p>

                <button
                  onClick={() => {
                    handleRegistration();
                    typewriterSound.play("type");
                  }}
                  className="w-full py-2 bg-red-800 hover:bg-red-700 text-white font-bold border border-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                  disabled={processingRegistration}
                >
                  {processingRegistration ? (
                    <span className="animate-pulse">
                      CREATING DIGITAL IDENTITY...
                    </span>
                  ) : (
                    "INITIATE PROFILE CREATION"
                  )}
                </button>

                {processingRegistration && (
                  <div className="w-full h-2 bg-red-900/30 mt-4 overflow-hidden rounded-sm">
                    <div className="h-full bg-red-600 animate-pulse w-full"></div>
                  </div>
                )}

                {errorMessage && (
                  <div className="text-yellow-500 border border-yellow-500 p-2 mt-4 bg-yellow-500/10 rounded">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Complete */}
            {bootSequenceComplete && currentStep === 3 && (
              <div className="space-y-4 mt-6">
                <div className="text-lg font-bold border-b border-green-800 pb-2 text-green-500">
                  IDENTITY VERIFICATION COMPLETE
                </div>

                <div className="text-green-500 font-bold">ACCESS GRANTED</div>

                <p className="text-sm">
                  Your digital identity has been verified and recorded in the
                  central database.
                </p>

                <p className="text-sm">
                  You now have access to the MR.RED terminal system.
                </p>

                <a
                  href="/"
                  className="block w-full py-2 bg-green-800 hover:bg-green-700 text-white font-bold border border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors text-center"
                >
                  PROCEED TO TERMINAL
                </a>

                <p className="text-yellow-500 text-sm mt-4 border border-yellow-500/50 p-2 bg-yellow-500/10 rounded">
                  WARNING: ALL ACTIONS WITHIN THE TERMINAL ARE MONITORED AND
                  RECORDED
                </p>
              </div>
            )}
          </div>
        </div>
      </OnboardingTerminal>
    </div>
  );
}
