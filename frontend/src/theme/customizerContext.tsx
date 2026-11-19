'use client'
import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import config from './config';
import React from "react";

// Define the shape of the context state
interface CustomizerContextState {
  activeDir: string;
  setActiveDir: (dir: string) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: string;
  setActiveLayout: (layout: string) => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: string;
  setIsLayout: (layout: string) => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
  isLanguage: string;
  setIsLanguage: (lang: string) => void;
  isSidebarHover: boolean;
  setIsSidebarHover: (isHover: boolean) => void;
  isMobileSidebar: boolean;
  setIsMobileSidebar: (isMobileSidebar: boolean) => void;
}

// Create the context with an initial value
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}

export const THEME_MODE_STORAGE_KEY = 'corestarter-theme-mode';

const getValidThemeMode = (value: string | null | undefined): 'light' | 'dark' | null => {
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return null;
};

// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [activeDir, setActiveDirState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDir = localStorage.getItem('corestarter_dir');
        const savedLang = localStorage.getItem('corestarter_lang');
        if (savedDir) return savedDir;
        if (savedLang) return savedLang === 'ar' ? 'rtl' : 'ltr';
      } catch {
        // Ignore localStorage errors
      }
    }
    return config.activeDir;
  });
  const [activeMode, setActiveModeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
        const validMode = getValidThemeMode(savedMode);
        if (validMode) {
          return validMode;
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return config.activeMode;
  });
  const [activeTheme, setActiveTheme] = useState<string>(config.activeTheme);
  const [activeLayout, setActiveLayout] = useState<string>(config.activeLayout);
  const [isCardShadow, setIsCardShadow] = useState<boolean>(config.isCardShadow);
  const [isLayout, setIsLayout] = useState<string>(config.isLayout);
  const [isBorderRadius, setIsBorderRadius] = useState<number>(config.isBorderRadius);
  const [isCollapse, setIsCollapse] = useState<string>(config.isCollapse);
  const [isLanguage, setIsLanguageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem('corestarter_lang');
        if (savedLang) return savedLang;
      } catch {
        // Ignore localStorage errors
      }
    }
    return config.isLanguage;
  });
  const [isSidebarHover, setIsSidebarHover] = useState<boolean>(false);
  const [isMobileSidebar, setIsMobileSidebar] = useState<boolean>(false);

  // Load persisted theme and language/dir preferences on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      const validMode = getValidThemeMode(savedMode);
      if (validMode) {
        setActiveModeState(validMode);
      }

      const savedLang = localStorage.getItem('corestarter_lang');
      const savedDir = localStorage.getItem('corestarter_dir');
      if (savedLang) {
        setIsLanguageState(savedLang);
        setActiveDirState(savedDir || (savedLang === 'ar' ? 'rtl' : 'ltr'));
      }
    } catch {
      // Ignore localStorage errors in SSR/restricted environments
    }
  }, []);

  // Multi-tab synchronization for theme changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_MODE_STORAGE_KEY) {
        const validMode = getValidThemeMode(e.newValue);
        if (validMode) {
          setActiveModeState(validMode);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setActiveMode = useCallback((mode: string) => {
    const validMode = getValidThemeMode(mode);
    if (!validMode) {
      return;
    }
    setActiveModeState(validMode);
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, validMode);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setIsLanguage = useCallback((lang: string) => {
    setIsLanguageState(lang);
    const newDir = lang === 'ar' ? 'rtl' : 'ltr';
    setActiveDirState(newDir);
    try {
      localStorage.setItem('corestarter_lang', lang);
      localStorage.setItem('corestarter_dir', newDir);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setActiveDir = useCallback((dir: string) => {
    setActiveDirState(dir);
    try {
      localStorage.setItem('corestarter_dir', dir);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Set attributes on document element
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(activeMode);
    document.documentElement.setAttribute("data-theme-mode", activeMode);
    document.documentElement.setAttribute("dir", activeDir);
    document.documentElement.setAttribute("lang", isLanguage);
    document.documentElement.setAttribute('data-color-theme', activeTheme);
    document.documentElement.setAttribute("data-layout", activeLayout);
    document.documentElement.setAttribute("data-boxed-layout", isLayout);
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);
  }, [activeMode, activeDir, isLanguage, activeTheme, activeLayout, isLayout, isCollapse]);

  return (
    <CustomizerContext.Provider
      value={{
        activeDir,
        setActiveDir,
        activeMode,
        setActiveMode,
        activeTheme,
        setActiveTheme,
        activeLayout,
        setActiveLayout,
        isCardShadow,
        setIsCardShadow,
        isLayout,
        setIsLayout,
        isBorderRadius,
        setIsBorderRadius,
        isCollapse,
        setIsCollapse,
        isLanguage,
        setIsLanguage,
        isSidebarHover,
        setIsSidebarHover,
        isMobileSidebar,
        setIsMobileSidebar
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};
