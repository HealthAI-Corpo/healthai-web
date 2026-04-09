"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorTheme = "light" | "dark";
export type AccessibilityMode = "standard" | "low-vision";

interface AppThemeContextValue {
  colorTheme: ColorTheme;
  accessibilityMode: AccessibilityMode;
  toggleColorTheme: () => void;
  toggleAccessibilityMode: () => void;
  isLowVision: boolean;
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>("light");
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>("standard");

  // Restaurer depuis localStorage au montage
  useEffect(() => {
    const savedColor = localStorage.getItem("healthai-color-theme") as ColorTheme | null;
    const savedA11y = localStorage.getItem("healthai-a11y-mode") as AccessibilityMode | null;
    if (savedColor) setColorTheme(savedColor);
    if (savedA11y) setAccessibilityMode(savedA11y);
  }, []);

  // Appliquer les classes sur <html>
  useEffect(() => {
    const root = document.documentElement;

    // Thème clair/sombre
    root.classList.toggle("dark", colorTheme === "dark");

    // Mode malvoyant — RGAA niveau AAA
    // Ajoute la classe "low-vision" qui surcharge les variables CSS
    root.classList.toggle("low-vision", accessibilityMode === "low-vision");

    // Persistance
    localStorage.setItem("healthai-color-theme", colorTheme);
    localStorage.setItem("healthai-a11y-mode", accessibilityMode);
  }, [colorTheme, accessibilityMode]);

  const toggleColorTheme = useCallback(() => {
    setColorTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const toggleAccessibilityMode = useCallback(() => {
    setAccessibilityMode((prev) => (prev === "standard" ? "low-vision" : "standard"));
  }, []);

  return (
    <AppThemeContext.Provider value={{
      colorTheme,
      accessibilityMode,
      toggleColorTheme,
      toggleAccessibilityMode,
      isLowVision: accessibilityMode === "low-vision",
    }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error("useAppTheme doit être utilisé dans <AppThemeProvider>");
  return ctx;
}
