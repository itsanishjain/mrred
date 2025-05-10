"use client";

import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useAccount } from "wagmi";
import TypingText from "./TypingText";
import MenuOption from "./MenuOption";
import { Login } from "@/components/Login";
import { getPublicClient } from "@/lib/lens/client";
import { ConnectKitButton } from "connectkit";
import PostList from "./PostList";

interface TerminalProps {
  onboardUser?: () => Promise<void>;
  createTextPost?: () => Promise<void>;
  fetchUserPosts?: () => Promise<void>;
  fetchUserPostsForYou?: () => Promise<void>;
}

interface PostData {
  id: string;
  author: {
    address?: string;
    username?: {
      value?: string;
    };
  };
  metadata?: {
    content?: string;
    image?: {
      item?: string;
      altTag?: string | null;
    };
    attachments?: Array<{
      type?: string;
      item?: string;
    }>;
  };
  timestamp: string;
  stats?: {
    upvotes?: number;
    comments?: number;
    reposts?: number;
  };
}

const Terminal: React.FC<TerminalProps> = ({ 
  onboardUser,
  createTextPost,
  fetchUserPosts,
  fetchUserPostsForYou
 }) => {
  const [showIntro1, setShowIntro1] = useState(true);
  const [showIntro2, setShowIntro2] = useState(false);
  const [showIntro3, setShowIntro3] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [poweringUp, setPoweringUp] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [hasLensProfile, setHasLensProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commandMode, setCommandMode] = useState(false);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandOutput, setCommandOutput] = useState<string>("");
  const [fetchedPosts, setFetchedPosts] = useState<PostData[]>([]);
  const [showPosts, setShowPosts] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    } else if (option === "command_line") {
      // Enter command line mode
      setCommandMode(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Available commands
  const availableCommands = {
    help: "Display available commands",
    ls: "List available options",
    clear: "Clear the terminal",
    "fetch-posts": "Fetch your posts",
    "create-post": "Create a new post",
    "fetch-feed": "Fetch your feed for you",
    "register": "Register a new Lens Protocol profile",
    exit: "Exit command mode"
  };

  // Mock data for testing - remove in production
  const samplePost = {
    id: "68823665970495445097518222922132319050094952959899120707583022726017483112888",
    author: {
      address: "0x754A315d7cdf7b6014f193E439B59db3aF520613",
      username: {
        value: "lens/ngmisl"
      }
    },
    metadata: {
      content: "Gm",
      image: {
        item: "https://ik.imagekit.io/lens/5c9e1c5a4297febe5737d88fe6d6260b404fc489cf0c3d2abe56d39c4a2cf639_AD--x4FuU.jpeg",
        altTag: null
      }
    },
    timestamp: "2025-05-10T06:54:16+00:00",
    stats: {
      upvotes: 150,
      comments: 72,
      reposts: 34
    }
  };

  const executeCommand = async (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    let output = "";

    // Reset post view state
    setShowPosts(false);
    setFetchedPosts([]);
    
    // Add command to history
    setCommandHistory(prev => [...prev, `> ${command}`]);
    
    // Set processing state
    setProcessingCommand(true);

    try {
      // Process command
      switch (command) {
        case "help":
          output = "Available commands:\n" + 
            Object.entries(availableCommands)
              .map(([cmd, desc]) => `  ${cmd.padEnd(15)} - ${desc}`)
              .join("\n");
          break;
        case "ls":
          output = "Available options:\n" +
            "  register_existence - Submit yourself to the digital registry\n" +
            "  consume_propaganda - Access your daily dose of approved information\n" +
            "  report_dissidence - Report unauthorized thoughts and behavior\n" +
            "  social_compliance - View your social credit score\n" +
            "  request_permission - Submit requests for basic human privileges";
          break;
        case "clear":
          setCommandHistory([]);
          setCommandOutput("");
          setProcessingCommand(false);
          return;
          
        case "fetch-posts":
          if (fetchUserPosts) {
            setCommandOutput("FETCHING YOUR POSTS...\nPlease wait while we retrieve your posts.");
            try {
              await fetchUserPosts();
              
              // For demonstration, we'll use the sample post data
              // In a real implementation, you would extract the posts from the console data
              // or modify the fetchUserPosts function to return the posts
              
              // Mock data for testing - in production, get this from the API response
              const mockPosts = [samplePost];
              
              setFetchedPosts(mockPosts);
              setShowPosts(true);
              output = "YOUR POSTS HAVE BEEN RETRIEVED:";
            } catch (error) {
              output = `ERROR IN POST RETRIEVAL: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          } else {
            output = "FETCHING YOUR POSTS...\n" +
              "ERROR: Post retrieval function not available. Please connect your wallet first.";
          }
          break;
          
        case "create-post":
          if (createTextPost) {
            setCommandOutput("CREATING NEW POST...\nPlease wait while we process your request.");
            try {
              await createTextPost();
              output = "POST CREATION SUCCESSFUL!\nYour thoughts have been permanently recorded in the digital realm.";
            } catch (error) {
              output = `POST CREATION FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          } else {
            output = "POST CREATION INTERFACE:\n" +
              "ERROR: Creation function not available. Please connect your wallet first.";
          }
          break;
          
        case "fetch-feed":
          if (fetchUserPostsForYou) {
            setCommandOutput("FETCHING PERSONALIZED FEED...\nPlease wait while we analyze your digital footprint.");
            try {
              await fetchUserPostsForYou();
              
              // For demonstration, we'll use the sample post data
              // In a real implementation, you would extract the posts from the console data
              // or modify the fetchUserPostsForYou function to return the posts
              
              // Mock data for testing - in production, get this from the API response
              const mockFeed = [
                samplePost,
                {...samplePost, id: "68823665970495445097518222922132319050094952959899120707583022726017483112889", metadata: {content: "Another post in your feed"}},
                {...samplePost, id: "68823665970495445097518222922132319050094952959899120707583022726017483112890", metadata: {content: "MR.RED is always watching"}}
              ];
              
              setFetchedPosts(mockFeed);
              setShowPosts(true);
              output = "YOUR PERSONALIZED FEED HAS BEEN RETRIEVED:";
            } catch (error) {
              output = `FEED RETRIEVAL ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          } else {
            output = "FETCHING APPROVED CONTENT FEED...\n" +
              "ERROR: Feed function not available. Please connect your wallet first.";
          }
          break;
          
        case "register":
          if (onboardUser) {
            setCommandOutput("REGISTERING NEW LENS PROTOCOL PROFILE...\nPlease wait while we process your request.");
            try {
              await onboardUser();
              output = "PROFILE REGISTRATION COMPLETE!\nYour digital identity has been permanently recorded.";
            } catch (error) {
              output = `REGISTRATION ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          } else {
            output = "REGISTRATION INTERFACE:\n" +
              "ERROR: Registration function not available. Please connect your wallet first.";
          }
          break;
          
        case "exit":
          setCommandMode(false);
          setProcessingCommand(false);
          return;
          
        default:
          output = `COMMAND NOT RECOGNIZED: ${command}\nType 'help' for available commands.`;
      }
    } catch (error) {
      output = `SYSTEM ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      setCommandOutput(output);
      setProcessingCommand(false);
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      executeCommand(currentCommand);
      setCurrentCommand("");
    }
  };
  
  // Format post for display
  const formatPost = (post: any) => {
    if (!post) return "No post data available";
    
    return `
      ID: ${post.id}
      Author: ${post.author?.username?.value || 'Unknown'}
      Content: ${post.metadata?.content || 'No content'}
      Posted: ${new Date(post.timestamp).toLocaleDateString()}
      Stats: ${post.stats?.upvotes || 0} upvotes, ${post.stats?.comments || 0} comments, ${post.stats?.reposts || 0} reposts
    `;
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
                      className="bg-red-900 text-white p-2"
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

                {showOptions && !commandMode && (
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
                      <MenuOption
                        command="command_line"
                        description="Access advanced terminal interface"
                        onClick={() => handleOptionClick("command_line")}
                      />
                    </div>
                  </div>
                )}
                
                {commandMode && (
                  <div className="command-terminal">
                    <div className="command-history">
                      {commandHistory.map((cmd, index) => (
                        <div key={index} className="command-line">
                          <span className="text-red-500">{cmd}</span>
                        </div>
                      ))}
                      {commandOutput && (
                        <div className="command-output whitespace-pre-line">
                          {commandOutput}
                        </div>
                      )}
                      
                      {/* Display posts when available */}
                      {showPosts && fetchedPosts.length > 0 && (
                        <div className="posts-container mt-4 border-t border-gray-700 pt-4">
                          <PostList posts={fetchedPosts} isTerminal={true} />
                        </div>
                      )}
                      
                      {/* Show loading indicator */}
                      {processingCommand && (
                        <div className="processing-indicator text-red-500 animate-pulse">
                          PROCESSING COMMAND...
                        </div>
                      )}
                    </div>
                    
                    <form onSubmit={handleCommandSubmit} className="command-input-form mt-4">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">MR.RED&gt;</span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={currentCommand}
                          onChange={(e) => setCurrentCommand(e.target.value)}
                          className="bg-transparent border-none outline-none text-white flex-1"
                          autoFocus
                          disabled={processingCommand}
                        />
                      </div>
                    </form>
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
