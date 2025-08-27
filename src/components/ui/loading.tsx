// src/components/ui/Loading.tsx
import React from "react";
import { BaseComponentProps } from "@/types";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "purple" | "white" | "blue" | "green" | "red";
}

const spinnerSizes = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
  xl: "w-12 h-12 border-4",
};

const spinnerColors = {
  purple: "border-purple-500 border-t-transparent",
  white: "border-white border-t-transparent",
  blue: "border-blue-500 border-t-transparent",
  green: "border-green-500 border-t-transparent",
  red: "border-red-500 border-t-transparent",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "purple",
  className,
  testId,
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      data-testid={testId}
      role="status"
      aria-label="Loading"
    />
  );
};

// Pulsing dots loader
interface LoadingDotsProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
  color?: "purple" | "white" | "blue";
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  color = "purple",
  className,
  testId,
}) => {
  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const dotColors = {
    purple: "bg-purple-500",
    white: "bg-white",
    blue: "bg-blue-500",
  };

  return (
    <div
      className={cn("flex gap-1 items-center", className)}
      data-testid={testId}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "rounded-full animate-pulse",
            dotSizes[size],
            dotColors[color]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
};

// Progress bar component
interface ProgressBarProps extends BaseComponentProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "striped";
  color?: "purple" | "blue" | "green" | "red";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  variant = "default",
  color = "purple",
  className,
  testId,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const barSizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const barColors = {
    purple: "bg-purple-600",
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
  };

  const gradientColors = {
    purple: "bg-gradient-to-r from-purple-600 to-pink-600",
    blue: "bg-gradient-to-r from-blue-600 to-cyan-600",
    green: "bg-gradient-to-r from-green-600 to-emerald-600",
    red: "bg-gradient-to-r from-red-600 to-pink-600",
  };

  return (
    <div className={cn("w-full", className)} data-testid={testId}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">Progress</span>
          <span className="text-sm text-white/70">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={cn("w-full bg-white/10 rounded-full overflow-hidden", barSizes[size])}>
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            variant === "gradient" ? gradientColors[color] : barColors[color],
            variant === "striped" && "bg-striped animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

// Circular progress component
interface CircularProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  color?: "purple" | "blue" | "green" | "red";
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  showLabel = false,
  color = "purple",
  className,
  testId,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    purple: "#8b5cf6",
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      data-testid={testId}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Full screen loading overlay
interface LoadingOverlayProps extends BaseComponentProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Loading...",
  progress,
  onCancel,
  className,
  testId,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/80 backdrop-blur-sm",
        className
      )}
      data-testid={testId}
    >
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Loading animation */}
          <div className="mb-6">
            {progress !== undefined ? (
              <CircularProgress
                value={progress}
                size={64}
                showLabel
                className="mx-auto"
              />
            ) : (
              <LoadingSpinner size="xl" className="mx-auto" />
            )}
          </div>
          
          {/* Message */}
          <h3 className="text-lg font-semibold text-white mb-2">{message}</h3>
          
          {/* Progress bar for additional context */}
          {progress !== undefined && (
            <ProgressBar
              value={progress}
              className="mb-4"
              variant="gradient"
            />
          )}
          
          {/* Cancel button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton loaders for content placeholders
interface SkeletonProps extends BaseComponentProps {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width = "100%",
  height,
  animate = true,
  className,
  testId,
}) => {
  const baseClasses = cn(
    "bg-white/10 rounded",
    animate && "animate-pulse",
    variant === "circular" && "rounded-full",
    variant === "text" && "rounded-sm",
    className
  );

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height || (variant === "text" ? "1em" : "auto"),
  };

  return (
    <div
      className={baseClasses}
      style={style}
      data-testid={testId}
      role="status"
      aria-label="Loading content"
    />
  );
};

// Text skeleton with multiple lines
interface SkeletonTextProps extends BaseComponentProps {
  lines?: number;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = "60%",
  className,
  testId,
}) => {
  return (
    <div className={cn("space-y-2", className)} data-testid={testId}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={16}
          width={index === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
};

LoadingSpinner.displayName = "LoadingSpinner";
LoadingDots.displayName = "LoadingDots";
ProgressBar.displayName = "ProgressBar";
CircularProgress.displayName = "CircularProgress";
LoadingOverlay.displayName = "LoadingOverlay";
Skeleton.displayName = "Skeleton";
SkeletonText.displayName = "SkeletonText";