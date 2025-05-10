import React, { useState, useEffect } from "react";
import { Howl } from "howler";
import TypingText from "./TypingText";
import MenuOption from "./MenuOption";

const Terminal: React.FC = () => {
  const [showIntro1, setShowIntro1] = useState(true);
  const [showIntro2, setShowIntro2] = useState(false);
  const [showIntro3, setShowIntro3] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [poweringUp, setPoweringUp] = useState(true);

  const typewriterSound = new Howl({
    src: ["/assets/typewriter.wav"],
    volume: 0.1,
    sprite: {
      type: [0, 100],
    },
  });

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
  };

  return (
    <div className={`terminal-container ${poweringUp ? "powering-up" : ""}`}>
      <div className="terminal-content">
        <div className="terminal-header">
          <div className="terminal-title">MR.RED TERMINAL v3.0</div>
          <div className="terminal-controls">
            <div className="control minimize"></div>
            <div className="control maximize"></div>
            <div className="control close"></div>
          </div>
        </div>

        <div className="terminal-body">
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
                <MenuOption
                  command="register_existence"
                  description="Submit yourself to the digital registry for processing"
                  onClick={() => handleOptionClick("register_existence")}
                />
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
        </div>
      </div>
    </div>
  );
};

export default Terminal;
