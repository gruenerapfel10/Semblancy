"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useAmplify } from "./Providers";

// Create the context
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("light");
  const {
    isAuthenticated,
    isLoading,
    getUserPreferences,
    updateUserPreferences,
  } = useAmplify();

  // Function to set theme that handles all side effects
  const setTheme = (newTheme) => {
    // Update state
    setThemeState(newTheme);

    // Update DOM
    document.documentElement.setAttribute("data-theme", newTheme);

    // Save to localStorage
    localStorage.setItem("theme", newTheme);

    // Dispatch event for legacy components
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { theme: newTheme } })
    );

    // Save to user preferences if authenticated
    if (isAuthenticated && !isLoading) {
      updateUserPreferences?.({ theme: newTheme }).catch((error) => {
        console.error("Error saving theme to user preferences:", error);
      });
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Initialize theme on mount and auth state changes
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Try to get user preferences if authenticated
        if (isAuthenticated && !isLoading) {
          const preferences = await getUserPreferences();
          if (preferences?.theme) {
            setTheme(preferences.theme);
            return;
          }
        }

        // Fallback to localStorage
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme);
          return;
        }

        // Fallback to system preference
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          setTheme("dark");
          return;
        }

        // Default to light theme
        setTheme("light");
      } catch (error) {
        console.error("Error initializing theme:", error);
        // Fallback to light theme
        setTheme("light");
      }
    };

    initializeTheme();
  }, [isAuthenticated, isLoading]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only apply if no user preference exists
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    // Add listener with proper compatibility
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Listen for external theme changes (for compatibility)
  useEffect(() => {
    const handleExternalThemeChange = (e) => {
      if (e.detail?.theme && e.detail.theme !== theme) {
        setThemeState(e.detail.theme); // Just update state, not all side effects
      }
    };

    window.addEventListener("themeChange", handleExternalThemeChange);

    return () => {
      window.removeEventListener("themeChange", handleExternalThemeChange);
    };
  }, [theme]);

  // Provide context value
  const contextValue = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
