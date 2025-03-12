"use client";

import styles from "./notifications.module.css";

export default function NotificationsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
      </div>

      <div className={styles.notificationsList}>
        <div className={styles.notification}>
          <div className={styles.notificationIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className={styles.notificationContent}>
            <h3>Project "Market Research" completed</h3>
            <p>
              Your project has been processed and results are ready to view.
            </p>
            <span className={styles.notificationTime}>2 hours ago</span>
          </div>
        </div>

        <div className={styles.notification}>
          <div className={styles.notificationIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div className={styles.notificationContent}>
            <h3>New message from support</h3>
            <p>You have a new message regarding your recent inquiry.</p>
            <span className={styles.notificationTime}>1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
