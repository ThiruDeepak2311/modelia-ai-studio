// src/lib/storage.ts
// localStorage utilities for history and settings persistence

import { HistoryItem, MAX_HISTORY_ITEMS } from "@/types";

// =====================================
// Storage Keys
// =====================================

const STORAGE_KEYS = {
  HISTORY: "modelia_generation_history",
  SETTINGS: "modelia_user_settings",
  SESSION: "modelia_session_data",
  PREFERENCES: "modelia_user_preferences",
} as const;

// =====================================
// Generic Storage Utilities
// =====================================

export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function safeStorageOperation<T>(
  operation: () => T,
  fallback: T,
  operationName: string
): T {
  try {
    if (!isStorageAvailable()) {
      console.warn(`localStorage not available for ${operationName}`);
      return fallback;
    }
    return operation();
  } catch (error) {
    console.error(`Storage operation failed (${operationName}):`, error);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  safeStorageOperation(
    () => localStorage.setItem(key, JSON.stringify(value)),
    undefined,
    `setItem(${key})`
  );
}

function getItem<T>(key: string, fallback: T): T {
  return safeStorageOperation(
    () => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    },
    fallback,
    `getItem(${key})`
  );
}

function removeItem(key: string): void {
  safeStorageOperation(
    () => localStorage.removeItem(key),
    undefined,
    `removeItem(${key})`
  );
}

// =====================================
// History Management
// =====================================

export interface HistoryStorage {
  items: HistoryItem[];
  lastUpdated: string;
  version: number;
}

export function saveHistoryItem(item: HistoryItem): void {
  const history = getHistoryItems();
  
  // Remove item if it already exists (by ID)
  const filteredHistory = history.filter(h => h.id !== item.id);
  
  // Add new item to the beginning
  const newHistory = [item, ...filteredHistory];
  
  // Keep only the last MAX_HISTORY_ITEMS
  const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
  
  const historyStorage: HistoryStorage = {
    items: trimmedHistory,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };
  
  setItem(STORAGE_KEYS.HISTORY, historyStorage);
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent("historyUpdated", { detail: item }));
}

export function getHistoryItems(): HistoryItem[] {
  const historyStorage = getItem<HistoryStorage>(STORAGE_KEYS.HISTORY, {
    items: [],
    lastUpdated: new Date().toISOString(),
    version: 1,
  });
  
  // Migration logic for future versions
  if (historyStorage.version < 1) {
    return migrateHistoryV1(historyStorage);
  }
  
  return historyStorage.items;
}

export function removeHistoryItem(id: string): void {
  const history = getHistoryItems();
  const filteredHistory = history.filter(item => item.id !== id);
  
  const historyStorage: HistoryStorage = {
    items: filteredHistory,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };
  
  setItem(STORAGE_KEYS.HISTORY, historyStorage);
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent("historyUpdated", { detail: null }));
}

export function clearHistory(): void {
  removeItem(STORAGE_KEYS.HISTORY);
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent("historyCleared"));
}

export function toggleHistoryItemFavorite(id: string): void {
  const history = getHistoryItems();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
  );
  
  const historyStorage: HistoryStorage = {
    items: updatedHistory,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };
  
  setItem(STORAGE_KEYS.HISTORY, historyStorage);
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent("historyUpdated", { detail: null }));
}

function migrateHistoryV1(oldStorage: any): HistoryItem[] {
  // Migration logic for older versions
  console.log("Migrating history storage to v1");
  return [];
}

// =====================================
// User Settings Management
// =====================================

export interface UserSettings {
  theme: "dark" | "light";
  autoRetry: boolean;
  saveToHistory: boolean;
  compressionQuality: number;
  maxFileSize: number;
  defaultStyle: string;
  showTutorial: boolean;
  enableNotifications: boolean;
  version: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  autoRetry: true,
  saveToHistory: true,
  compressionQuality: 0.8,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  defaultStyle: "editorial",
  showTutorial: true,
  enableNotifications: true,
  version: 1,
};

export function saveSettings(settings: Partial<UserSettings>): void {
  const currentSettings = getSettings();
  const updatedSettings = { 
    ...currentSettings, 
    ...settings,
    version: DEFAULT_SETTINGS.version 
  };
  
  setItem(STORAGE_KEYS.SETTINGS, updatedSettings);
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent("settingsUpdated", { detail: updatedSettings }));
}

export function getSettings(): UserSettings {
  return getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function resetSettings(): void {
  setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent("settingsReset"));
}

// =====================================
// Session Data Management
// =====================================

export interface SessionData {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  generationCount: number;
  totalUploadSize: number;
  version: number;
}

export function initializeSession(): SessionData {
  const sessionData: SessionData = {
    sessionId: crypto.randomUUID?.() || Math.random().toString(36),
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    generationCount: 0,
    totalUploadSize: 0,
    version: 1,
  };
  
  setItem(STORAGE_KEYS.SESSION, sessionData);
  return sessionData;
}

export function updateSessionActivity(): void {
  const sessionData = getSessionData();
  sessionData.lastActivity = new Date().toISOString();
  setItem(STORAGE_KEYS.SESSION, sessionData);
}

export function incrementGenerationCount(): void {
  const sessionData = getSessionData();
  sessionData.generationCount += 1;
  sessionData.lastActivity = new Date().toISOString();
  setItem(STORAGE_KEYS.SESSION, sessionData);
}

export function addToUploadSize(bytes: number): void {
  const sessionData = getSessionData();
  sessionData.totalUploadSize += bytes;
  sessionData.lastActivity = new Date().toISOString();
  setItem(STORAGE_KEYS.SESSION, sessionData);
}

export function getSessionData(): SessionData {
  const session = getItem<SessionData | null>(STORAGE_KEYS.SESSION, null);
  
  if (!session) {
    return initializeSession();
  }
  
  return session;
}

export function clearSession(): void {
  removeItem(STORAGE_KEYS.SESSION);
}

// =====================================
// User Preferences Management
// =====================================

export interface UserPreferences {
  recentPrompts: string[];
  favoriteStyles: string[];
  uploadPreferences: {
    autoResize: boolean;
    preferredFormat: "webp" | "jpeg";
    quality: number;
  };
  uiPreferences: {
    sidebarCollapsed: boolean;
    gridView: boolean;
    showPreviewInfo: boolean;
  };
  version: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  recentPrompts: [],
  favoriteStyles: ["editorial"],
  uploadPreferences: {
    autoResize: true,
    preferredFormat: "webp",
    quality: 0.8,
  },
  uiPreferences: {
    sidebarCollapsed: false,
    gridView: true,
    showPreviewInfo: true,
  },
  version: 1,
};

export function savePreferences(preferences: Partial<UserPreferences>): void {
  const currentPreferences = getPreferences();
  const updatedPreferences = { 
    ...currentPreferences, 
    ...preferences,
    version: DEFAULT_PREFERENCES.version 
  };
  
  setItem(STORAGE_KEYS.PREFERENCES, updatedPreferences);
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent("preferencesUpdated", { detail: updatedPreferences }));
}

export function getPreferences(): UserPreferences {
  return getItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function addRecentPrompt(prompt: string): void {
  const preferences = getPreferences();
  const trimmedPrompt = prompt.trim();
  
  if (!trimmedPrompt || preferences.recentPrompts.includes(trimmedPrompt)) {
    return;
  }
  
  const updatedPrompts = [trimmedPrompt, ...preferences.recentPrompts].slice(0, 10);
  
  savePreferences({
    recentPrompts: updatedPrompts,
  });
}

export function toggleFavoriteStyle(style: string): void {
  const preferences = getPreferences();
  const favoriteStyles = preferences.favoriteStyles.includes(style)
    ? preferences.favoriteStyles.filter(s => s !== style)
    : [...preferences.favoriteStyles, style];
  
  savePreferences({
    favoriteStyles,
  });
}

// =====================================
// Storage Events & Cleanup
// =====================================

export function onStorageChange(callback: (event: StorageEvent) => void): () => void {
  window.addEventListener("storage", callback);
  
  return () => {
    window.removeEventListener("storage", callback);
  };
}

export function getStorageUsage(): { used: number; available: number } {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0 };
  }
  
  let used = 0;
  for (const key of Object.values(STORAGE_KEYS)) {
    const item = localStorage.getItem(key);
    if (item) {
      used += item.length;
    }
  }
  
  // Estimate total localStorage quota (usually 5-10MB)
  const estimated = 5 * 1024 * 1024; // 5MB estimate
  
  return {
    used,
    available: estimated - used,
  };
}

export function cleanupOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
  // Clean up history items older than maxAge
  const history = getHistoryItems();
  const cutoffDate = new Date(Date.now() - maxAge);
  
  const filteredHistory = history.filter(item => {
    const itemDate = new Date(item.createdAt);
    return itemDate > cutoffDate;
  });
  
  if (filteredHistory.length !== history.length) {
    const historyStorage: HistoryStorage = {
      items: filteredHistory,
      lastUpdated: new Date().toISOString(),
      version: 1,
    };
    
    setItem(STORAGE_KEYS.HISTORY, historyStorage);
    console.log(`🧹 Cleaned up ${history.length - filteredHistory.length} old history items`);
  }
}

// =====================================
// Export Storage Stats
// =====================================

export function getStorageStats() {
  const usage = getStorageUsage();
  const history = getHistoryItems();
  const settings = getSettings();
  const session = getSessionData();
  const preferences = getPreferences();
  
  return {
    usage,
    itemCounts: {
      history: history.length,
      recentPrompts: preferences.recentPrompts.length,
      favoriteStyles: preferences.favoriteStyles.length,
    },
    session: {
      generationCount: session.generationCount,
      totalUploadSize: session.totalUploadSize,
      sessionAge: Date.now() - new Date(session.startTime).getTime(),
    },
    settings: {
      theme: settings.theme,
      autoRetry: settings.autoRetry,
      compressionQuality: settings.compressionQuality,
    },
  };
}