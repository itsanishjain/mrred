"use client";

import React, { useEffect, useRef } from "react";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: string;
  altText?: string;
}

const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  altText,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle keyboard events for terminal-like experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' || e.key === 'q') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Get filename from URL
  const fileName = mediaUrl.split('/').pop() || 'media';
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 font-mono"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl border border-green-500 bg-black p-4"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        {/* Terminal header */}
        <div className="border-b border-green-500 pb-2 mb-4 flex justify-between items-center">
          <div className="text-green-500 text-sm">
            {mediaType === 'image' ? 'IMAGE_VIEWER' : 'MEDIA_PLAYER'} - {fileName}
          </div>
          <div className="flex space-x-2">
            <button 
              className="text-green-500 hover:text-green-400 px-2 py-1 border border-green-500 hover:border-green-400"
              onClick={onClose}
            >
              [X] CLOSE
            </button>
          </div>
        </div>
        
        {/* Media content */}
        <div className="bg-black border border-green-500 p-2">
          <div className="text-green-500 text-xs mb-2">
            $ DISPLAY {mediaType.toUpperCase()} FROM {mediaUrl.length > 50 ? mediaUrl.substring(0, 50) + '...' : mediaUrl}
          </div>
          
          <div className="flex justify-center items-center p-2">
            {mediaType === 'image' ? (
              <img 
                src={mediaUrl} 
                alt={altText || "Media content"} 
                className="max-w-full max-h-[65vh] mx-auto object-contain border border-green-500"
              />
            ) : mediaType === 'video' ? (
              <div className="w-full">
                <div className="text-green-500 text-xs mb-1">$ INITIALIZE_PLAYER</div>
                <video 
                  src={mediaUrl} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-[65vh] mx-auto border border-green-500"
                />
              </div>
            ) : null}
          </div>
          
          {altText && (
            <div className="text-green-500 mt-2 p-2 border-t border-green-500 text-sm">
              $ METADATA: {altText}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-green-500 text-xs">
          <div>PRESS [ESC] OR [Q] TO EXIT | LENS PROTOCOL MEDIA VIEWER</div>
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
