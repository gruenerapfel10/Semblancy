"use client";

import { Search } from "lucide-react";
import { useSearch } from "@/app/context/SearchContext";
import styles from "./SearchTrigger.module.css";
import { useEffect, useState } from "react";

// Helper to determine theme class
const getThemeClass = (theme) => {
  if (!theme) return "";
  return theme === "dark" ? styles.dark : styles.light;
};

// Full search bar trigger
export function SearchBar({ theme }) {
  const { openSearch } = useSearch();
  const [themeClass, setThemeClass] = useState("");
  
  useEffect(() => {
    setThemeClass(getThemeClass(theme));
  }, [theme]);

  return (
    <button
      className={`${styles.searchButton} ${themeClass}`}
      onClick={openSearch}
      aria-label="Open search"
    >
      <Search size={18} />
      <span>Search anything or press Cmd+K</span>
      <kbd className={styles.shortcutKey}>⌘K</kbd>
    </button>
  );
}

// Minimal trigger that shows only a keyboard shortcut indicator
export function SearchIndicator({ theme }) {
  const [themeClass, setThemeClass] = useState("");
  
  useEffect(() => {
    setThemeClass(getThemeClass(theme));
  }, [theme]);
  
  return (
    <div className={`${styles.cmdk} ${themeClass}`}>
      <kbd>⌘K</kbd>
    </div>
  );
}

// Icon-only search button for navigation bars, etc.
export function SearchIcon({ size = 20, theme }) {
  const { openSearch } = useSearch();
  const [themeClass, setThemeClass] = useState("");
  
  useEffect(() => {
    setThemeClass(getThemeClass(theme));
  }, [theme]);

  return (
    <button
      className={`${styles.iconButton} ${themeClass}`}
      onClick={openSearch}
      aria-label="Open search"
    >
      <Search size={size} />
    </button>
  );
}