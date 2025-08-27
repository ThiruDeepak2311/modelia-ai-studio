// src/components/features/UploadArea.tsx
"use client";

import React, { useCallback, useRef } from "react";
import { useModeliaStore, useActions } from "@/lib/store";
import { processImageFile, validateImageFile, formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Upload, Image, X, AlertCircle } from "lucide-react";
import { Button, LoadingSpinner } from "@/components/ui";

export const UploadArea: React.FC = () => {
  const actions = useActions();
  const upload = useModeliaStore((state) => state.upload);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!upload.isProcessing) {
      actions.setUploadDragging(true);
    }
  }, [actions, upload.isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only hide drag state if leaving the upload area entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      actions.setUploadDragging(false);
    }
  }, [actions]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    actions.setUploadDragging(false);

    if (upload.isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (!imageFile) {
      actions.setUploadError("Please drop a valid image file (PNG, JPG, JPEG, or WebP)");
      return;
    }

    await processFile(imageFile);
  }, [actions, upload.isProcessing]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFile = async (file: File) => {
    actions.setUploadProcessing(true);
    actions.setUploadError(undefined);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).flat()[0];
        actions.setUploadError(errorMessage);
        return;
      }

      // Process image
      const imageFile = await processImageFile(file);
      actions.setCurrentImage(imageFile);

      // Show success feedback
      actions.setUploadError(undefined);
    } catch (error: any) {
      actions.setUploadError(error.message || "Failed to process image");
    } finally {
      actions.setUploadProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    actions.setCurrentImage(undefined);
    actions.setUploadError(undefined);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!upload.currentImage ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl transition-all duration-200",
            "min-h-[200px] flex flex-col items-center justify-center p-8 text-center cursor-pointer",
            upload.isDragging
              ? "border-purple-500/50 bg-purple-500/10 scale-[1.02]"
              : "border-white/20 hover:border-white/30 hover:bg-white/5",
            upload.isProcessing && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          aria-label="Upload image area - click to browse or drag and drop"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          {upload.isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-white/70 font-medium">Processing image...</p>
              <p className="text-white/50 text-sm">Optimizing for best results</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                upload.isDragging 
                  ? "bg-purple-500/20 text-purple-400" 
                  : "bg-white/10 text-white/60"
              )}>
                <Upload size={32} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {upload.isDragging ? "Drop your image here" : "Upload an image"}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Drag & drop or click to browse
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-white/40">
                  <span>PNG</span>
                  <span>•</span>
                  <span>JPG</span>
                  <span>•</span>
                  <span>JPEG</span>
                  <span>•</span>
                  <span>WebP</span>
                  <span>•</span>
                  <span>Max 10MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={upload.isProcessing}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      ) : (
        /* Image Preview */
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/20">
            <img
              src={upload.currentImage.dataUrl}
              alt="Uploaded image preview"
              className="w-full aspect-[4/3] object-cover"
            />
            
            {/* Image overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end justify-between">
                <div className="text-white">
                  <p className="font-medium text-sm truncate">
                    {upload.currentImage.file.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/80 mt-1">
                    <span>{upload.currentImage.dimensions.width} × {upload.currentImage.dimensions.height}</span>
                    <span>{formatFileSize(upload.currentImage.file.size)}</span>
                    {upload.currentImage.processedSize && upload.currentImage.processedSize !== upload.currentImage.originalSize && (
                      <span className="text-green-400">Optimized</span>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={handleRemoveImage}
                  variant="danger"
                  size="sm"
                  className="!bg-red-600/90 hover:!bg-red-700"
                  aria-label="Remove uploaded image"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Replace button */}
          <Button
            onClick={handleBrowseClick}
            variant="outline"
            size="sm"
            className="absolute top-3 right-3 !bg-black/80 hover:!bg-black/90"
          >
            <Image size={14} />
            Replace
          </Button>
        </div>
      )}

      {/* Error Message */}
      {upload.error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-red-400 font-medium text-sm">{upload.error}</p>
            <button
              onClick={() => actions.setUploadError(undefined)}
              className="text-red-400/70 hover:text-red-400 text-xs mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      {!upload.currentImage && !upload.error && (
        <div className="text-center">
          <p className="text-xs text-white/40 leading-relaxed">
            For best results, upload high-quality fashion images with clear subjects. 
            Images will be automatically optimized for AI processing.
          </p>
        </div>
      )}
    </div>
  );
};

UploadArea.displayName = "UploadArea";