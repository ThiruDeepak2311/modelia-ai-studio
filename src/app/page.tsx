"use client";

import React from "react";
import { useModeliaStore, useActions } from "@/lib/store";
import { Card, CardContent, Button, PrimaryButton, StyleSelector, Field, Textarea, LoadingOverlay } from "@/components/ui";
import { UploadArea } from "@/components/features/UploadArea";
import { GenerationPreview } from "@/components/features/GenerationPreview";
import { HistoryPanel } from "@/components/features/HistoryPanel";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, History, Settings } from "lucide-react";

export default function ModeliaStudio() {
  const actions = useActions();
  const generation = useModeliaStore((state) => state.generation);
  const form = useModeliaStore((state) => state.form);
  const preview = useModeliaStore((state) => state.preview);
  const sidebarOpen = useModeliaStore((state) => state.sidebarOpen);
  
  React.useEffect(() => {
    actions.initializeSession();
  }, [actions]);

  const handleGenerate = async () => {
    if (!actions.validateForm()) {
      return;
    }
    await actions.startGeneration();
  };

  const handleAbort = () => {
    actions.abortGeneration();
  };

  const canGenerate = form.prompt.isValid && form.style.isValid && form.image.isValid;
  const isGenerating = generation.status === "generating";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          
          {/* Left Panel - Upload & Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Welcome Message */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Modelia AI Studio
              </h1>
              <p className="text-white/60">
                Transform fashion visuals with AI-powered generation
              </p>
            </div>

            {/* Upload Area */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-400" />
                Upload Image
              </h2>
              <UploadArea />
            </Card>

            {/* Style & Prompt */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-purple-400" />
                Style & Prompt
              </h2>
              
              <Field label="Style" required>
                <StyleSelector
                  value={form.style.value}
                  onValueChange={actions.setStyle}
                  error={form.style.isValid ? undefined : "Please select a style"}
                />
              </Field>
              
              <Field label="Prompt" required error={form.prompt.error}>
                <Textarea
                  value={form.prompt.value}
                  onChange={actions.setPrompt}
                  placeholder="Describe how you want to transform this image..."
                  maxLength={500}
                  rows={4}
                  error={form.prompt.error}
                />
              </Field>
              
              {/* Live Summary */}
              {(preview.currentImage || preview.currentPrompt || preview.currentStyle) && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-white/80 mb-2">Preview Summary</h4>
                  <div className="space-y-1 text-xs text-white/60">
                    {preview.currentImage && (
                      <p>📸 Image: {preview.currentImage.file.name} ({(preview.currentImage.file.size / 1024 / 1024).toFixed(1)}MB)</p>
                    )}
                    {preview.currentPrompt && (
                      <p>✨ Prompt: {preview.currentPrompt.slice(0, 50)}{preview.currentPrompt.length > 50 ? "..." : ""}</p>
                    )}
                    <p>🎨 Style: {preview.currentStyle}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Generation Controls */}
            <Card className="p-6">
              <div className="space-y-4">
                {!isGenerating ? (
                  <PrimaryButton
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full"
                    size="lg"
                    aria-label="Generate AI fashion image"
                  >
                    <Sparkles size={20} />
                    Generate
                  </PrimaryButton>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleAbort}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Cancel Generation
                    </Button>
                    
                    {/* Progress indicator */}
                    <div className="text-center">
                      <p className="text-sm text-white/70 mb-2">
                        {generation.retryCount > 0 
                          ? `Retrying... (Attempt ${generation.retryCount + 1}/3)`
                          : "Generating your image..."
                        }
                      </p>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${generation.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/50 mt-1">{Math.round(generation.progress)}%</p>
                    </div>
                  </div>
                )}
                
                {generation.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">{generation.error.message}</p>
                    {generation.canRetry && (
                      <Button
                        onClick={actions.retryGeneration}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                onClick={actions.toggleSidebar}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                <History size={16} />
                History
              </Button>
              <Button
                onClick={() => actions.openModal("settings")}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                <Settings size={16} />
                Settings
              </Button>
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="lg:col-span-5">
            <GenerationPreview />
          </div>

          {/* Right Panel - History (Collapsible) */}
          <div className={cn(
            "lg:col-span-3 transition-all duration-300",
            !sidebarOpen && "lg:hidden"
          )}>
            <HistoryPanel />
          </div>
        </div>
      </main>
      
      {/* Loading Overlay for full-screen states */}
      <LoadingOverlay
        isVisible={generation.status === "uploading"}
        message="Processing image..."
        onCancel={handleAbort}
      />
      
      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>
    </div>
  );
}