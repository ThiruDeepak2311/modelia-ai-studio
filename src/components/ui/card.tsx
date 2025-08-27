// src/components/ui/Card.tsx
import React from "react";
import { BaseComponentProps } from "@/types";
import { cn } from "@/lib/utils";

interface CardProps extends BaseComponentProps {
  hover?: boolean;
  interactive?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  interactive = false,
  gradient = false,
  testId,
}) => {
  return (
    <div
      data-testid={testId}
      className={cn(
        // Base styles
        "rounded-xl backdrop-blur-sm border transition-all duration-300 ease-in-out",
        
        // Background variants
        gradient 
          ? "bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/20"
          : "bg-white/5 border-white/20",
        
        // Hover effects
        hover && "hover:bg-white/10 hover:border-white/30",
        
        // Interactive effects
        interactive && [
          "cursor-pointer transform transition-transform duration-200",
          "hover:scale-[1.02] active:scale-[0.98]",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
        ],
        
        className
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
    >
      {children}
    </div>
  );
};

// Card header component
interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
}) => {
  return (
    <div className={cn("p-6 border-b border-white/10", className)}>
      {(title || subtitle || action) ? (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-white/60 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      ) : children}
    </div>
  );
};

// Card content component
export const CardContent: React.FC<BaseComponentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};

// Card footer component
export const CardFooter: React.FC<BaseComponentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("px-6 py-4 border-t border-white/10", className)}>
      {children}
    </div>
  );
};

// Specialized card variants
export const ImageCard: React.FC<{
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  overlay?: React.ReactNode;
  className?: string;
  onImageClick?: () => void;
}> = ({
  image,
  alt,
  title,
  subtitle,
  overlay,
  className,
  onImageClick,
}) => {
  return (
    <Card className={cn("overflow-hidden group", className)} hover interactive>
      <div className="relative">
        <img
          src={image}
          alt={alt}
          className={cn(
            "w-full aspect-[4/5] object-cover transition-transform duration-300",
            "group-hover:scale-105",
            onImageClick && "cursor-pointer"
          )}
          onClick={onImageClick}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content overlay */}
        {(title || subtitle || overlay) && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {title && (
              <h4 className="text-white font-semibold text-sm leading-tight">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-white/80 text-xs mt-1">{subtitle}</p>
            )}
            {overlay}
          </div>
        )}
      </div>
    </Card>
  );
};

// Stats card for displaying metrics
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
}) => {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-white/60",
  };

  const trendIcons = {
    up: "↗",
    down: "↘", 
    neutral: "→",
  };

  return (
    <Card className={cn("p-6", className)} gradient>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-white/40 text-xs mt-1">{subtitle}</p>
          )}
          
          {trend && trendValue && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs", trendColors[trend])}>
              <span>{trendIcons[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="text-white/40">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Feature card for showcasing features/benefits
export const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
}> = ({
  icon,
  title,
  description,
  gradient = "from-purple-600 to-pink-600",
  className,
}) => {
  return (
    <Card className={cn("p-6 text-center", className)} hover>
      <div className={cn(
        "w-12 h-12 rounded-lg bg-gradient-to-r mx-auto mb-4 flex items-center justify-center",
        gradient
      )}>
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm leading-relaxed">{description}</p>
    </Card>
  );
};

// Loading card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-8 bg-white/10 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded"></div>
          <div className="h-3 bg-white/10 rounded w-5/6"></div>
        </div>
      </div>
    </Card>
  );
};

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
ImageCard.displayName = "ImageCard";
StatsCard.displayName = "StatsCard";
FeatureCard.displayName = "FeatureCard";
CardSkeleton.displayName = "CardSkeleton";