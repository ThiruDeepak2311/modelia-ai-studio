// src/lib/utils.ts
// Core utility functions for Modelia AI Studio

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  ImageFile, 
  ImageProcessingOptions, 
  ValidationResult,
  IMAGE_PROCESSING_DEFAULTS,
  MAX_FILE_SIZE 
} from "@/types";

// =====================================
// Tailwind CSS Utilities
// =====================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =====================================
// Image Processing Utilities
// =====================================

export async function processImageFile(
  file: File,
  options: Partial<ImageProcessingOptions> = {}
): Promise<ImageFile> {
  const opts = { ...IMAGE_PROCESSING_DEFAULTS, ...options };
  
  // Validate file
  if (!file.type.match(/^image\/(png|jpe?g|webp)$/)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${formatFileSize(file.size)}. Maximum: ${formatFileSize(MAX_FILE_SIZE)}`);
  }

  // Get image dimensions
  const dimensions = await getImageDimensions(file);
  
  // Process image if needed
  const processedDataUrl = await resizeImage(file, opts, dimensions);
  
  // Calculate processed size
  const processedSize = getBase64Size(processedDataUrl);
  
  return {
    file,
    dataUrl: processedDataUrl,
    originalSize: file.size,
    processedSize,
    dimensions,
    format: getImageFormat(file.type)
  };
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

async function resizeImage(
  file: File,
  options: ImageProcessingOptions,
  originalDimensions: { width: number; height: number }
): Promise<string> {
  const { maxWidth, maxHeight, quality, format } = options;
  const { width: origWidth, height: origHeight } = originalDimensions;
  
  // Calculate new dimensions
  const ratio = Math.min(maxWidth / origWidth, maxHeight / origHeight, 1);
  const newWidth = Math.round(origWidth * ratio);
  const newHeight = Math.round(origHeight * ratio);
  
  // If no resizing needed, return original as data URL
  if (ratio === 1 && format === getImageFormat(file.type)) {
    return fileToDataUrl(file);
  }
  
  // Create canvas and resize
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  // Load and draw image
  const img = await loadImage(file);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
  // Convert to desired format
  const mimeType = format === "webp" ? "image/webp" : "image/jpeg";
  return canvas.toDataURL(mimeType, quality);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function getImageFormat(mimeType: string): "png" | "jpg" | "jpeg" | "webp" {
  switch (mimeType) {
    case "image/png": return "png";
    case "image/jpeg": return "jpeg";
    case "image/jpg": return "jpg";
    case "image/webp": return "webp";
    default: return "jpeg";
  }
}

function getBase64Size(dataUrl: string): number {
  // Estimate size from base64 data URL
  const base64 = dataUrl.split(",")[1];
  return Math.round((base64.length * 3) / 4);
}

// =====================================
// File Utilities
// =====================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isImageFile(file: File): boolean {
  return file.type.match(/^image\/(png|jpe?g|webp)$/) !== null;
}

export function validateImageFile(file: File): ValidationResult {
  const errors: Record<string, string[]> = {};
  
  if (!isImageFile(file)) {
    errors.type = ["Please select a valid image file (PNG, JPG, JPEG, or WebP)"];
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.size = [`File is too large (${formatFileSize(file.size)}). Maximum allowed: ${formatFileSize(MAX_FILE_SIZE)}`];
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// =====================================
// Prompt Validation
// =====================================

export function validatePrompt(prompt: string): ValidationResult {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  
  const trimmed = prompt.trim();
  
  if (!trimmed) {
    errors.required = ["Prompt is required"];
  } else {
    if (trimmed.length < 3) {
      errors.minLength = ["Prompt must be at least 3 characters"];
    }
    
    if (trimmed.length > 500) {
      errors.maxLength = ["Prompt must be less than 500 characters"];
    }
    
    if (trimmed.length < 10) {
      warnings.suggestion = ["Consider adding more detail for better results"];
    }
    
    // Check for potentially problematic content
    const problematicWords = ["nsfw", "nude", "explicit"];
    const hasProblematic = problematicWords.some(word => 
      trimmed.toLowerCase().includes(word)
    );
    
    if (hasProblematic) {
      errors.content = ["Prompt contains inappropriate content"];
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
}

// =====================================
// Async Utilities
// =====================================

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
}

// =====================================
// Random Utilities (for mock data)
// =====================================

export function randomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Mock image URLs for generated results
export const MOCK_GENERATED_IMAGES = [
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1200&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1200&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1506629905607-d52b3e5eb4bb?w=800&h=1200&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1544966503-7e3ac882b2f7?w=800&h=1200&fit=crop&crop=center",
];

// =====================================
// Date & Time Utilities
// =====================================

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// =====================================
// Error Handling Utilities
// =====================================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleError(error: unknown): { message: string; code: string } {
  if (isAppError(error)) {
    return { message: error.message, code: error.code };
  }
  
  if (error instanceof Error) {
    return { message: error.message, code: "UNKNOWN_ERROR" };
  }
  
  return { message: "An unexpected error occurred", code: "UNKNOWN_ERROR" };
}

// =====================================
// Performance Utilities
// =====================================

export function measurePerformance<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      if (process.env.NODE_ENV === "development") {
        console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
      }
      
      resolve({ result, duration });
    } catch (error) {
      reject(error);
    }
  });
}

// =====================================
// Accessibility Utilities
// =====================================

export function generateAriaLabel(baseLabel: string, additionalInfo?: string): string {
  return additionalInfo ? `${baseLabel}, ${additionalInfo}` : baseLabel;
}

export function announceLiveRegion(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}