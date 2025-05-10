"use client";

import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import TypingText from "../terminal/TypingText";
import { ConnectKitButton } from "connectkit";
import { getPublicClient } from "@/lib/lens/client";
import "./OnboardingStyles.css";

interface OnboardingProps {
  onboardUser: () => Promise<void>;
}

interface BootLineProps {
  text: string;
  type?: "normal" | "warning" | "success";
  delay: number;
}

const BootLine: React.FC<BootLineProps> = ({
  text,
  type = "normal",
  delay,
}) => {
  const className = `boot-line delay-${delay} ${
    type === "warning"
      ? "warning-text"
      : type === "success"
      ? "success-text"
      : ""
  }`;

  return <div className={className}>{text}</div>;
};

const Onboarding: React.FC<OnboardingProps> = ({ onboardUser }) => {
  // State management
  const [bootSequenceComplete, setBootSequenceComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasLensProfile, setHasLensProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRegistration, setProcessingRegistration] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Refs
  const loadingBarRef = useRef<HTMLDivElement>(null);
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

  // Boot sequence animation
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setBootSequenceComplete(true);
      setCurrentStep(1); // Move to connection step after boot

      // Auto-scroll to bottom of terminal
      if (terminalBodyRef.current) {
        terminalBodyRef.current.scrollTop =
          terminalBodyRef.current.scrollHeight;
      }
    }, 4000); // Boot sequence takes 4 seconds

    return () => clearTimeout(bootTimer);
  }, []);

  // Loading bar animation
  useEffect(() => {
    if (bootSequenceComplete) return;

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + 5;
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

    if (isConnected && currentStep === 1) {
      checkLensProfile();
    }
  }, [isConnected, address, currentStep]);

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
  }, [currentStep, processingRegistration, registrationComplete]);

  return (
    <div className="onboarding-container">
      <div className="classified">CLASSIFIED</div>
      <div className="onboarding-terminal">
        <div className="terminal-header">
          <div className="terminal-title">
            MR.RED IDENTITY VERIFICATION v1.0
          </div>
          <div className="terminal-controls">
            <div className="control minimize"></div>
            <div className="control maximize"></div>
            <div className="control close"></div>
          </div>
        </div>

        <div className="terminal-body" ref={terminalBodyRef}>
          {/* Boot Sequence */}
          <div className="boot-sequence">
            <BootLine text="INITIALIZING SYSTEM..." delay={1} />
            <BootLine text="LOADING SECURITY PROTOCOLS..." delay={2} />
            <BootLine text="ESTABLISHING SECURE CONNECTION..." delay={3} />
            <BootLine text="ACCESSING CENTRAL DATABASE..." delay={4} />

            {!bootSequenceComplete && (
              <div className="loading-bar active">
                <div
                  className="loading-bar-progress"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            )}

            <BootLine
              text="WARNING: UNAUTHORIZED ACCESS WILL RESULT IN IMMEDIATE TERMINATION"
              type="warning"
              delay={5}
            />
          </div>

          {/* Progress Indicator */}
          {bootSequenceComplete && (
            <div className="progress-indicator">
              <div
                className={`progress-step ${currentStep >= 1 ? "active" : ""} ${
                  currentStep > 1 ? "completed" : ""
                }`}
              >
                <div className="progress-step-circle">1</div>
                <div className="progress-step-label">CONNECT</div>
              </div>
              <div
                className={`progress-step ${currentStep >= 2 ? "active" : ""} ${
                  currentStep > 2 ? "completed" : ""
                }`}
              >
                <div className="progress-step-circle">2</div>
                <div className="progress-step-label">VERIFY</div>
              </div>
              <div
                className={`progress-step ${currentStep >= 3 ? "active" : ""}`}
              >
                <div className="progress-step-circle">3</div>
                <div className="progress-step-label">ACCESS</div>
              </div>
            </div>
          )}

          {/* Step 1: Connect Wallet */}
          {bootSequenceComplete && currentStep === 1 && (
            <div className="connect-section active">
              <div className="section-header">
                IDENTITY VERIFICATION REQUIRED
              </div>

              <div className="section-content">
                <div className="warning-text">
                  CONNECT YOUR DIGITAL WALLET TO PROCEED
                </div>
                <p>
                  Your biometric data will be scanned and recorded for future
                  reference.
                </p>

                <div className="biometric-scan">
                  {/* This would be replaced with an actual camera feed or avatar in a real implementation */}
                </div>

                <ConnectKitButton.Custom>
                  {({ isConnected, isConnecting, show }) => (
                    <button
                      onClick={() => {
                        show && show();
                        typewriterSound.play("type");
                      }}
                      className="action-button"
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <span className="blink">
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

                <p className="status-text">
                  {isConnected ? (
                    <span className="success-text">
                      WALLET CONNECTED. VERIFYING CREDENTIALS...
                    </span>
                  ) : (
                    "AWAITING CONNECTION. TIMEOUT IN 120 SECONDS."
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Register Profile */}
          {bootSequenceComplete && currentStep === 2 && (
            <div className="register-section active">
              <div className="section-header">
                DIGITAL IDENTITY CREATION
              </div>

              <div className="section-content">
                <div className="warning-text">NO EXISTING PROFILE DETECTED</div>
                <p>
                  You must register your digital identity to access the system.
                </p>
                <p>
                  This process is irreversible. Your data will be permanently
                  recorded on the blockchain.
                </p>

                <button
                  onClick={() => {
                    handleRegistration();
                    typewriterSound.play("type");
                  }}
                  className="action-button"
                  disabled={processingRegistration}
                >
                  {processingRegistration ? (
                    <span className="blink">CREATING DIGITAL IDENTITY...</span>
                  ) : (
                    "INITIATE PROFILE CREATION"
                  )}
                </button>

                {processingRegistration && (
                  <div className="loading-bar active">
                    <div className="loading-bar-progress"></div>
                  </div>
                )}

                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {bootSequenceComplete && currentStep === 3 && (
            <div className="complete-section active">
              <div className="section-header success-text">
                IDENTITY VERIFICATION COMPLETE
              </div>

              <div className="section-content">
                <div className="success-text">ACCESS GRANTED</div>
                <p>
                  Your digital identity has been verified and recorded in the
                  central database.
                </p>
                <p>You now have access to the MR.RED terminal system.</p>

                <a href="/" className="action-button">
                  PROCEED TO TERMINAL
                </a>

                <p className="status-text warning-text">
                  WARNING: ALL ACTIONS WITHIN THE TERMINAL ARE MONITORED AND
                  RECORDED
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
