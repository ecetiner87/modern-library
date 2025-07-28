import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  SwatchIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

const ThemeSwitcher = () => {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const themeOptions = [
    { key: 'light', name: 'Light', icon: SunIcon, description: 'Clean and bright' },
    { key: 'dark', name: 'Dark', icon: MoonIcon, description: 'Easy on the eyes' },
    { key: 'gray', name: 'Gray', icon: SwatchIcon, description: 'Neutral and calm' }
  ];

  const getCurrentThemeInfo = () => {
    return themeOptions.find(option => option.key === currentTheme);
  };

  const currentThemeInfo = getCurrentThemeInfo();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${themes[currentTheme].border} ${themes[currentTheme].surfaceHover} ${themes[currentTheme].text}`}
      >
        <currentThemeInfo.icon className="h-5 w-5" />
        <span className="hidden sm:block font-medium">{currentThemeInfo.name}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border z-50 ${themes[currentTheme].surface} ${themes[currentTheme].border} ${themes[currentTheme].shadow}`}>
          <div className="py-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = currentTheme === option.key;
              
              return (
                <button
                  key={option.key}
                  onClick={() => {
                    changeTheme(option.key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 ${
                    isActive 
                      ? `${themes[currentTheme].primaryBg} ${themes[currentTheme].primary}` 
                      : `${themes[currentTheme].text} ${themes[currentTheme].surfaceHover}`
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{option.name}</div>
                    <div className={`text-sm ${themes[currentTheme].textMuted}`}>
                      {option.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className={`w-2 h-2 rounded-full ${themes[currentTheme].primary.replace('text-', 'bg-')}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher; 