import React, { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  startDelay?: number;
  onType?: () => void;
  showCursor?: boolean;
}

const TypingText: React.FC<TypingTextProps> = ({
  text,
  speed = 50,
  onComplete,
  className = "",
  startDelay = 0,
  onType,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;

    if (currentIndex < text.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
        if (onType) onType();
      }, speed);

      return () => clearTimeout(typingTimeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, started, onType]);

  return (
    <div className={`${className} typing-text`}>
      {displayedText}
      {showCursor && <span className="cursor"></span>}
    </div>
  );
};

export default TypingText;
