// ResumeUploadModal.js
import React from "react";
import styles from "./modal.module.css";

export default function ResumeUploadModal({
  isOpen,
  onClose,
  onResume,
  onDiscard,
  uploads,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Resume Uploads</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>
            You have {uploads.length} unfinished uploads. Would you like to
            resume them?
          </p>

          <div className={styles.uploadsList}>
            {uploads.map((upload, index) => (
              <div key={index} className={styles.uploadItem}>
                <span className={styles.fileName}>
                  {upload.key.split("/").pop()}
                </span>
                <span className={styles.fileProgress}>
                  {Math.round((upload.completedSize / upload.fileSize) * 100)}%
                  complete
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onDiscard}>
            Discard Uploads
          </button>
          <button className={styles.confirmButton} onClick={onResume}>
            Resume Uploads
          </button>
        </div>
      </div>
    </div>
  );
}
