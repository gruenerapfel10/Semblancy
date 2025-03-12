// components/LoadingSpinner.js
"use client";
import React from "react";
import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner({
  size = "large",
  text = "Loading...",
  fullPage = false,
  showText = true,
}) {
  // Size variants (in pixels)
  const sizeMap = {
    small: "24px",
    medium: "40px",
    large: "64px",
  };

  const spinnerStyle = {
    width: sizeMap[size] || sizeMap.medium,
    height: sizeMap[size] || sizeMap.medium,
  };

  const spinnerContent = (
    <>
      <div className={styles.spinner} style={spinnerStyle}>
        <div className={styles.inner}></div>
      </div>
      {showText && <p className={styles.text}>{text}</p>}
    </>
  );

  if (fullPage) {
    return <div className={styles.fullPageContainer}>{spinnerContent}</div>;
  }

  return <div className={styles.container}>{spinnerContent}</div>;
}
