// src/components/features/HistoryPanel.tsx
"use client";

import React, { useState } from "react";
import { useModeliaStore, useActions } from "@/lib/store";
import { Card, CardHeader, CardContent, Button, ConfirmDialog, ImageCard } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { History, Trash2, Heart, Download, X, Filter } from "lucide-react";
import { StyleOption } from "@/types";

export const HistoryPanel: React.FC = () => {
  const actions = useActions();
  const history = useModeliaStore((state) => state.history);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filterStyle, setFilterStyle] = useState<StyleOption | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredItems = history.items.filter(item => {
    if (showFavoritesOnly && !item.isFavorite) return false;
    if (filterStyle !== 'all' && item.style !== filterStyle) return false;
    return true;
  });

  const handleItemClick = (item: any) => {
    actions.selectHistoryItem(item);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    actions.removeFromHistory(id);
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    actions.toggleFavorite(id);
  };

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `modelia-${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleClearHistory = () => {
    actions.clearAllHistory();
    setShowClearConfirm(false);
  };

  const styles: Array<{value: StyleOption | 'all', label: string}> = [
    { value: 'all', label: 'All Styles' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'streetwear', label: 'Streetwear' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'casual', label: 'Casual' },
  ];

  return (
    <Card className="h-fit">
      <CardHeader
        title={`History (${history.items.length}/5)`}
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors",
                showFavoritesOnly ? "text-red-400" : "text-white/60"
              )}
              aria-label={showFavoritesOnly ? "Show all items" : "Show favorites only"}
            >
              <Heart size={14} className={showFavoritesOnly ? "fill-current" : ""} />
            </Button>
            
            {history.items.length > 0 && (
              <Button
                onClick={() => setShowClearConfirm(true)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                aria-label="Clear all history"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        }
      />
      
      <CardContent className="p-4 space-y-4">
        {/* Filters */}
        {history.items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Filter size={12} className="text-white/40" />
              <span className="text-white/60">Filter by style:</span>
            </div>
            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value as StyleOption | 'all')}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {styles.map(style => (
                <option key={style.value} value={style.value} className="bg-black">
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* History Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 w-fit mx-auto mb-4">
              <History size={24} className="text-white/40" />
            </div>
            <h4 className="text-white font-medium mb-2">
              {history.items.length === 0 ? "No history yet" : "No matching items"}
            </h4>
            <p className="text-white/60 text-sm">
              {history.items.length === 0 
                ? "Your generated images will appear here"
                : "Try adjusting your filters or create more generations"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative group cursor-pointer transition-all duration-200",
                  "hover:scale-[1.02] focus-within:scale-[1.02]",
                  history.currentItem?.id === item.id && "ring-2 ring-purple-500 rounded-xl"
                )}
                onClick={() => handleItemClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(item);
                  }
                }}
                aria-label={`View generation: ${item.prompt.slice(0, 50)}...`}
              >
                <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                  <img
                    src={item.imageUrl}
                    alt={`Generated: ${item.prompt}`}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-end justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-white text-sm font-medium line-clamp-2 leading-tight">
                          {item.prompt}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white/60 capitalize">
                            {item.style}
                          </span>
                          <span className="text-xs text-white/40">•</span>
                          <span className="text-xs text-white/60">
                            {formatRelativeTime(new Date(item.createdAt))}
                          </span>
                        </div>
                      </div>
                      
                      {item.isFavorite && (
                        <Heart size={12} className="text-red-400 fill-current flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons (show on hover) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleToggleFavorite(item.id)}
                      variant="secondary"
                      size="sm"
                      className="!bg-black/60 hover:!bg-black/80 !backdrop-blur-sm !p-1.5"
                      aria-label={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        size={12} 
                        className={cn(
                          "transition-colors",
                          item.isFavorite ? "text-red-400 fill-current" : "text-white"
                        )} 
                      />
                    </Button>
                    
                    <Button
                      onClick={() => handleDownload(item.imageUrl, item.id)}
                      variant="secondary"
                      size="sm"
                      className="!bg-black/60 hover:!bg-black/80 !backdrop-blur-sm !p-1.5"
                      aria-label="Download image"
                    >
                      <Download size={12} className="text-white" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteItem(item.id)}
                      variant="secondary"
                      size="sm"
                      className="!bg-red-600/60 hover:!bg-red-600/80 !backdrop-blur-sm !p-1.5"
                      aria-label="Delete from history"
                    >
                      <X size={12} className="text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Storage indicator */}
        {history.items.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>Storage</span>
              <span>{history.items.length}/5 items</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1 mt-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(history.items.length / 5) * 100}%` }}
              />
            </div>
            {history.items.length === 5 && (
              <p className="text-xs text-yellow-400 mt-1">
                History full - new items will replace oldest
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Clear confirmation dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearHistory}
        title="Clear History"
        message="Are you sure you want to delete all generation history? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Keep History"
        variant="danger"
      />
    </Card>
  );
};

HistoryPanel.displayName = "HistoryPanel";