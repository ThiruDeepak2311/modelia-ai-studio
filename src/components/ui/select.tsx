// src/components/ui/Select.tsx
import React, { useState, useRef, useEffect } from "react";
import { BaseComponentProps, AccessibilityProps, StyleOption, STYLE_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, X } from "lucide-react";

interface SelectProps extends BaseComponentProps, AccessibilityProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select an option...",
  disabled = false,
  error,
  options,
  className,
  testId,
  ...accessibilityProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          const option = options[highlightedIndex];
          if (!option.disabled) {
            onValueChange(option.value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
        } else {
          setIsOpen(true);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const nextIndex = Math.min(highlightedIndex + 1, options.length - 1);
          setHighlightedIndex(nextIndex);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          const prevIndex = Math.max(highlightedIndex - 1, 0);
          setHighlightedIndex(prevIndex);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: typeof options[0]) => {
    if (!option.disabled) {
      onValueChange(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div
      ref={selectRef}
      className={cn("relative", className)}
      data-testid={testId}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-sm",
          "font-medium text-left transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          
          // Default state
          "bg-white/5 border-white/20 text-white",
          "hover:bg-white/10 hover:border-white/30",
          
          // Open state
          isOpen && "bg-white/10 border-white/30 ring-2 ring-purple-500",
          
          // Error state
          error && "border-red-500/50 bg-red-500/5 focus:ring-red-500",
          
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:hover:bg-white/5 disabled:hover:border-white/20"
        )}
        {...accessibilityProps}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-white/50"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <ChevronDown
          className={cn(
            "flex-shrink-0 ml-2 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          size={16}
        />
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
          <X size={12} />
          {error}
        </p>
      )}

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <ul
            ref={listRef}
            role="listbox"
            className={cn(
              "max-h-60 overflow-auto py-1 rounded-xl border backdrop-blur-xl",
              "bg-black/90 border-white/20 shadow-2xl"
            )}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  "px-4 py-3 cursor-pointer flex items-center justify-between",
                  "transition-colors duration-150",
                  
                  // Hover state
                  "hover:bg-white/10",
                  
                  // Highlighted state
                  index === highlightedIndex && "bg-white/10",
                  
                  // Selected state
                  option.value === value && "bg-purple-600/20 text-purple-400",
                  
                  // Disabled state
                  option.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-white/60 mt-1 truncate">
                      {option.description}
                    </div>
                  )}
                </div>
                
                {option.value === value && (
                  <Check size={16} className="flex-shrink-0 ml-2 text-purple-400" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Style selector component specifically for fashion styles
interface StyleSelectorProps {
  value: StyleOption;
  onValueChange: (value: StyleOption) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  value,
  onValueChange,
  className,
  disabled = false,
  error,
}) => {
  const styleOptions = STYLE_OPTIONS.map(style => ({
    value: style.id,
    label: style.label,
    description: style.description,
  }));

  return (
    <Select
      value={value}
      onValueChange={onValueChange as (value: string) => void}
      options={styleOptions}
      placeholder="Choose a style..."
      disabled={disabled}
      error={error}
      className={className}
      testId="style-selector"
    />
  );
};

// Multi-select component
interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onValueChange'> {
  values: string[];
  onValuesChange: (values: string[]) => void;
  maxSelections?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  values,
  onValuesChange,
  maxSelections,
  placeholder = "Select options...",
  options,
  className,
  disabled = false,
  error,
  testId,
  ...accessibilityProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter(option => values.includes(option.value));
  const isMaxReached = maxSelections && values.length >= maxSelections;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: typeof options[0]) => {
    if (option.disabled) return;

    const isSelected = values.includes(option.value);
    
    if (isSelected) {
      // Remove from selection
      onValuesChange(values.filter(v => v !== option.value));
    } else if (!isMaxReached) {
      // Add to selection
      onValuesChange([...values, option.value]);
    }
  };

  const removeSelection = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange(values.filter(v => v !== valueToRemove));
  };

  return (
    <div ref={selectRef} className={cn("relative", className)} data-testid={testId}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-sm",
          "font-medium text-left transition-all duration-200 ease-in-out min-h-[3rem]",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          
          "bg-white/5 border-white/20 text-white",
          "hover:bg-white/10 hover:border-white/30",
          
          isOpen && "bg-white/10 border-white/30 ring-2 ring-purple-500",
          error && "border-red-500/50 bg-red-500/5 focus:ring-red-500",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        {...accessibilityProps}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-w-0">
          {selectedOptions.length === 0 ? (
            <span className="text-white/50">{placeholder}</span>
          ) : (
            selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded-md text-sm"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => removeSelection(option.value, e)}
                  className="hover:text-purple-200 transition-colors"
                  aria-label={`Remove ${option.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
        
        <ChevronDown
          className={cn(
            "flex-shrink-0 ml-2 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          size={16}
        />
      </button>

      {/* Selection count */}
      {maxSelections && (
        <p className="text-xs text-white/60 mt-1">
          {values.length} of {maxSelections} selected
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
          <X size={12} />
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <ul className={cn(
            "max-h-60 overflow-auto py-1 rounded-xl border backdrop-blur-xl",
            "bg-black/90 border-white/20 shadow-2xl"
          )}>
            {options.map(option => {
              const isSelected = values.includes(option.value);
              const canSelect = !isMaxReached || isSelected;
              
              return (
                <li
                  key={option.value}
                  className={cn(
                    "px-4 py-3 cursor-pointer flex items-center justify-between",
                    "transition-colors duration-150",
                    "hover:bg-white/10",
                    isSelected && "bg-purple-600/20",
                    (option.disabled || !canSelect) && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium truncate",
                      isSelected ? "text-purple-400" : "text-white"
                    )}>
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-white/60 mt-1 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <Check size={16} className="flex-shrink-0 ml-2 text-purple-400" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

Select.displayName = "Select";
StyleSelector.displayName = "StyleSelector";
MultiSelect.displayName = "MultiSelect";