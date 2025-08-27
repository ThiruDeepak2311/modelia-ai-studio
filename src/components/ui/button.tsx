// src/components/ui/Button.tsx
import React from "react";
import { ButtonProps } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  primary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25",
  secondary: "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20",
  outline: "border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300",
  ghost: "hover:bg-white/5 text-white/70 hover:text-white",
  danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-500/25",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm h-8",
  md: "px-4 py-2 text-sm h-10",
  lg: "px-6 py-3 text-base h-12",
  xl: "px-8 py-4 text-lg h-14",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  onClick,
  type = "button",
  testId,
  ...accessibilityProps
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      data-testid={testId}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        "transform hover:scale-105 active:scale-95",
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles
        buttonSizes[size],
        
        // Custom className
        className
      )}
      {...accessibilityProps}
    >
      {loading && (
        <Loader2 
          className="animate-spin" 
          size={size === "sm" ? 14 : size === "lg" ? 20 : size === "xl" ? 24 : 16} 
        />
      )}
      {children}
    </button>
  );
};

// Specialized button variants for common use cases
export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="ghost" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="danger" {...props} />
);

// Icon button for actions without text
interface IconButtonProps extends Omit<ButtonProps, "children"> {
  icon: React.ReactNode;
  "aria-label": string;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  size = "md",
  variant = "ghost",
  className,
  ...props 
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        iconSizes[size],
        "!px-0 !py-0 rounded-full",
        className
      )}
      {...props}
    >
      {icon}
    </Button>
  );
};

// Floating Action Button for primary actions
export const FAB: React.FC<Omit<ButtonProps, "variant" | "size">> = ({ 
  className, 
  children,
  ...props 
}) => (
  <Button
    variant="primary"
    size="lg"
    className={cn(
      "fixed bottom-6 right-6 !rounded-full w-16 h-16 shadow-2xl shadow-purple-500/50",
      "hover:shadow-3xl hover:shadow-purple-500/60 z-50",
      className
    )}
    {...props}
  >
    {children}
  </Button>
);

Button.displayName = "Button";