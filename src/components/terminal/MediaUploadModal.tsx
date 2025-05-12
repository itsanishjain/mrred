"use client";

import React, { useState, useRef, useEffect } from "react";
import { Howl } from "howler";
import { MediaImageMimeType } from "@lens-protocol/metadata";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageData: {
    file: File;
    altTag: string;
    mimeType: MediaImageMimeType;
  }) => void;
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sound effects
  const keySound = new Howl({
    src: ["/assets/typewriter.wav"],
    sprite: {
      type: [0, 100],
    },
  });

  const uploadSound = new Howl({
    src: ["/assets/upload.mp3"],
  });

  // Handle keyboard events for terminal-like experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
      keySound.play("type");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleSelectedFile(file);
    }
  };

  // Handle drag and drop
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragOver = (e: DragEvent) => {
      preventDefault(e);
      if (dropArea.classList) {
        dropArea.classList.add("border-green-300");
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      preventDefault(e);
      if (dropArea.classList) {
        dropArea.classList.remove("border-green-300");
      }
    };

    const handleDrop = (e: DragEvent) => {
      preventDefault(e);
      if (dropArea.classList) {
        dropArea.classList.remove("border-green-300");
      }
      
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleSelectedFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setUploadError("ERROR: Only image files are supported");
      return;
    }

    setSelectedFile(file);
    setUploadError("");
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload process
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("ERROR: No file selected");
      return;
    }

    if (!altText.trim()) {
      setUploadError("ERROR: Alt text is required for accessibility");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    uploadSound.play();

    try {
      // For a real app, you would upload to IPFS here
      // For the hackathon, we'll create a Blob URL which is more compatible than data URLs
      const simulateUpload = async () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress > 100) progress = 100;
          setUploadProgress(Math.floor(progress));
          
          if (progress === 100) {
            clearInterval(interval);
            processUploadedImage();
          }
        }, 200);
      };

      const processUploadedImage = async () => {
        try {
          // Get mime type from file
          let mimeType = MediaImageMimeType.PNG;
          if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/jpg") {
            mimeType = MediaImageMimeType.JPEG;
          } else if (selectedFile.type === "image/gif") {
            mimeType = MediaImageMimeType.GIF;
          }
          
          // Pass the actual file to the parent component for proper upload
          // This allows the parent to use storageClient.uploadFile directly
          onUpload({
            file: selectedFile,
            altTag: altText,
            mimeType: mimeType,
          });
          
          setIsUploading(false);
          onClose();
        } catch (error) {
          console.error("Error processing image:", error);
          setUploadError("ERROR: Failed to process image");
          setIsUploading(false);
        }
      };

      await simulateUpload();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("ERROR: Upload failed");
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 font-mono"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl border border-red-500 bg-black p-4"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        {/* Terminal header */}
        <div className="border-b border-red-500 pb-2 mb-4 flex justify-between items-center">
          <div className="text-red-500 text-sm">
            MR.RED // MEDIA_UPLOAD_TERMINAL
          </div>
          <div className="flex space-x-2">
            <button
              className="text-red-500 hover:text-red-400 px-2 py-1 border border-red-500 hover:border-red-400"
              onClick={onClose}
            >
              [X] ABORT
            </button>
          </div>
        </div>

        {/* Upload interface */}
        <div className="bg-black border border-red-500 p-4">
          <div className="text-red-500 text-xs mb-4">
            $ INITIALIZE_MEDIA_UPLOAD_PROTOCOL
          </div>

          {/* File drop area */}
          <div
            ref={dropAreaRef}
            className="border-2 border-dashed border-red-500 p-6 mb-4 text-center cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 max-w-full mb-2 border border-red-500"
                />
                <div className="text-red-400 text-sm">
                  {selectedFile?.name} ({selectedFile ? Math.round(selectedFile.size / 1024) : 0} KB)
                </div>
              </div>
            ) : (
              <div className="text-red-400 py-8">
                <div className="text-lg mb-2">DRAG IMAGE HERE</div>
                <div className="text-xs">OR CLICK TO SELECT FILE</div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Alt text input */}
          <div className="mb-4">
            <label className="block text-red-500 text-xs mb-1">
              $ ENTER_IMAGE_DESCRIPTION:
            </label>
            <div className="flex items-center border border-red-500 bg-black">
              <span className="text-red-500 px-2">&gt;</span>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="bg-transparent border-none outline-none text-red-300 flex-1 p-2"
                placeholder="Describe the image for accessibility..."
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Error message */}
          {uploadError && (
            <div className="text-red-300 text-sm mb-4 border border-red-500 p-2">
              {uploadError}
            </div>
          )}

          {/* Upload progress */}
          {isUploading && (
            <div className="mb-4">
              <div className="text-red-500 text-xs mb-1">
                $ UPLOAD_PROGRESS: {uploadProgress}%
              </div>
              <div className="w-full bg-gray-900 h-2 border border-red-500">
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-red-400 text-xs mt-1">
                TRANSMITTING DATA TO CENTRAL SERVERS...
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between mt-4">
            <button
              className="text-red-500 hover:text-red-400 px-4 py-2 border border-red-500 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isUploading}
            >
              CANCEL
            </button>
            <button
              className="bg-red-900 text-red-100 px-4 py-2 border border-red-500 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || !altText.trim()}
            >
              {isUploading ? "UPLOADING..." : "UPLOAD TO SYSTEM"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-red-500 text-xs">
          <div>PRESS [ESC] TO ABORT | MR.RED MEDIA UPLOAD PROTOCOL v1.0</div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadModal;
