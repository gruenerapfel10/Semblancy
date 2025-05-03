"use client";
// File: src/components/Modal.js
import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, children, title }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay || 'modal-overlay'}>
      <div className={styles.modalContent || 'modal-content'} ref={modalRef}>
        <div className={styles.modalHeader || 'modal-header'}>
          <h2>{title}</h2>
          <button 
            className={styles.closeButton || 'close-button'} 
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className={styles.modalBody || 'modal-body'}>
          {children}
        </div>
      </div>
    </div>
  );
}