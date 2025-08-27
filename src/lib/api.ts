// src/lib/api.ts
// Mock API implementation with exponential backoff and error simulation

import {
  GenerationRequest,
  GenerationResponse,
  ApiError,
  ApiErrorClass,
  RetryConfig,
  RETRY_CONFIG,
  StyleOption,
} from "@/types";
import { delay, randomId, randomChoice, MOCK_GENERATED_IMAGES } from "./utils";

// =====================================
// Mock API Configuration
// =====================================

const API_BASE_URL = "/api"; // Mock API base URL
const ERROR_RATE = 0.2; // 20% error rate as specified
const MIN_PROCESSING_TIME = 1000; // 1 second minimum
const MAX_PROCESSING_TIME = 2000; // 2 seconds maximum

// =====================================
// Error Simulation
// =====================================

function shouldSimulateError(): boolean {
  return Math.random() < ERROR_RATE;
}

function createMockError(): ApiError {
  const errorMessages = [
    "Model overloaded",
    "Server temporarily unavailable", 
    "Generation queue is full",
    "Processing capacity exceeded",
  ];
  
  return {
    name: "ApiError",
    message: randomChoice(errorMessages),
    code: "MODEL_OVERLOADED",
    retryable: true,
    timestamp: new Date().toISOString(),
  };
}

// =====================================
// Mock Response Generation
// =====================================

function createMockResponse(request: GenerationRequest): GenerationResponse {
  const processingTime = Math.floor(
    Math.random() * (MAX_PROCESSING_TIME - MIN_PROCESSING_TIME + 1) + MIN_PROCESSING_TIME
  );
  
  return {
    id: randomId(),
    imageUrl: randomChoice(MOCK_GENERATED_IMAGES),
    prompt: request.prompt,
    style: request.style,
    createdAt: new Date().toISOString(),
    processingTime,
  };
}

// =====================================
// Core API Functions
// =====================================

export async function generateImage(
  request: GenerationRequest,
  signal?: AbortSignal
): Promise<GenerationResponse> {
  // Validate request
  validateGenerationRequest(request);
  
  // Simulate network delay
  const processingTime = Math.floor(
    Math.random() * (MAX_PROCESSING_TIME - MIN_PROCESSING_TIME + 1) + MIN_PROCESSING_TIME
  );
  
  await delay(processingTime);
  
  // Check for abort
  if (signal?.aborted) {
    throw new Error("Request aborted");
  }
  
  // Simulate error
  if (shouldSimulateError()) {
    throw createMockError();
  }
  
  // Return successful response
  return createMockResponse(request);
}

export async function generateImageWithRetry(
  request: GenerationRequest,
  config: RetryConfig = RETRY_CONFIG,
  signal?: AbortSignal,
  onRetry?: (attempt: number, error: ApiError) => void
): Promise<GenerationResponse> {
  let lastError: ApiError | undefined;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await generateImage(request, signal);
    } catch (error) {
      // Check for abort
      if (signal?.aborted) {
        throw new Error("Request aborted");
      }
      
      // Handle API errors
      if (isApiError(error)) {
        lastError = error;
        
        // Don't retry non-retryable errors
        if (!error.retryable) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === config.maxAttempts) {
          throw error;
        }
        
        // Notify retry callback
        onRetry?.(attempt, error);
        
        // Calculate backoff delay
        const backoffDelay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );
        
        // Add jitter (±25%)
        const jitter = backoffDelay * 0.25 * (Math.random() * 2 - 1);
        const delayWithJitter = Math.max(0, backoffDelay + jitter);
        
        console.log(`🔄 Retrying in ${Math.round(delayWithJitter)}ms (attempt ${attempt}/${config.maxAttempts})`);
        
        await delay(delayWithJitter);
      } else {
        // Unknown error, don't retry
        throw error;
      }
    }
  }
  
  throw lastError || new Error("Maximum retry attempts exceeded");
}

// =====================================
// Request Validation
// =====================================

function validateGenerationRequest(request: GenerationRequest): void {
  if (!request.imageDataUrl) {
    throw new ApiErrorClass("Image data URL is required", "VALIDATION_ERROR", false);
  }
  
  if (!request.prompt || request.prompt.trim().length === 0) {
    throw new ApiErrorClass("Prompt is required", "VALIDATION_ERROR", false);
  }
  
  if (request.prompt.trim().length > 500) {
    throw new ApiErrorClass("Prompt is too long (max 500 characters)", "VALIDATION_ERROR", false);
  }
  
  if (!isValidStyle(request.style)) {
    throw new ApiErrorClass("Invalid style option", "VALIDATION_ERROR", false);
  }
  
  // Validate image data URL format
  if (!request.imageDataUrl.startsWith("data:image/")) {
    throw new ApiErrorClass("Invalid image data URL format", "VALIDATION_ERROR", false);
  }
}

function isValidStyle(style: string): style is StyleOption {
  const validStyles: StyleOption[] = ["editorial", "streetwear", "vintage", "luxury", "casual"];
  return validStyles.includes(style as StyleOption);
}

// =====================================
// Error Handling Utilities
// =====================================

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 
         'name' in error && 'message' in error && 'code' in error && 
         'retryable' in error && 'timestamp' in error;
}

// =====================================
// Request Management
// =====================================

export class RequestManager {
  private activeRequests = new Map<string, AbortController>();
  
  async makeRequest<T>(
    requestId: string,
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T> {
    // Cancel existing request with same ID
    this.cancelRequest(requestId);
    
    // Create new abort controller
    const controller = new AbortController();
    this.activeRequests.set(requestId, controller);
    
    try {
      const result = await requestFn(controller.signal);
      this.activeRequests.delete(requestId);
      return result;
    } catch (error) {
      this.activeRequests.delete(requestId);
      throw error;
    }
  }
  
  cancelRequest(requestId: string): void {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }
  
  cancelAllRequests(): void {
    for (const [id, controller] of this.activeRequests) {
      controller.abort();
    }
    this.activeRequests.clear();
  }
  
  isRequestActive(requestId: string): boolean {
    return this.activeRequests.has(requestId);
  }
  
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }
}

// Create singleton instance
export const requestManager = new RequestManager();

// =====================================
// High-Level API Interface
// =====================================

export interface GenerationOptions {
  retryConfig?: Partial<RetryConfig>;
  onRetry?: (attempt: number, error: ApiError) => void;
  onProgress?: (progress: number) => void;
}

export async function createGeneration(
  request: GenerationRequest,
  options: GenerationOptions = {}
): Promise<GenerationResponse> {
  const requestId = request.requestId || randomId();
  const retryConfig = { ...RETRY_CONFIG, ...options.retryConfig };
  
  return requestManager.makeRequest(requestId, async (signal) => {
    // Simulate progress updates
    if (options.onProgress) {
      options.onProgress(10);
      await delay(100);
      options.onProgress(30);
      await delay(200);
      options.onProgress(60);
      await delay(300);
      options.onProgress(90);
    }
    
    const result = await generateImageWithRetry(
      request,
      retryConfig,
      signal,
      options.onRetry
    );
    
    options.onProgress?.(100);
    return result;
  });
}

export function cancelGeneration(requestId: string): void {
  requestManager.cancelRequest(requestId);
}

export function cancelAllGenerations(): void {
  requestManager.cancelAllRequests();
}

// =====================================
// API Status & Health Check
// =====================================

export interface ApiStatus {
  online: boolean;
  latency: number;
  errorRate: number;
  activeRequests: number;
}

export async function getApiStatus(): Promise<ApiStatus> {
  const start = Date.now();
  
  try {
    // Simulate health check
    await delay(Math.random() * 100 + 50);
    
    return {
      online: true,
      latency: Date.now() - start,
      errorRate: ERROR_RATE,
      activeRequests: requestManager.getActiveRequestCount(),
    };
  } catch {
    return {
      online: false,
      latency: -1,
      errorRate: 1,
      activeRequests: requestManager.getActiveRequestCount(),
    };
  }
}

// =====================================
// Development Utilities
// =====================================

export function setErrorRate(rate: number): void {
  if (process.env.NODE_ENV === "development") {
    // In a real app, this would modify the global error rate
    console.log(`🔧 Mock API error rate set to ${(rate * 100).toFixed(1)}%`);
  }
}

export function getRequestMetrics() {
  return {
    activeRequests: requestManager.getActiveRequestCount(),
    errorRate: ERROR_RATE,
    processingTime: { min: MIN_PROCESSING_TIME, max: MAX_PROCESSING_TIME },
  };
}