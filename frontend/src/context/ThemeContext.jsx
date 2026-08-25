import React, { createContext, useContext, useState, useEffect } from 'react';

// create context for the theme
const ThemeContext = createContext();

// theme provider component
export function ThemeProvider({ children }) {
  // read theme from local storage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // update DOM class when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// custom hook to use theme context
export function useTheme() {
  return useContext(ThemeContext);
}
