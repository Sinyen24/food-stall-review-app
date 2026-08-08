/**
 * Color Palettes - Light & Dark Modes
 * Centralized color system for the app
 */

export const lightColors = {
  // Primary branding
  primary: '#FF6B35',
  primaryDark: '#E65100',
  primaryLight: '#FF8A5B',

  // Backgrounds
  background: '#F9F6F2',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFAFA',
  overlay: 'rgba(0,0,0,0.3)',
  overlayLight: 'rgba(0,0,0,0.08)',

  // Text colors
  text: {
    primary: '#1A1A1A',
    secondary: '#555555',
    tertiary: '#888888',
    quaternary: '#AAAAAA',
    disabled: '#CCCCCC',
  },

  // Status colors
  status: {
    success: '#43A047',
    successLight: '#E8F5E9',
    error: '#EF5350',
    errorDark: '#D32F2F',
    errorLight: '#FFEBEE',
    warning: '#FFA726',
    info: '#42A5F5',
  },

  // Rating colors (AddReviewScreen)
  rating: {
    terrible: '#EF5350',
    poor: '#FF7043',
    okay: '#FFA726',
    good: '#66BB6A',
    excellent: '#43A047',
  },

  // UI elements
  border: '#EEEEEE',
  divider: '#F0F0F0',
  badge: '#FFF3EE',
  badgeAdmin: '#FFF3E0',
  chipActive: '#FF6B35',
  chipInactive: '#FFFFFF',

  // Icon colors
  icon: {
    primary: '#FF6B35',
    secondary: '#AAAAAA',
    success: '#43A047',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
    admin: '#E65100',
  },

  // Specific component colors
  drawer: {
    background: '#FFFFFF',
    headerBackground: '#FF6B35',
    headerText: '#FFFFFF',
    activeBackground: '#FFF3EE',
    activeBorder: '#FF6B35',
  },

  tabBar: {
    background: '#FFFFFF',
    activeColor: '#FF6B35',
    inactiveColor: '#BBBBBB',
  },

  input: {
    background: '#FAFAFA',
    border: '#EEEEEE',
    borderError: '#EF5350',
    backgroundError: '#FFF8F8',
    icon: '#AAAAAA',
    text: '#1A1A1A',
    placeholder: '#CCCCCC',
  },

  button: {
    primary: '#FF6B35',
    primaryDisabled: 'rgba(255, 107, 53, 0.65)',
    secondary: '#FFFFFF',
  },
};

export const darkColors = {
  // Primary branding (brighter for contrast)
  primary: '#FF8A5B',
  primaryDark: '#FF6B35',
  primaryLight: '#FFB74D',

  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#2A2A2A',
  overlay: 'rgba(255,255,255,0.15)',
  overlayLight: 'rgba(255,255,255,0.05)',

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#BBBBBB',
    tertiary: '#888888',
    quaternary: '#666666',
    disabled: '#555555',
  },

  // Status colors
  status: {
    success: '#66BB6A',
    successLight: '#1B5E20',
    error: '#EF9A9A',
    errorDark: '#C62828',
    errorLight: '#3E0B0B',
    warning: '#FFB74D',
    info: '#64B5F6',
  },

  // Rating colors (AddReviewScreen)
  rating: {
    terrible: '#EF9A9A',
    poor: '#FFB74D',
    okay: '#FFD54F',
    good: '#81C784',
    excellent: '#66BB6A',
  },

  // UI elements
  border: '#333333',
  divider: '#2A2A2A',
  badge: '#2A1810',
  badgeAdmin: '#332200',
  chipActive: '#FF8A5B',
  chipInactive: '#2A2A2A',

  // Icon colors
  icon: {
    primary: '#FF8A5B',
    secondary: '#888888',
    success: '#66BB6A',
    error: '#EF9A9A',
    warning: '#FFB74D',
    info: '#64B5F6',
    admin: '#FF8A5B',
  },

  // Specific component colors
  drawer: {
    background: '#1E1E1E',
    headerBackground: '#FF8A5B',
    headerText: '#1A1A1A',
    activeBackground: '#2D1810',
    activeBorder: '#FF8A5B',
  },

  tabBar: {
    background: '#1E1E1E',
    activeColor: '#FF8A5B',
    inactiveColor: '#666666',
  },

  input: {
    background: '#2A2A2A',
    border: '#444444',
    borderError: '#EF9A9A',
    backgroundError: '#3E0B0B',
    icon: '#888888',
    text: '#FFFFFF',
    placeholder: '#666666',
  },

  button: {
    primary: '#FF8A5B',
    primaryDisabled: 'rgba(255, 138, 91, 0.5)',
    secondary: '#2A2A2A',
  },
};
