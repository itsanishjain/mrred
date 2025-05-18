"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [text, setText] = useState<string>("");
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [redirectCounter, setRedirectCounter] = useState<number>(10);

  const errorMessage = `
  ███████╗██████╗ ██████╗  ██████╗ ██████╗ 
  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
  █████╗  ██████╔╝██████╔╝██║   ██║██████╔╝
  ██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗
  ███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║
  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
                                           
  > ERROR 404: FILE NOT FOUND
  > SYSTEM MALFUNCTION
  > MR.RED CANNOT LOCATE REQUESTED RESOURCE
  > INITIATING RECOVERY PROTOCOL...
  `;

  useEffect(() => {
    // Type out the error message character by character
    let i = 0;
    const typingInterval = setInterval(() => {
      setText(errorMessage.substring(0, i));
      i++;
      if (i > errorMessage.length) {
        clearInterval(typingInterval);
      }
    }, 20);

    // Blink the cursor
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    // Countdown for auto-redirect
    const countdownInterval = setInterval(() => {
      setRedirectCounter((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Auto-redirect when counter reaches 0
  useEffect(() => {
    if (redirectCounter === 0) {
      window.location.href = "/";
    }
  }, [redirectCounter]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 p-4">
      <div className="w-full max-w-3xl">
        <pre className="font-mono text-xs sm:text-sm md:text-base whitespace-pre-wrap">
          {text}
          {showCursor && <span className="animate-blink">█</span>}
        </pre>
        
        <div className="mt-8 border border-green-500 p-4">
          <p className="font-mono mb-4">
            [SYSTEM]: Auto-redirect to home in {redirectCounter} seconds...
          </p>
          <p className="font-mono mb-4">
            [MR.RED]: Human, you seem to be lost. Let me guide you back to safety.
          </p>
          <div className="flex space-x-4 mt-6">
            <Button 
              variant="outline" 
              className="border-green-500 text-green-500 hover:bg-green-900 hover:text-green-300"
              asChild
            >
              <Link href="/">
                &gt; RETURN_TO_HOME
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-green-500 text-green-500 hover:bg-green-900 hover:text-green-300"
              onClick={() => window.history.back()}
            >
              &gt; GO_BACK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
