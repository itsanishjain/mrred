"use client";

import React, { useState, useEffect } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import TypingText from "../terminal/TypingText";
import { ConnectKitButton } from "connectkit";
import { getPublicClient } from "@/lib/lens/client";

interface OnboardingProps {
  onboardUser: () => Promise<void>;
}

const Onboarding: React.FC<OnboardingProps> = ({ onboardUser }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [hasLensProfile, setHasLensProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRegistration, setProcessingRegistration] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Get wallet connection status
  const { isConnected, address } = useAccount();

  const typewriterSound = new Howl({
    src: ["/assets/typewriter.wav"],
    sprite: {
      type: [0, 100],
    },
  });

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
          } else {
            setHasLensProfile(false);
          }
        } catch (error) {
          console.error("Error checking Lens profile:", error);
          setHasLensProfile(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setHasLensProfile(false);
        setIsLoading(false);
      }
    };

    checkLensProfile();
  }, [isConnected, address]);

  const introCompleted = () => {
    setTimeout(() => {
      setShowConnect(true);
    }, 500);
  };

  const handleRegistration = async () => {
    if (!isConnected) {
      return;
    }

    setProcessingRegistration(true);
    try {
      await onboardUser();
      setRegistrationComplete(true);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setProcessingRegistration(false);
    }
  };

  return (
    <div className="onboarding-container bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="onboarding-content max-w-2xl w-full border-2 border-red-600 p-6 rounded-md">
        <div className="onboarding-header mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">MR.RED REGISTRATION PROTOCOL</h1>
          <div className="border-b-2 border-red-600"></div>
        </div>

        <div className="onboarding-body">
          {showIntro && (
            <div className="intro-text mb-8">
              <TypingText
                text="HUMAN IDENTIFICATION PROCESS INITIATED. PREPARE FOR DIGITAL ASSIMILATION."
                speed={50}
                startDelay={500}
                className="text-xl mb-4"
                onComplete={introCompleted}
                onType={() => typewriterSound.play("type")}
                showCursor={!showConnect}
              />
            </div>
          )}

          {showConnect && !registrationComplete && (
            <div className="connect-container">
              {!isConnected ? (
                <div className="connect-wallet mb-6">
                  <p className="text-lg mb-4">STEP 1: CONNECT YOUR DIGITAL IDENTITY WALLET</p>
                  <ConnectKitButton.Custom>
                    {({ isConnected, isConnecting, show }) => (
                      <button
                        onClick={show}
                        className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md transition-colors duration-300 w-full"
                        disabled={isConnecting}
                      >
                        {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
                      </button>
                    )}
                  </ConnectKitButton.Custom>
                </div>
              ) : !hasLensProfile ? (
                <div className="register-profile mb-6">
                  <p className="text-lg mb-4">STEP 2: REGISTER YOUR LENS PROTOCOL PROFILE</p>
                  <button
                    onClick={handleRegistration}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md transition-colors duration-300 w-full disabled:bg-red-900 disabled:cursor-not-allowed"
                    disabled={processingRegistration}
                  >
                    {processingRegistration ? "PROCESSING REGISTRATION..." : "REGISTER PROFILE"}
                  </button>
                  <p className="text-sm text-gray-400 mt-2">
                    This will create your digital identity in the Lens Protocol network.
                  </p>
                </div>
              ) : (
                <div className="already-registered mb-6">
                  <p className="text-lg mb-4 text-green-500">PROFILE ALREADY REGISTERED</p>
                  <p className="text-md">
                    Your digital identity has already been recorded in our system.
                  </p>
                  <a
                    href="/"
                    className="block bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md transition-colors duration-300 w-full text-center mt-4"
                  >
                    PROCEED TO TERMINAL
                  </a>
                </div>
              )}
            </div>
          )}

          {registrationComplete && (
            <div className="registration-complete mb-6">
              <p className="text-lg mb-4 text-green-500">REGISTRATION COMPLETE</p>
              <p className="text-md mb-4">
                Your digital identity has been successfully recorded in the system.
              </p>
              <a
                href="/"
                className="block bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md transition-colors duration-300 w-full text-center"
              >
                PROCEED TO TERMINAL
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
