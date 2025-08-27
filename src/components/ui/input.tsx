// src/components/ui/Input.tsx
import React from "react";
import { InputProps } from "@/types";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  maxLength,
  className,
  testId,
  onKeyDown,
  onFocus,
  onBlur,
  ...accessibilityProps
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        data-testid={testId}
        className={cn(
          // Base styles
          "w-full px-4 py-3 rounded-xl border backdrop-blur-sm",
          "font-medium text-white placeholder:text-white/50",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          
          // Default state
          "bg-white/5 border-white/20",
          "hover:bg-white/10 hover:border-white/30",
          
          // Error state
          error && "border-red-500/50 bg-red-500/5 focus:ring-red-500",
          
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:hover:bg-white/5 disabled:hover:border-white/20",
          
          className
        )}
        {...accessibilityProps}
      />
      
      {/* Error icon */}
      {error && (
        <AlertCircle 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" 
          size={18}
        />
      )}
      
      {/* Character count */}
      {maxLength && (
        <div className="absolute right-3 bottom-1 text-xs text-white/40">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

// Textarea variant for longer text input
interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  resize?: boolean;
  className?: string;
  testId?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  maxLength,
  rows = 4,
  resize = false,
  className,
  testId,
  onKeyDown,
  onFocus,
  onBlur,
  ...accessibilityProps
}) => {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={rows}
        data-testid={testId}
        className={cn(
          // Base styles
          "w-full px-4 py-3 rounded-xl border backdrop-blur-sm",
          "font-medium text-white placeholder:text-white/50",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          
          // Default state
          "bg-white/5 border-white/20",
          "hover:bg-white/10 hover:border-white/30",
          
          // Error state
          error && "border-red-500/50 bg-red-500/5 focus:ring-red-500",
          
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Resize
          resize ? "resize-y" : "resize-none",
          
          className
        )}
        {...accessibilityProps}
      />
      
      {/* Error icon */}
      {error && (
        <AlertCircle 
          className="absolute right-3 top-3 text-red-400" 
          size={18}
        />
      )}
      
      {/* Character count */}
      {maxLength && (
        <div className="absolute right-3 bottom-2 text-xs text-white/40">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

// Password input with toggle visibility
interface PasswordInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (value: string) => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter password...",
  error,
  disabled = false,
  required = false,
  className,
  testId,
  ...accessibilityProps
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        data-testid={testId}
        className={cn(
          // Base styles
          "w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-sm",
          "font-medium text-white placeholder:text-white/50",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          
          // Default state
          "bg-white/5 border-white/20",
          "hover:bg-white/10 hover:border-white/30",
          
          // Error state
          error && "border-red-500/50 bg-red-500/5 focus:ring-red-500",
          
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          
          className
        )}
        {...accessibilityProps}
      />
      
      {/* Toggle password visibility */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
      
      {/* Error icon (positioned differently when toggle is present) */}
      {error && (
        <AlertCircle 
          className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-400" 
          size={18}
        />
      )}
    </div>
  );
};

// Search input with search icon
interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onSearch?: (value: string) => void;
  onChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className,
  testId,
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn("pl-12", className)}
        testId={testId}
        onKeyDown={handleKeyDown}
        {...props}
      />
      
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
    </div>
  );
};

// Input with floating label
interface FloatingLabelInputProps extends Omit<InputProps, 'placeholder'> {
  label: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  className,
  testId,
  ...props
}) => {
  const [focused, setFocused] = React.useState(false);
  const hasValue = value.length > 0;
  const isLabelFloated = focused || hasValue;

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-testid={testId}
        className={cn(
          "w-full px-4 pt-6 pb-2 rounded-xl border backdrop-blur-sm",
          "font-medium text-white transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30",
          error && "border-red-500/50 bg-red-500/5 focus:ring-red-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 ease-in-out pointer-events-none",
          isLabelFloated 
            ? "top-2 text-xs text-purple-400" 
            : "top-1/2 -translate-y-1/2 text-base text-white/50",
          error && isLabelFloated && "text-red-400"
        )}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {error && (
        <AlertCircle 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" 
          size={18}
        />
      )}
    </div>
  );
};

// Field wrapper with label and error message
interface FieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  required,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-semibold text-white/90">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

Input.displayName = "Input";
Textarea.displayName = "Textarea";
PasswordInput.displayName = "PasswordInput";
SearchInput.displayName = "SearchInput";
FloatingLabelInput.displayName = "FloatingLabelInput";
Field.displayName = "Field";