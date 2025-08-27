// src/components/layout/Header.tsx
"use client";

import React from "react";
import { useModeliaStore, useActions } from "@/lib/store";
import { Button, IconButton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Menu, Settings, Info, Github, ExternalLink, Zap } from "lucide-react";

export const Header: React.FC = () => {
  const actions = useActions();
  const sidebarOpen = useModeliaStore((state) => state.sidebarOpen);
  const generation = useModeliaStore((state) => state.generation);

  const handleToggleSidebar = () => {
    actions.toggleSidebar();
  };

  const handleOpenSettings = () => {
    actions.openModal("settings");
  };

  const handleOpenAbout = () => {
    actions.openModal("about");
  };

  const handleOpenGithub = () => {
    window.open("https://github.com/your-username/modelia-ai-studio", "_blank");
  };

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Left section - Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              
              {/* Brand */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Modelia
                </h1>
                <p className="text-xs text-white/60 -mt-1">AI Studio</p>
              </div>
            </div>
            
            {/* Mobile sidebar toggle */}
            <IconButton
              icon={<Menu size={18} />}
              onClick={handleToggleSidebar}
              variant="ghost"
              size="sm"
              className="lg:hidden"
              aria-label="Toggle sidebar"
            />
          </div>

          {/* Center section - Status indicator */}
          <div className="hidden md:flex items-center">
            {generation.status === "generating" && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-purple-300">
                  {generation.retryCount > 0 
                    ? `Retrying... (${generation.retryCount + 1}/3)`
                    : "Generating"
                  }
                </span>
              </div>
            )}
            
            {generation.status === "success" && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-medium text-green-300">
                  Generation Complete
                </span>
              </div>
            )}
            
            {generation.status === "error" && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs font-medium text-red-300">
                  Generation Failed
                </span>
              </div>
            )}
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
            
            {/* Desktop history toggle */}
            <Button
              onClick={handleToggleSidebar}
              variant="ghost"
              size="sm"
              className={cn(
                "hidden lg:flex transition-colors",
                sidebarOpen ? "text-purple-400" : "text-white/60"
              )}
              aria-label="Toggle history panel"
            >
              History
            </Button>
            
            {/* Settings */}
            <IconButton
              icon={<Settings size={18} />}
              onClick={handleOpenSettings}
              variant="ghost"
              size="sm"
              aria-label="Open settings"
            />
            
            {/* About/Info */}
            <IconButton
              icon={<Info size={18} />}
              onClick={handleOpenAbout}
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
              aria-label="About Modelia AI Studio"
            />
            
            {/* GitHub Link */}
            <IconButton
              icon={<Github size={18} />}
              onClick={handleOpenGithub}
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
              aria-label="View on GitHub"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

Header.displayName = "Header";