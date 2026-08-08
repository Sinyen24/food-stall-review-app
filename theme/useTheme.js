import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

/**
 * Custom hook to use theme colors and mode
 * Must be called within a component wrapped by ThemeProvider
 *
 * Returns: { colors, themeMode, setTheme, isDark, isLoading, systemScheme }
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
