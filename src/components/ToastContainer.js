// components/ToastContainer.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useToast, TOAST_TYPES } from "@/app/context/ToastContext";
import styles from "./ToastContainer.module.css";

// Toast icon mapping
const ToastIcon = ({ type }) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return <CheckCircle className={styles.icon} />;
    case TOAST_TYPES.ERROR:
      return <AlertCircle className={styles.icon} />;
    case TOAST_TYPES.WARNING:
      return <AlertTriangle className={styles.icon} />;
    case TOAST_TYPES.INFO:
    default:
      return <Info className={styles.icon} />;
  }
};

// Individual Toast component
const Toast = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const { id, type, title, message, duration } = toast;
  const progressIntervalRef = useRef(null);
  const dismissTimeoutRef = useRef(null);

  useEffect(() => {
    if (duration === -1) return; // No auto dismiss

    // Start progress bar
    const startTime = Date.now();
    const endTime = startTime + duration;

    progressIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        clearInterval(progressIntervalRef.current);
        handleDismiss();
      } else {
        setProgress(newProgress);
      }
    }, 10);

    // Schedule dismiss with a little extra time for exit animation
    dismissTimeoutRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearInterval(progressIntervalRef.current);
      clearTimeout(dismissTimeoutRef.current);
    };
  }, [duration, id]);

  const handleDismiss = () => {
    setExiting(true);

    // Give time for exit animation before removing
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Animation duration
  };

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${
        exiting ? styles.exit : styles.enter
      }`}
      role="alert"
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <ToastIcon type={type} />
        </div>
        <div className={styles.messageContainer}>
          {title && <h4 className={styles.title}>{title}</h4>}
          <p className={styles.message}>{message}</p>
        </div>
        <button
          className={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>

      {duration !== -1 && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Main Toast Container component
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
