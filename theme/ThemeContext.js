import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_MODES, THEME_STORAGE_KEY } from './constants';
import { lightColors, darkColors } from './colors';

// ─── ThemeContext ─────────────────────────────────────────────────────────────
export const ThemeContext = createContext();

// ─── ThemeProvider ────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeMode] = useState(THEME_MODES.AUTO);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && Object.values(THEME_MODES).includes(saved)) {
          setThemeMode(saved);
        }
      } catch (err) {
        console.error('Error loading theme preference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Determine which color scheme to use
  const activeScheme =
    themeMode === THEME_MODES.AUTO ? systemScheme : themeMode;

  // Select color palette
  const colors = activeScheme === 'dark' ? darkColors : lightColors;

  // Save theme preference to AsyncStorage
  const setTheme = async (mode) => {
    try {
      if (!Object.values(THEME_MODES).includes(mode)) {
        throw new Error(`Invalid theme mode: ${mode}`);
      }
      setThemeMode(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.error('Error setting theme:', err);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        colors,
        themeMode,
        setTheme,
        isLoading,
        systemScheme,
        isDark: activeScheme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
