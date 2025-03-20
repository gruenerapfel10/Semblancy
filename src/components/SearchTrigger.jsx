// components/SearchTrigger.jsx
"use client";

import { Search } from "lucide-react";
import { useSearch } from "@/app/context/SearchContext";
import styles from "./SearchTrigger.module.css";

// Full search bar trigger
export function SearchBar() {
  const { openSearch } = useSearch();

  return (
    <button
      className={styles.searchButton}
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
export function SearchIndicator() {
  return (
    <div className={styles.cmdk}>
      <kbd>⌘K</kbd>
    </div>
  );
}

// Icon-only search button for navigation bars, etc.
export function SearchIcon({ size = 20 }) {
  const { openSearch } = useSearch();

  return (
    <button
      className={styles.iconButton}
      onClick={openSearch}
      aria-label="Open search"
    >
      <Search size={size} />
    </button>
  );
}
