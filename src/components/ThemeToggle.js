import React, { useState, useEffect } from "react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle({ type = "button" }) {
  const [theme, setTheme] = useState("light");
  
  // Initialize theme from current document state when component mounts
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);
  }, []);
  
  const toggleTheme = () => {
    // Read the current theme directly from the document to ensure accuracy
    const currentDocTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentDocTheme === "light" ? "dark" : "light";
    
    // Update both the state and the document
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className={styles.themeToggleContainer}>
      {type === "button" ? (
        <button className={styles.iconButton} onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
          {/* Show the icon for the *opposite* theme (what we'll switch to) */}
          {theme === "light" ? (
            /* If currently light, show moon icon to indicate switching to dark */
            <svg className={styles.moonIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
          ) : (
            /* If currently dark, show sun icon to indicate switching to light */
            <svg className={styles.sunIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
            </svg>
          )}
        </button>
      ) : (
        <div className={styles.sliderContainer}>
          <span className={styles.sunLabel}>
            <svg className={styles.sunIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
            </svg>
          </span>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              // Read directly from the document to ensure checkbox state is accurate
              checked={(document.documentElement.getAttribute("data-theme") || "light") === "dark"}
              onChange={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.moonLabel}>
            <svg className={styles.moonIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}