"use client";

import { useState, useEffect } from "react";
import styles from "./FilePermissionPrompt.module.css";

/**
 * Component to handle requesting file permissions for stored file handles
 */
export default function FilePermissionPrompt({
  fileHandles,
  onComplete,
  onCancel,
}) {
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!fileHandles || fileHandles.length === 0) {
      onComplete([]);
      return;
    }

    // Start processing the first file handle
    processNextHandle();
  }, []);

  const processNextHandle = async () => {
    if (current >= fileHandles.length) {
      onComplete(results);
      return;
    }

    setProcessing(true);
    const fileHandle = fileHandles[current];

    try {
      // Check current permission
      let permissionState = await fileHandle.handle.queryPermission({
        mode: "read",
      });

      // If not already granted, request permission
      if (permissionState !== "granted") {
        permissionState = await fileHandle.handle.requestPermission({
          mode: "read",
        });
      }

      // Store result
      const result = {
        fileName: fileHandle.fileName,
        permissionGranted: permissionState === "granted",
        handle: permissionState === "granted" ? fileHandle.handle : null,
      };

      setResults((prev) => [...prev, result]);
      setCurrent((prev) => prev + 1);
      setProcessing(false);

      // Process next handle
      setTimeout(processNextHandle, 100);
    } catch (error) {
      console.error(
        `Error processing file handle for ${fileHandle.fileName}:`,
        error
      );

      // Store failure result
      const result = {
        fileName: fileHandle.fileName,
        permissionGranted: false,
        error: error.message,
      };

      setResults((prev) => [...prev, result]);
      setCurrent((prev) => prev + 1);
      setProcessing(false);

      // Continue with next handle
      setTimeout(processNextHandle, 100);
    }
  };

  return (
    <div className={styles.permissionPrompt}>
      <div className={styles.promptContent}>
        <h3>File Access Required</h3>
        {current < fileHandles.length ? (
          <>
            <p>To resume file uploads, please grant access to:</p>
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#4361ee">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <span className={styles.fileName}>
                {fileHandles[current].fileName}
              </span>
            </div>
            <p className={styles.promptHelp}>
              When prompted, click "Accept" to allow access to this file
            </p>
            <div className={styles.progress}>
              <span>
                File {current + 1} of {fileHandles.length}
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(current / fileHandles.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <p>Processing completed. Please wait...</p>
        )}

        <div className={styles.promptActions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
