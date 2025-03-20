// components/SearchModal.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useSearch } from "@/app/context/SearchContext";
import styles from "./SearchModal.module.css";

export default function SearchModal() {
  const {
    isOpen,
    query,
    selectedIndex,
    filteredRoutes,
    closeSearch,
    setQuery,
    navigateTo,
  } = useSearch();

  const [isBlurAnimating, setIsBlurAnimating] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
  }, [isOpen]);

  // Set blur animation state on open/close
  useEffect(() => {
    if (isOpen) {
      setIsBlurAnimating(true);
    }
  }, [isOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeSearch]);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.searchOverlay} ${
        isBlurAnimating ? styles.blurActive : ""
      }`}
    >
      <div
        ref={searchRef}
        className={`${styles.searchModal} ${styles.modalEnter}`}
      >
        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            autoComplete="off"
          />
          <button
            className={styles.closeButton}
            onClick={closeSearch}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.searchResults}>
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map((route, index) => (
              <div
                key={route.path}
                className={`${styles.searchResultItem} ${
                  selectedIndex === index ? styles.selected : ""
                }`}
                onClick={() => navigateTo(route.path)}
              >
                <div className={styles.resultIcon}>
                  <div className={styles.iconPlaceholder}></div>
                </div>
                <div className={styles.resultContent}>
                  <h3>{route.name}</h3>
                  <p>{route.description}</p>
                </div>
                <div className={styles.resultAction}>
                  <span>Go</span>
                  <span className={styles.arrowRight}>→</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>

        <div className={styles.searchFooter}>
          <div className={styles.searchTips}>
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            </span>
            <span>
              <kbd>Enter</kbd> to select
            </span>
            <span>
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
