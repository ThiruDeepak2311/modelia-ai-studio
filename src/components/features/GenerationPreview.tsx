// src/components/features/GenerationPreview.tsx
"use client";

import React, { useState } from "react";
import { useModeliaStore, useActions } from "@/lib/store";
import { Card, CardContent, Button, LoadingSpinner, ImagePreviewModal } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, Download, Share2, Heart, RotateCcw, Maximize2, Copy } from "lucide-react";

export const GenerationPreview: React.FC = () => {
  const actions = useActions();
  const generation = useModeliaStore((state) => state.generation);
  const preview = useModeliaStore((state) => state.preview);
  const history = useModeliaStore((state) => state.history);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Fashion Image',
          text: 'Check out this AI-generated fashion image from Modelia!',
          url: imageUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback - copy URL to clipboard
      try {
        await navigator.clipboard.writeText(imageUrl);
        // Could show a toast notification here
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    actions.toggleFavorite(id);
  };

  const renderPreviewContent = () => {
    // Show generation result
    if (generation.result) {
      const isFavorite = history.items.find(item => item.id === generation.result?.id)?.isFavorite;
      
      return (
        <div className="space-y-4">
          {/* Generated Image */}
          <div className="relative group">
            <img
              src={generation.result.imageUrl}
              alt={`Generated: ${generation.result.prompt}`}
              className="w-full aspect-[4/5] object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => setShowImageModal(true)}
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowImageModal(true)}
                  variant="secondary"
                  size="sm"
                  aria-label="View full size"
                >
                  <Maximize2 size={16} />
                </Button>
                {preview.currentImage && (
                  <Button
                    onClick={() => setShowComparison(!showComparison)}
                    variant="secondary"
                    size="sm"
                    aria-label="Compare with original"
                  >
                    <RotateCcw size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Image Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleToggleFavorite(generation.result!.id)}
                variant="ghost"
                size="sm"
                className={cn(
                  "transition-colors",
                  isFavorite ? "text-red-400 hover:text-red-300" : "text-white/60 hover:text-white"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart size={16} className={isFavorite ? "fill-current" : ""} />
              </Button>
              
              <Button
                onClick={() => handleDownload(
                  generation.result!.imageUrl,
                  `modelia-${generation.result!.id}.jpg`
                )}
                variant="ghost"
                size="sm"
                aria-label="Download image"
              >
                <Download size={16} />
              </Button>
              
              <Button
                onClick={() => handleShare(generation.result!.imageUrl)}
                variant="ghost"
                size="sm"
                aria-label="Share image"
              >
                <Share2 size={16} />
              </Button>
            </div>
            
            <div className="text-xs text-white/50">
              Generated {formatRelativeTime(new Date(generation.result.createdAt))}
            </div>
          </div>

          {/* Generation Details */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2">
            <div>
              <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Prompt</span>
              <p className="text-sm text-white mt-1">{generation.result.prompt}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Style</span>
                <p className="text-sm text-white mt-1 capitalize">{generation.result.style}</p>
              </div>
              {generation.result.processingTime && (
                <div className="text-right">
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Time</span>
                  <p className="text-sm text-white mt-1">{(generation.result.processingTime / 1000).toFixed(1)}s</p>
                </div>
              )}
            </div>
          </div>

          {/* Comparison View Toggle */}
          {preview.currentImage && (
            <Button
              onClick={() => setShowComparison(!showComparison)}
              variant="outline"
              className="w-full"
              aria-label={showComparison ? "Hide comparison" : "Show comparison"}
            >
              <Eye size={16} />
              {showComparison ? "Hide" : "Show"} Original vs Generated
            </Button>
          )}
        </div>
      );
    }

    // Show original image if uploaded but not generated yet
    if (preview.currentImage) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate</h3>
            <p className="text-white/60 text-sm mb-4">Your image is uploaded and ready for AI transformation</p>
          </div>
          
          <div className="relative">
            <img
              src={preview.currentImage.dataUrl}
              alt="Original uploaded image"
              className="w-full aspect-[4/5] object-cover rounded-lg"
            />
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
              Original
            </div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
            <p className="text-sm text-white/70">
              Add a prompt and select a style to begin generating your AI-powered fashion transformation
            </p>
          </div>
        </div>
      );
    }

    // Empty state
    return (
      <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-6 rounded-full bg-white/5 border border-white/10">
          <Eye size={32} className="text-white/40" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Preview Your Creation</h3>
          <p className="text-white/60 text-sm max-w-sm">
            Upload an image and add a prompt to see your AI-generated fashion transformation appear here
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {/* Loading State */}
          {generation.status === "generating" && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center space-y-4">
                <LoadingSpinner size="xl" />
                <div>
                  <p className="text-white font-medium">
                    {generation.retryCount > 0 
                      ? `Retrying Generation... (${generation.retryCount + 1}/3)`
                      : "Generating Your Image..."
                    }
                  </p>
                  <p className="text-white/60 text-sm mt-1">This may take a few moments</p>
                </div>
              </div>
            </div>
          )}
          
          {renderPreviewContent()}
        </CardContent>
      </Card>

      {/* Comparison View */}
      {showComparison && preview.currentImage && generation.result && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Before & After</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <img
                  src={preview.currentImage.dataUrl}
                  alt="Original image"
                  className="w-full aspect-[4/5] object-cover rounded-lg"
                />
                <p className="text-center text-sm text-white/70">Original</p>
              </div>
              <div className="space-y-2">
                <img
                  src={generation.result.imageUrl}
                  alt="Generated image"
                  className="w-full aspect-[4/5] object-cover rounded-lg"
                />
                <p className="text-center text-sm text-white/70">Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Modal */}
      {generation.result && (
        <ImagePreviewModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          src={generation.result.imageUrl}
          alt={`Generated: ${generation.result.prompt}`}
          title="Generated Image"
        />
      )}
    </div>
  );
};

GenerationPreview.displayName = "GenerationPreview";