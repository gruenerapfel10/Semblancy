"use client";

import { Cpu } from "lucide-react";
import { useAIAssistant } from "@/app/context/AIAssistantContext";
import styles from "./AIAssistantTrigger.module.css";
import { useEffect, useState } from "react";

// Helper to determine theme class
const getThemeClass = (theme) => {
  if (!theme) return "";
  return theme === "dark" ? styles.dark : styles.light;
};

// Full AI Assistant bar trigger
export function AIAssistantBar({ theme }) {
  const { openAssistant } = useAIAssistant();
  const [themeClass, setThemeClass] = useState("");
  
  useEffect(() => {
    setThemeClass(getThemeClass(theme));
  }, [theme]);

  return (
    <button
      className={`${styles.assistantButton} ${themeClass}`}
      onClick={openAssistant}
      aria-label="Open AI Assistant"
    >
      <Cpu size={18} />
      <span>Ask me anything or press ⌘J</span>
      <kbd className={styles.shortcutKey}>⌘J</kbd>
    </button>
  );
}

// Minimal trigger that shows only a keyboard shortcut indicator
export function AIAssistantIndicator({ theme }) {
  const [themeClass, setThemeClass] = useState("");
  
  useEffect(() => {
    setThemeClass(getThemeClass(theme));
  }, [theme]);
  
  return (
    <div className={`${styles.cmdk} ${themeClass}`}>
      <kbd>⌘J</kbd>
    </div>
  );
}

// Icon-only AI button for navigation bars, etc.
export function AIAssistantIcon({ size = 20, theme }) {
  const { openAssistant } = useAIAssistant();
  const [themeClass, setThemeClass] = useState("");
  
  useEffect(() => {
    setThemeClass(getThemeClass(theme));
  }, [theme]);

  return (
    <button
      className={`${styles.iconButton} ${themeClass}`}
      onClick={openAssistant}
      aria-label="Open AI Assistant"
    >
      <Cpu size={size} />
    </button>
  );
} 