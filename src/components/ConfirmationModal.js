"use client";
import React from 'react';
import styles from './ConfirmationModal.module.css';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  secondaryAction = null,
  secondaryText = "Save for Later",
  type = "warning" // warning, danger, info
}) {
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={`${styles.modalHeader} ${styles[type]}`}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
          >
            {cancelText}
          </button>
          
          {secondaryAction && (
            <button 
              className={styles.secondaryButton} 
              onClick={() => {
                secondaryAction();
                onClose();
              }}
            >
              {secondaryText}
            </button>
          )}
          
          <button 
            className={`${styles.confirmButton} ${styles[type]}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}