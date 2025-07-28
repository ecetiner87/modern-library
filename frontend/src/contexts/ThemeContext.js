import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme definitions
const themes = {
  light: {
    name: 'light',
    background: 'bg-gray-50',
    surface: 'bg-white',
    surfaceHover: 'hover:bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    borderHover: 'hover:border-gray-300',
    shadow: 'shadow-lg',
    shadowHover: 'hover:shadow-xl',
    card: 'bg-white',
    cardHover: 'hover:bg-gray-50',
    sidebar: 'bg-white',
    sidebarHover: 'hover:bg-gray-100',
    primary: 'text-purple-600',
    primaryBg: 'bg-purple-50',
    primaryBorder: 'border-purple-200',
    success: 'text-green-600',
    successBg: 'bg-green-50',
    warning: 'text-yellow-600',
    warningBg: 'bg-yellow-50',
    error: 'text-red-600',
    errorBg: 'bg-red-50',
    input: 'bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    buttonSecondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    modal: 'bg-white',
    modalOverlay: 'bg-black bg-opacity-50',
    chart: {
      background: '#ffffff',
      text: '#374151',
      grid: '#E5E7EB',
      tooltip: '#ffffff',
      tooltipBorder: '#E5E7EB'
    }
  },
  dark: {
    name: 'dark',
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    surfaceHover: 'hover:bg-gray-700',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    border: 'border-gray-700',
    borderHover: 'hover:border-gray-600',
    shadow: 'shadow-lg shadow-black/20',
    shadowHover: 'hover:shadow-xl hover:shadow-black/30',
    card: 'bg-gray-800',
    cardHover: 'hover:bg-gray-700',
    sidebar: 'bg-gray-800',
    sidebarHover: 'hover:bg-gray-700',
    primary: 'text-purple-400',
    primaryBg: 'bg-purple-900/20',
    primaryBorder: 'border-purple-700',
    success: 'text-green-400',
    successBg: 'bg-green-900/20',
    warning: 'text-yellow-400',
    warningBg: 'bg-yellow-900/20',
    error: 'text-red-400',
    errorBg: 'bg-red-900/20',
    input: 'bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500 text-gray-100',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    buttonSecondary: 'bg-gray-600 hover:bg-gray-500 text-gray-100',
    modal: 'bg-gray-800',
    modalOverlay: 'bg-black bg-opacity-75',
    chart: {
      background: '#1F2937',
      text: '#F9FAFB',
      grid: '#374151',
      tooltip: '#374151',
      tooltipBorder: '#4B5563'
    }
  },
  gray: {
    name: 'gray',
    background: 'bg-gray-100',
    surface: 'bg-gray-200',
    surfaceHover: 'hover:bg-gray-300',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    border: 'border-gray-300',
    borderHover: 'hover:border-gray-400',
    shadow: 'shadow-md',
    shadowHover: 'hover:shadow-lg',
    card: 'bg-gray-200',
    cardHover: 'hover:bg-gray-300',
    sidebar: 'bg-gray-200',
    sidebarHover: 'hover:bg-gray-300',
    primary: 'text-gray-700',
    primaryBg: 'bg-gray-300',
    primaryBorder: 'border-gray-400',
    success: 'text-green-700',
    successBg: 'bg-green-100',
    warning: 'text-yellow-700',
    warningBg: 'bg-yellow-100',
    error: 'text-red-700',
    errorBg: 'bg-red-100',
    input: 'bg-gray-100 border-gray-400 focus:border-gray-600 focus:ring-gray-500',
    button: 'bg-gray-600 hover:bg-gray-700 text-white',
    buttonSecondary: 'bg-gray-400 hover:bg-gray-500 text-gray-800',
    modal: 'bg-gray-200',
    modalOverlay: 'bg-black bg-opacity-40',
    chart: {
      background: '#F3F4F6',
      text: '#374151',
      grid: '#D1D5DB',
      tooltip: '#F3F4F6',
      tooltipBorder: '#D1D5DB'
    }
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark', 'gray');
    document.documentElement.classList.add(savedTheme);
  }, []);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('theme', themeName);
      
      // Apply theme to document
      document.documentElement.classList.remove('light', 'dark', 'gray');
      document.documentElement.classList.add(themeName);
    }
  };

  const value = {
    theme: themes[currentTheme],
    currentTheme,
    changeTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 