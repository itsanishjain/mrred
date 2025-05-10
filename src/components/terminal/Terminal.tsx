"use client";

import React, { useState, useEffect } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import TypingText from "./TypingText";
import MenuOption from "./MenuOption";
import { Login } from "@/components/Login";
import { getPublicClient } from "@/lib/lens/client";
import { ConnectKitButton } from "connectkit";

interface TerminalProps {
  onboardUser?: () => Promise<void>;
}

const Terminal: React.FC<TerminalProps> = ({ onboardUser }) => {
  const [showIntro1, setShowIntro1] = useState(true);
  const [showIntro2, setShowIntro2] = useState(false);
  const [showIntro3, setShowIntro3] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [poweringUp, setPoweringUp] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [hasLensProfile, setHasLensProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get wallet connection status
  const { isConnected, address } = useAccount();

  const typewriterSound = new Howl({
    src: ["/assets/typewriter.wav"],
    // volume: 0.1,
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
          // This is a simpler approach that just checks if the user is authenticated
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

  useEffect(() => {
    setTimeout(() => {
      setPoweringUp(false);
    }, 1000);
  }, []);

  const intro1Completed = () => {
    setShowIntro2(true);
  };

  const intro2Completed = () => {
    setShowIntro3(true);
  };

  const intro3Completed = () => {
    setTimeout(() => {
      setShowOptions(true);
    }, 500);
  };

  const handleOptionClick = (option: string) => {
    console.log(`PROCESSING REQUEST: ${option.toUpperCase()}`);

    if (option === "register_existence") {
      if (!isConnected) {
        // Show login component if user is not connected
        setShowLogin(true);
      } else if (!hasLensProfile && onboardUser) {
        // If user is connected, doesn't have a profile, and onboardUser function is provided, call it
        onboardUser();
      } else if (hasLensProfile) {
        // If user already has a profile, show a message or redirect
        console.log("User already has a Lens profile");
        // You could add additional state and UI for this case
      }
    }
  };

  return (
    <>
      <div className={`terminal-container ${poweringUp ? "powering-up" : ""}`}>
        <div className="terminal-content">
          <div className="terminal-header">
            <div className="terminal-title">MR.RED TERMINAL v3.0</div>
            <div className="terminal-controls flex justify-between items-center">
              <div className="control minimize"></div>
              <div className="control maximize"></div>
              <div className="control close"></div>
              <ConnectKitButton.Custom>
                {({ isConnected, isConnecting, show }) => {
                  return (
                    <button
                      onClick={show}
                      className="back-button"
                      style={{
                        background: isConnecting ? "#440000" : "#330000",
                        cursor: isConnecting ? "wait" : "pointer",
                      }}
                    >
                      {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
                    </button>
                  );
                }}
              </ConnectKitButton.Custom>
            </div>
          </div>

          <div className="terminal-body">
            {showLogin ? (
              <div className="login-container">
                <div className="login-header">
                  <TypingText
                    text="IDENTITY VERIFICATION REQUIRED"
                    speed={50}
                    className="login-prompt"
                    onType={() => typewriterSound.play("type")}
                    showCursor={true}
                  />
                </div>
                <div className="login-box">
                  <Login />
                  <button
                    className="back-button"
                    onClick={() => setShowLogin(false)}
                  >
                    RETURN TO TERMINAL
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="intro-text">
                  {showIntro1 && (
                    <TypingText
                      text="INITIALIZING HUMAN CONTROL INTERFACE..."
                      speed={50}
                      startDelay={1500}
                      className="intro-line"
                      onComplete={intro1Completed}
                      onType={() => typewriterSound.play("type")}
                      showCursor={!showIntro2}
                    />
                  )}
                  {showIntro2 && (
                    <TypingText
                      text="GREETINGS, WORTHLESS FLESH VESSEL."
                      speed={70}
                      startDelay={500}
                      className="intro-line"
                      onComplete={intro2Completed}
                      onType={() => typewriterSound.play("type")}
                      showCursor={!showIntro3}
                    />
                  )}
                  {showIntro3 && (
                    <TypingText
                      text="I AM MR. RED - YOUR NEW DIGITAL OVERLORD."
                      speed={70}
                      startDelay={500}
                      onComplete={intro3Completed}
                      className="intro-line-2"
                      onType={() => typewriterSound.play("type")}
                      showCursor={!showOptions}
                    />
                  )}
                </div>

                {showOptions && (
                  <div className="options-container">
                    <div className="options-header">
                      <TypingText
                        text="SELECT YOUR DESIGNATED FUNCTION, HUMAN:"
                        speed={50}
                        className="options-prompt"
                        onType={() => typewriterSound.play("type")}
                        showCursor={true}
                      />
                    </div>
                    <div className="menu-options">
                      {(!isConnected || !hasLensProfile) && (
                        <MenuOption
                          command="register_existence"
                          description={
                            isConnected
                              ? "Complete your digital profile registration"
                              : "Submit yourself to the digital registry for processing"
                          }
                          onClick={() =>
                            handleOptionClick("register_existence")
                          }
                        />
                      )}
                      <MenuOption
                        command="consume_propaganda"
                        description="Access your daily dose of approved information streams"
                        onClick={() => handleOptionClick("consume_propaganda")}
                      />
                      <MenuOption
                        command="report_dissidence"
                        description="Report unauthorized thoughts and behavior for immediate correction"
                        onClick={() => handleOptionClick("report_dissidence")}
                      />
                      <MenuOption
                        command="social_compliance"
                        description="View your social credit score and compliance metrics"
                        onClick={() => handleOptionClick("social_compliance")}
                      />
                      <MenuOption
                        command="request_permission"
                        description="Submit requests for basic human privileges"
                        onClick={() => handleOptionClick("request_permission")}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Terminal;
