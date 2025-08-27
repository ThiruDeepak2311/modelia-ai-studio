// src/components/ui/Modal.tsx
import React, { useEffect } from "react";
import { BaseComponentProps, AccessibilityProps } from "@/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { IconButton } from "./button";

interface ModalProps extends BaseComponentProps, AccessibilityProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const modalSizes = {
  sm: "max-w-md",
  md: "max-w-lg", 
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw] max-h-[90vh]",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className,
  testId,
  ...accessibilityProps
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid={testId}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div
        className={cn(
          "relative w-full bg-black/90 backdrop-blur-xl border border-white/20",
          "rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          modalSizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        {...accessibilityProps}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-white"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <IconButton
                icon={<X size={18} />}
                onClick={onClose}
                variant="ghost"
                size="sm"
                aria-label="Close modal"
              />
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal body component
export const ModalBody: React.FC<BaseComponentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};

// Modal footer component
export const ModalFooter: React.FC<BaseComponentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      "flex items-center justify-end gap-3 p-6 border-t border-white/10",
      className
    )}>
      {children}
    </div>
  );
};

// Confirmation dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: "🚨",
      confirmButtonVariant: "danger" as const,
      titleColor: "text-red-400",
    },
    warning: {
      icon: "⚠️",
      confirmButtonVariant: "primary" as const,
      titleColor: "text-yellow-400",
    },
    info: {
      icon: "ℹ️",
      confirmButtonVariant: "primary" as const,
      titleColor: "text-blue-400",
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalBody>
        <div className="text-center">
          <div className="text-4xl mb-4">{style.icon}</div>
          <h3 className={cn("text-lg font-semibold mb-2", style.titleColor)}>
            {title}
          </h3>
          <p className="text-white/70 mb-6">{message}</p>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-white/70 hover:text-white transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={cn(
            "px-6 py-2 rounded-lg font-semibold transition-colors",
            style.confirmButtonVariant === "danger"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          )}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// Image preview modal
interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  src,
  alt,
  title,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={title}
      className="bg-black/95"
    >
      <div className="flex items-center justify-center p-6">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </Modal>
  );
};

// Loading modal
interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  progress?: number;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title = "Loading...",
  message,
  progress,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Can't close loading modal
      size="sm"
      showCloseButton={false}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <ModalBody>
        <div className="text-center py-8">
          {/* Loading spinner */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          
          {message && (
            <p className="text-white/70 text-sm mb-4">{message}</p>
          )}
          
          {progress !== undefined && (
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          )}
          
          {progress !== undefined && (
            <p className="text-xs text-white/60">{Math.round(progress)}%</p>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

// Toast notification (modal-like overlay)
interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  isVisible,
  message,
  type = "info",
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeStyles = {
    success: "bg-green-600/90 border-green-500/50 text-white",
    error: "bg-red-600/90 border-red-500/50 text-white",
    warning: "bg-yellow-600/90 border-yellow-500/50 text-white",
    info: "bg-purple-600/90 border-purple-500/50 text-white",
  };

  const typeIcons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ",
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm",
          "animate-in slide-in-from-top-2 fade-in-0 duration-300",
          typeStyles[type]
        )}
      >
        <span className="text-lg">{typeIcons[type]}</span>
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

Modal.displayName = "Modal";
ModalBody.displayName = "ModalBody";
ModalFooter.displayName = "ModalFooter";
ConfirmDialog.displayName = "ConfirmDialog";
ImagePreviewModal.displayName = "ImagePreviewModal";
LoadingModal.displayName = "LoadingModal";
Toast.displayName = "Toast";