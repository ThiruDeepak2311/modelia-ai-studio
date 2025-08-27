// src/types/index.ts
// Complete TypeScript definitions for Modelia AI Studio

// =====================================
// Core Application Types
// =====================================

export type StyleOption = 'editorial' | 'streetwear' | 'vintage' | 'luxury' | 'casual';

export interface StyleDefinition {
  id: StyleOption;
  label: string;
  description: string;
  gradient: string; // For UI styling
}

// =====================================
// Image Processing Types
// =====================================

export interface ImageFile {
  file: File;
  dataUrl: string;
  originalSize: number;
  processedSize?: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: 'png' | 'jpg' | 'jpeg' | 'webp';
}

export interface ImageProcessingOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg';
}

// =====================================
// API Types
// =====================================

export interface GenerationRequest {
  imageDataUrl: string;
  prompt: string;
  style: StyleOption;
  requestId?: string;
}

export interface GenerationResponse {
  id: string;
  imageUrl: string;
  prompt: string;
  style: StyleOption;
  createdAt: string;
  processingTime?: number;
}

export interface ApiError {
  name: string;
  message: string;
  code: string;
  retryable: boolean;
  timestamp: string;
}

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

// =====================================
// Generation State Management
// =====================================

export interface GenerationState {
  status: 'idle' | 'uploading' | 'generating' | 'success' | 'error' | 'aborted';
  progress: number;
  currentRequest?: GenerationRequest;
  result?: GenerationResponse;
  error?: ApiError;
  retryCount: number;
  canRetry: boolean;
  abortController?: AbortController;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// =====================================
// History Management
// =====================================

export interface HistoryItem extends GenerationResponse {
  thumbnail?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface HistoryState {
  items: HistoryItem[];
  maxItems: number;
  currentItem?: HistoryItem;
  filters: {
    style?: StyleOption;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

// =====================================
// UI Component Types
// =====================================

export interface UploadState {
  isDragging: boolean;
  isProcessing: boolean;
  currentImage?: ImageFile;
  error?: string;
}

export interface PreviewState {
  currentImage?: ImageFile;
  currentPrompt: string;
  currentStyle: StyleOption;
  isGenerating: boolean;
  showComparison: boolean;
}

// =====================================
// Form Validation Types
// =====================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

export interface FormState {
  prompt: {
    value: string;
    error?: string;
    isValid: boolean;
  };
  style: {
    value: StyleOption;
    isValid: boolean;
  };
  image: {
    file?: ImageFile;
    error?: string;
    isValid: boolean;
  };
}

// =====================================
// Accessibility Types
// =====================================

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  role?: string;
  tabIndex?: number;
}

// =====================================
// Performance & Analytics Types
// =====================================

export interface PerformanceMetrics {
  uploadTime?: number;
  processingTime?: number;
  renderTime?: number;
  bundleSize?: number;
  imageOptimization?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
}

export interface AnalyticsEvent {
  name: string;
  category: 'user_interaction' | 'generation' | 'error' | 'performance';
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

// =====================================
// PWA Types
// =====================================

export interface PWAInstallPrompt {
  canInstall: boolean;
  installPrompt?: any;
  isInstalled: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

// =====================================
// Global App State
// =====================================

export interface AppState {
  // Core functionality
  upload: UploadState;
  preview: PreviewState;
  generation: GenerationState;
  history: HistoryState;
  form: FormState;
  
  // UI state
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  modalStack: string[];
  
  // Features
  pwa: PWAInstallPrompt;
  performance: PerformanceMetrics;
  
  // Settings
  settings: {
    autoRetry: boolean;
    saveToHistory: boolean;
    compressionQuality: number;
    maxFileSize: number;
  };
}

// =====================================
// Component Props Types
// =====================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface ButtonProps extends BaseComponentProps, AccessibilityProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps, AccessibilityProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  validation?: (value: string) => ValidationResult;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

// =====================================
// Testing Types
// =====================================

export interface TestScenario {
  name: string;
  description: string;
  setup: () => void;
  teardown: () => void;
  assertions: () => void;
}

export interface E2ETestContext {
  page: any; // Playwright Page
  baseUrl: string;
  testData: {
    validImage: string;
    validPrompt: string;
    validStyle: StyleOption;
  };
}

// =====================================
// API Error Class Export  
// =====================================

export class ApiErrorClass extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public retryable: boolean = false,
    public timestamp: string = new Date().toISOString()
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// =====================================
// Utility Types
// =====================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// =====================================
// Constants Export
// =====================================

export const STYLE_OPTIONS: StyleDefinition[] = [
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'High-fashion magazine style',
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    id: 'streetwear',
    label: 'Streetwear',
    description: 'Urban and contemporary',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'vintage',
    label: 'Vintage',
    description: 'Classic and timeless',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: 'Premium and sophisticated',
    gradient: 'from-gold-500 to-yellow-600'
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Relaxed and comfortable',
    gradient: 'from-blue-500 to-teal-600'
  }
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_HISTORY_ITEMS = 5;
export const RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  backoffMultiplier: 2
};

export const IMAGE_PROCESSING_DEFAULTS: ImageProcessingOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  format: 'webp'
};