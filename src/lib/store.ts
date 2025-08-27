// src/lib/store.ts
// Global state management with Zustand

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  AppState,
  GenerationRequest,
  GenerationResponse,
  ImageFile,
  StyleOption,
  HistoryItem,
  ApiError,
  ApiErrorClass,
  RetryConfig,
  RETRY_CONFIG,
} from "@/types";
import {
  createGeneration,
  cancelGeneration,
  cancelAllGenerations,
} from "./api";
import {
  saveHistoryItem,
  getHistoryItems,
  removeHistoryItem,
  clearHistory,
  toggleHistoryItemFavorite,
  saveSettings,
  getSettings,
  addRecentPrompt,
  updateSessionActivity,
  incrementGenerationCount,
  addToUploadSize,
} from "./storage";
import { validatePrompt, validateImageFile, randomId } from "./utils";

// =====================================
// Store Interface
// =====================================

interface ModeliaStore extends AppState {
  // Actions
  actions: {
    // Upload actions
    setCurrentImage: (image: ImageFile | undefined) => void;
    setUploadDragging: (dragging: boolean) => void;
    setUploadProcessing: (processing: boolean) => void;
    setUploadError: (error: string | undefined) => void;
    
    // Form actions
    setPrompt: (prompt: string) => void;
    setStyle: (style: StyleOption) => void;
    validateForm: () => boolean;
    resetForm: () => void;
    
    // Generation actions
    startGeneration: () => Promise<void>;
    abortGeneration: () => void;
    retryGeneration: () => Promise<void>;
    
    // History actions
    loadHistory: () => void;
    selectHistoryItem: (item: HistoryItem) => void;
    removeFromHistory: (id: string) => void;
    clearAllHistory: () => void;
    toggleFavorite: (id: string) => void;
    
    // UI actions
    toggleSidebar: () => void;
    setTheme: (theme: "dark" | "light") => void;
    openModal: (modalId: string) => void;
    closeModal: (modalId?: string) => void;
    
    // Settings actions
    updateSettings: (settings: Partial<AppState["settings"]>) => void;
    resetSettings: () => void;
    
    // PWA actions
    setPWAInstallPrompt: (prompt: any) => void;
    installPWA: () => Promise<void>;
    
    // Performance tracking
    recordPerformanceMetric: (metric: string, value: number) => void;
    
    // Session management
    initializeSession: () => void;
    updateActivity: () => void;
  };
}

// =====================================
// Initial State
// =====================================

const createInitialState = (): AppState => ({
  // Upload state
  upload: {
    isDragging: false,
    isProcessing: false,
    currentImage: undefined,
    error: undefined,
  },
  
  // Preview state
  preview: {
    currentImage: undefined,
    currentPrompt: "",
    currentStyle: "editorial",
    isGenerating: false,
    showComparison: false,
  },
  
  // Generation state
  generation: {
    status: "idle",
    progress: 0,
    currentRequest: undefined,
    result: undefined,
    error: undefined,
    retryCount: 0,
    canRetry: false,
    abortController: undefined,
  },
  
  // History state
  history: {
    items: [],
    maxItems: 5,
    currentItem: undefined,
    filters: {},
  },
  
  // Form state
  form: {
    prompt: {
      value: "",
      isValid: false,
    },
    style: {
      value: "editorial",
      isValid: true,
    },
    image: {
      isValid: false,
    },
  },
  
  // UI state
  theme: "dark",
  sidebarOpen: false,
  modalStack: [],
  
  // PWA state
  pwa: {
    canInstall: false,
    installPrompt: undefined,
    isInstalled: false,
    platform: "unknown",
  },
  
  // Performance metrics
  performance: {},
  
  // Settings
  settings: getSettings(),
});

// =====================================
// Zustand Store
// =====================================

export const useModeliaStore = create<ModeliaStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...createInitialState(),
        
        actions: {
          // ============================
          // Upload Actions
          // ============================
          
          setCurrentImage: (image) => {
            set((state) => ({
              upload: { ...state.upload, currentImage: image, error: undefined },
              preview: { ...state.preview, currentImage: image },
              form: {
                ...state.form,
                image: { file: image, isValid: !!image, error: undefined },
              },
            }));
            
            if (image) {
              addToUploadSize(image.originalSize);
            }
          },
          
          setUploadDragging: (dragging) => {
            set((state) => ({
              upload: { ...state.upload, isDragging: dragging },
            }));
          },
          
          setUploadProcessing: (processing) => {
            set((state) => ({
              upload: { ...state.upload, isProcessing: processing },
            }));
          },
          
          setUploadError: (error) => {
            set((state) => ({
              upload: { ...state.upload, error },
              form: {
                ...state.form,
                image: { ...state.form.image, error },
              },
            }));
          },
          
          // ============================
          // Form Actions
          // ============================
          
          setPrompt: (prompt) => {
            const validation = validatePrompt(prompt);
            
            set((state) => ({
              preview: { ...state.preview, currentPrompt: prompt },
              form: {
                ...state.form,
                prompt: {
                  value: prompt,
                  isValid: validation.isValid,
                  error: validation.errors.required?.[0] || validation.errors.minLength?.[0] || validation.errors.maxLength?.[0] || validation.errors.content?.[0],
                },
              },
            }));
          },
          
          setStyle: (style) => {
            set((state) => ({
              preview: { ...state.preview, currentStyle: style },
              form: {
                ...state.form,
                style: { value: style, isValid: true },
              },
            }));
          },
          
          validateForm: () => {
            const state = get();
            const { form } = state;
            
            return form.prompt.isValid && form.style.isValid && form.image.isValid;
          },
          
          resetForm: () => {
            set((state) => ({
              form: {
                prompt: { value: "", isValid: false },
                style: { value: "editorial", isValid: true },
                image: { isValid: false },
              },
              preview: {
                ...state.preview,
                currentPrompt: "",
                currentStyle: "editorial",
              },
            }));
          },
          
          // ============================
          // Generation Actions
          // ============================
          
          startGeneration: async () => {
            const state = get();
            const { actions } = get();
            
            if (!actions.validateForm()) {
              console.error("Form validation failed");
              return;
            }
            
            const { currentImage, currentPrompt, currentStyle } = state.preview;
            
            if (!currentImage) {
              console.error("No image selected");
              return;
            }
            
            const requestId = randomId();
            const request: GenerationRequest = {
              imageDataUrl: currentImage.dataUrl,
              prompt: currentPrompt.trim(),
              style: currentStyle,
              requestId,
            };
            
            // Update state to show generation in progress
            set((state) => ({
              generation: {
                ...state.generation,
                status: "generating",
                progress: 0,
                currentRequest: request,
                result: undefined,
                error: undefined,
                retryCount: 0,
                canRetry: false,
              },
              preview: { ...state.preview, isGenerating: true },
            }));
            
            try {
              const result = await createGeneration(request, {
                retryConfig: RETRY_CONFIG,
                onRetry: (attempt, error) => {
                  set((state) => ({
                    generation: {
                      ...state.generation,
                      retryCount: attempt,
                      error,
                    },
                  }));
                },
                onProgress: (progress) => {
                  set((state) => ({
                    generation: { ...state.generation, progress },
                  }));
                },
              });
              
              // Success - update state and save to history
              set((state) => ({
                generation: {
                  ...state.generation,
                  status: "success",
                  progress: 100,
                  result,
                  error: undefined,
                  canRetry: false,
                },
                preview: { ...state.preview, isGenerating: false },
              }));
              
              // Save to history
              const historyItem: HistoryItem = {
                ...result,
                thumbnail: currentImage.dataUrl,
              };
              
              saveHistoryItem(historyItem);
              actions.loadHistory();
              
              // Add prompt to recent prompts
              addRecentPrompt(currentPrompt.trim());
              
              // Update session stats
              incrementGenerationCount();
              updateSessionActivity();
              
            } catch (error: any) {
              // Handle error
              const apiError: ApiError = {
                name: "ApiError",
                message: error.message || "Generation failed",
                code: error.code || "UNKNOWN_ERROR",
                retryable: error.retryable ?? true,
                timestamp: new Date().toISOString(),
              };
              
              set((state) => ({
                generation: {
                  ...state.generation,
                  status: "error",
                  error: apiError,
                  canRetry: apiError.retryable && state.generation.retryCount < RETRY_CONFIG.maxAttempts,
                },
                preview: { ...state.preview, isGenerating: false },
              }));
            }
          },
          
          abortGeneration: () => {
            const state = get();
            const requestId = state.generation.currentRequest?.requestId;
            
            if (requestId) {
              cancelGeneration(requestId);
            }
            
            set((state) => ({
              generation: {
                ...state.generation,
                status: "aborted",
                progress: 0,
                error: undefined,
                canRetry: false,
              },
              preview: { ...state.preview, isGenerating: false },
            }));
          },
          
          retryGeneration: async () => {
            const state = get();
            const { currentRequest } = state.generation;
            
            if (!currentRequest || !state.generation.canRetry) {
              return;
            }
            
            // Reset state and retry
            set((state) => ({
              generation: {
                ...state.generation,
                status: "generating",
                progress: 0,
                error: undefined,
              },
              preview: { ...state.preview, isGenerating: true },
            }));
            
            // Use the existing startGeneration logic
            await get().actions.startGeneration();
          },
          
          // ============================
          // History Actions
          // ============================
          
          loadHistory: () => {
            const items = getHistoryItems();
            set((state) => ({
              history: { ...state.history, items },
            }));
          },
          
          selectHistoryItem: (item) => {
            set((state) => ({
              history: { ...state.history, currentItem: item },
              preview: {
                ...state.preview,
                currentPrompt: item.prompt,
                currentStyle: item.style,
                showComparison: true,
              },
              form: {
                ...state.form,
                prompt: { value: item.prompt, isValid: true },
                style: { value: item.style, isValid: true },
              },
            }));
          },
          
          removeFromHistory: (id) => {
            removeHistoryItem(id);
            get().actions.loadHistory();
          },
          
          clearAllHistory: () => {
            clearHistory();
            set((state) => ({
              history: { ...state.history, items: [], currentItem: undefined },
            }));
          },
          
          toggleFavorite: (id) => {
            toggleHistoryItemFavorite(id);
            get().actions.loadHistory();
          },
          
          // ============================
          // UI Actions
          // ============================
          
          toggleSidebar: () => {
            set((state) => ({
              sidebarOpen: !state.sidebarOpen,
            }));
          },
          
          setTheme: (theme) => {
            set({ theme });
            saveSettings({ theme });
          },
          
          openModal: (modalId) => {
            set((state) => ({
              modalStack: [...state.modalStack, modalId],
            }));
          },
          
          closeModal: (modalId) => {
            set((state) => ({
              modalStack: modalId
                ? state.modalStack.filter(id => id !== modalId)
                : state.modalStack.slice(0, -1),
            }));
          },
          
          // ============================
          // Settings Actions
          // ============================
          
          updateSettings: (newSettings) => {
            set((state) => ({
              settings: { ...state.settings, ...newSettings },
            }));
            saveSettings(newSettings);
          },
          
          resetSettings: () => {
            const defaultSettings = getSettings();
            set({ settings: defaultSettings });
          },
          
          // ============================
          // PWA Actions
          // ============================
          
          setPWAInstallPrompt: (prompt) => {
            set((state) => ({
              pwa: {
                ...state.pwa,
                canInstall: !!prompt,
                installPrompt: prompt,
              },
            }));
          },
          
          installPWA: async () => {
            const state = get();
            const { installPrompt } = state.pwa;
            
            if (!installPrompt) return;
            
            try {
              await installPrompt.prompt();
              const result = await installPrompt.userChoice;
              
              if (result.outcome === "accepted") {
                set((state) => ({
                  pwa: {
                    ...state.pwa,
                    isInstalled: true,
                    canInstall: false,
                    installPrompt: undefined,
                  },
                }));
              }
            } catch (error) {
              console.error("PWA installation failed:", error);
            }
          },
          
          // ============================
          // Performance Actions
          // ============================
          
          recordPerformanceMetric: (metric, value) => {
            set((state) => ({
              performance: {
                ...state.performance,
                [metric]: value,
              },
            }));
          },
          
          // ============================
          // Session Actions
          // ============================
          
          initializeSession: () => {
            updateSessionActivity();
            get().actions.loadHistory();
          },
          
          updateActivity: () => {
            updateSessionActivity();
          },
        },
      }),
      {
        name: "modelia-store",
        partialize: (state) => ({
          settings: state.settings,
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: "modelia-store" }
  )
);

// =====================================
// Selectors (for performance)
// =====================================

export const selectUploadState = (state: ModeliaStore) => state.upload;
export const selectPreviewState = (state: ModeliaStore) => state.preview;
export const selectGenerationState = (state: ModeliaStore) => state.generation;
export const selectHistoryState = (state: ModeliaStore) => state.history;
export const selectFormState = (state: ModeliaStore) => state.form;
export const selectUIState = (state: ModeliaStore) => ({
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  modalStack: state.modalStack,
});

// =====================================
// Hook Utilities
// =====================================

export function useActions() {
  return useModeliaStore((state) => state.actions);
}

export function useGenerationStatus() {
  return useModeliaStore(selectGenerationState);
}

export function useHistoryItems() {
  return useModeliaStore((state) => state.history.items);
}

export function useFormValidation() {
  return useModeliaStore((state) => ({
    ...selectFormState(state),
    isValid: state.actions.validateForm(),
  }));
}

// Initialize store on first load
if (typeof window !== "undefined") {
  useModeliaStore.getState().actions.initializeSession();
}