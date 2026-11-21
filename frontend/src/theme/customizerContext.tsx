'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import config from './config';

export const NASAQ_UI_PREFERENCES_KEY = 'nasaq.ui.preferences.v1';

// Legacy keys for backward-compatibility & migration
export const THEME_MODE_STORAGE_KEY = 'corestarter-theme-mode';
const LEGACY_LANG_KEY = 'corestarter_lang';
const LEGACY_DIR_KEY = 'corestarter_dir';

export interface NasaqUiPreferences {
  version: 1;
  activeMode: 'light' | 'dark';
  activeDir: 'rtl' | 'ltr';
  isLanguage: 'ar' | 'en';
  activeTheme: string;
  activeLayout: 'vertical' | 'horizontal';
  isLayout: 'full' | 'boxed';
  isCollapse: 'full-sidebar' | 'mini-sidebar';
  isBorderRadius: number;
  isCardShadow: boolean;
}

const DEFAULT_PREFERENCES: NasaqUiPreferences = {
  version: 1,
  activeMode: (config.activeMode as 'light' | 'dark') || 'light',
  activeDir: (config.activeDir as 'rtl' | 'ltr') || 'ltr',
  isLanguage: (config.isLanguage as 'ar' | 'en') || 'en',
  activeTheme: config.activeTheme || 'BLUE_THEME',
  activeLayout: (config.activeLayout as 'vertical' | 'horizontal') || 'vertical',
  isLayout: (config.isLayout as 'full' | 'boxed') || 'full',
  isCollapse: (config.isCollapse as 'full-sidebar' | 'mini-sidebar') || 'full-sidebar',
  isBorderRadius: config.isBorderRadius ?? 7,
  isCardShadow: config.isCardShadow ?? true,
};

function sanitizePreferences(raw: any): NasaqUiPreferences {
  const mode = raw?.activeMode === 'dark' || raw?.activeMode === 'light' ? raw.activeMode : DEFAULT_PREFERENCES.activeMode;
  const lang = raw?.isLanguage === 'ar' || raw?.isLanguage === 'en' ? raw.isLanguage : DEFAULT_PREFERENCES.isLanguage;
  const dir = raw?.activeDir === 'rtl' || raw?.activeDir === 'ltr' ? raw.activeDir : lang === 'ar' ? 'rtl' : 'ltr';
  const layout = raw?.activeLayout === 'horizontal' ? 'horizontal' : 'vertical';
  const boxedLayout = raw?.isLayout === 'boxed' ? 'boxed' : 'full';
  const collapse = raw?.isCollapse === 'mini-sidebar' ? 'mini-sidebar' : 'full-sidebar';
  const radius = typeof raw?.isBorderRadius === 'number' && raw.isBorderRadius >= 0 && raw.isBorderRadius <= 24 ? raw.isBorderRadius : DEFAULT_PREFERENCES.isBorderRadius;
  const shadow = typeof raw?.isCardShadow === 'boolean' ? raw.isCardShadow : DEFAULT_PREFERENCES.isCardShadow;
  const theme = typeof raw?.activeTheme === 'string' && raw.activeTheme.length > 0 ? raw.activeTheme : DEFAULT_PREFERENCES.activeTheme;

  return {
    version: 1,
    activeMode: mode,
    activeDir: dir,
    isLanguage: lang,
    activeTheme: theme,
    activeLayout: layout,
    isLayout: boxedLayout,
    isCollapse: collapse,
    isBorderRadius: radius,
    isCardShadow: shadow,
  };
}

function loadStoredPreferences(): NasaqUiPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const serialized = localStorage.getItem(NASAQ_UI_PREFERENCES_KEY);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      return sanitizePreferences(parsed);
    }

    // Migrate from legacy keys if available
    const legacyMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    const legacyLang = localStorage.getItem(LEGACY_LANG_KEY);
    const legacyDir = localStorage.getItem(LEGACY_DIR_KEY);

    if (legacyMode || legacyLang || legacyDir) {
      const migrated = sanitizePreferences({
        activeMode: legacyMode,
        isLanguage: legacyLang,
        activeDir: legacyDir || (legacyLang === 'ar' ? 'rtl' : 'ltr'),
      });
      try {
        localStorage.setItem(NASAQ_UI_PREFERENCES_KEY, JSON.stringify(migrated));
      } catch {
        // Ignore quota/access errors
      }
      return migrated;
    }
  } catch {
    // Return safe defaults on parse error
  }

  return DEFAULT_PREFERENCES;
}

function persistPreferences(prefs: NasaqUiPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NASAQ_UI_PREFERENCES_KEY, JSON.stringify(prefs));
    // Keep legacy keys synchronized for backward compatibility
    localStorage.setItem(THEME_MODE_STORAGE_KEY, prefs.activeMode);
    localStorage.setItem(LEGACY_LANG_KEY, prefs.isLanguage);
    localStorage.setItem(LEGACY_DIR_KEY, prefs.activeDir);
  } catch {
    // Ignore quota or disabled storage errors
  }
}

// Define the shape of the context state
export interface CustomizerContextState {
  activeDir: 'rtl' | 'ltr';
  setActiveDir: (dir: 'rtl' | 'ltr') => void;
  activeMode: 'light' | 'dark';
  setActiveMode: (mode: 'light' | 'dark') => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: 'vertical' | 'horizontal';
  setActiveLayout: (layout: 'vertical' | 'horizontal') => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: 'full' | 'boxed';
  setIsLayout: (layout: 'full' | 'boxed') => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: 'full-sidebar' | 'mini-sidebar';
  setIsCollapse: (collapse: 'full-sidebar' | 'mini-sidebar') => void;
  isLanguage: 'ar' | 'en';
  setIsLanguage: (lang: 'ar' | 'en') => void;
  isSidebarHover: boolean;
  setIsSidebarHover: (isHover: boolean) => void;
  isMobileSidebar: boolean;
  setIsMobileSidebar: (isMobileSidebar: boolean) => void;
}

export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

interface CustomizerContextProps {
  children: ReactNode;
}

export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<NasaqUiPreferences>(DEFAULT_PREFERENCES);
  const [isSidebarHover, setIsSidebarHover] = useState<boolean>(false);
  const [isMobileSidebar, setIsMobileSidebar] = useState<boolean>(false);
  const isHydratedRef = useRef(false);

  // Load preferences from localStorage on initial client mount
  useEffect(() => {
    const stored = loadStoredPreferences();
    setPreferences(stored);
    isHydratedRef.current = true;
  }, []);

  // Multi-tab synchronization for NASAQ UI preferences
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NASAQ_UI_PREFERENCES_KEY && e.newValue) {
        try {
          const updated = sanitizePreferences(JSON.parse(e.newValue));
          setPreferences(updated);
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // State setters that automatically synchronize with centralized localStorage
  const updatePreference = useCallback(<K extends keyof NasaqUiPreferences>(key: K, value: NasaqUiPreferences[K]) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      persistPreferences(updated);
      return updated;
    });
  }, []);

  const setActiveMode = useCallback((mode: string) => {
    const validMode: 'light' | 'dark' = mode === 'dark' ? 'dark' : 'light';
    updatePreference('activeMode', validMode);
  }, [updatePreference]);

  const setActiveDir = useCallback((dir: string) => {
    const validDir: 'rtl' | 'ltr' = dir === 'rtl' ? 'rtl' : 'ltr';
    updatePreference('activeDir', validDir);
  }, [updatePreference]);

  const setIsLanguage = useCallback((lang: string) => {
    const validLang: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en';
    const autoDir: 'rtl' | 'ltr' = validLang === 'ar' ? 'rtl' : 'ltr';
    setPreferences((prev) => {
      const updated: NasaqUiPreferences = {
        ...prev,
        isLanguage: validLang,
        activeDir: autoDir,
      };
      persistPreferences(updated);
      return updated;
    });
  }, []);

  const setActiveTheme = useCallback((theme: string) => {
    updatePreference('activeTheme', theme);
  }, [updatePreference]);

  const setActiveLayout = useCallback((layout: string) => {
    updatePreference('activeLayout', layout === 'horizontal' ? 'horizontal' : 'vertical');
  }, [updatePreference]);

  const setIsLayout = useCallback((layout: string) => {
    updatePreference('isLayout', layout === 'boxed' ? 'boxed' : 'full');
  }, [updatePreference]);

  const setIsCollapse = useCallback((collapse: string) => {
    updatePreference('isCollapse', collapse === 'mini-sidebar' ? 'mini-sidebar' : 'full-sidebar');
  }, [updatePreference]);

  const setIsBorderRadius = useCallback((radius: number) => {
    updatePreference('isBorderRadius', radius);
  }, [updatePreference]);

  const setIsCardShadow = useCallback((shadow: boolean) => {
    updatePreference('isCardShadow', shadow);
  }, [updatePreference]);

  // Synchronize document element attributes & data properties
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(preferences.activeMode);
    document.documentElement.setAttribute('data-theme-mode', preferences.activeMode);
    document.documentElement.setAttribute('dir', preferences.activeDir);
    document.documentElement.setAttribute('lang', preferences.isLanguage);
    document.documentElement.setAttribute('data-color-theme', preferences.activeTheme);
    document.documentElement.setAttribute('data-layout', preferences.activeLayout);
    document.documentElement.setAttribute('data-boxed-layout', preferences.isLayout);
    document.documentElement.setAttribute('data-sidebar-type', preferences.isCollapse);
    document.body.setAttribute('data-color-theme', preferences.activeTheme);
  }, [preferences]);

  return (
    <CustomizerContext.Provider
      value={{
        activeDir: preferences.activeDir,
        setActiveDir,
        activeMode: preferences.activeMode,
        setActiveMode,
        activeTheme: preferences.activeTheme,
        setActiveTheme,
        activeLayout: preferences.activeLayout,
        setActiveLayout,
        isCardShadow: preferences.isCardShadow,
        setIsCardShadow,
        isLayout: preferences.isLayout,
        setIsLayout,
        isBorderRadius: preferences.isBorderRadius,
        setIsBorderRadius,
        isCollapse: preferences.isCollapse,
        setIsCollapse,
        isLanguage: preferences.isLanguage,
        setIsLanguage,
        isSidebarHover,
        setIsSidebarHover,
        isMobileSidebar,
        setIsMobileSidebar,
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};
