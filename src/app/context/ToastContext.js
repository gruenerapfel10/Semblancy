// context/ToastContext.jsx
"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

// Toast types
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

// Default toast settings
const DEFAULT_DURATION = 5000; // 5 seconds

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Add a new toast
  const showToast = useCallback(
    ({
      type = TOAST_TYPES.INFO,
      message,
      title,
      duration = DEFAULT_DURATION,
    }) => {
      const id = uuidv4();
      const newToast = {
        id,
        type,
        message,
        title,
        duration,
        timestamp: Date.now(),
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);

      // Auto remove toast after duration (if not -1 which means persist)
      if (duration !== -1) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id; // Return id in case the caller wants to dismiss manually
    },
    [removeToast]
  );

  // Shorthand methods for different toast types
  const success = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, type: TOAST_TYPES.SUCCESS });
    },
    [showToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, type: TOAST_TYPES.ERROR });
    },
    [showToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, type: TOAST_TYPES.INFO });
    },
    [showToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return showToast({ ...options, message, type: TOAST_TYPES.WARNING });
    },
    [showToast]
  );

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Context value
  const value = {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

// Custom hook for using the toast context
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
