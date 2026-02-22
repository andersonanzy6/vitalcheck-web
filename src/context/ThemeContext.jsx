import React, { createContext, useState, useCallback } from 'react'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  const colors = isDarkMode
    ? {
        background: '#1a1a1a',
        surface: '#2a2a2a',
        text: '#ffffff',
        textLight: '#b0b0b0',
        primary: '#0084ff',
        secondary: '#6c5ce7',
        border: '#444',
      }
    : {
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#333333',
        textLight: '#666666',
        primary: '#0084ff',
        secondary: '#6c5ce7',
        border: '#ddd',
      }

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
