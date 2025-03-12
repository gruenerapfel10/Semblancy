"use client";

import { useState } from "react";
import styles from "./messages.module.css";

export default function MessagesPage() {
  // Sample data for messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "System Notifications",
      subject: "Welcome to Prosemble",
      preview:
        "Thank you for joining Prosemble. Here are some tips to get started with your first project...",
      date: "Mar 6, 2025",
      time: "09:45 AM",
      unread: false,
    },
    {
      id: 2,
      sender: "Support Team",
      subject: "Response to your inquiry",
      preview:
        "Hello, we've reviewed your question about data processing. To address your concern about...",
      date: "Mar 5, 2025",
      time: "02:30 PM",
      unread: true,
    },
    {
      id: 3,
      sender: "Maria Chen (Account Manager)",
      subject: "Your subscription upgrade",
      preview:
        "Your account has been successfully upgraded to Premium. You now have access to additional features...",
      date: "Mar 3, 2025",
      time: "11:15 AM",
      unread: true,
    },
    {
      id: 4,
      sender: "Data Processing Team",
      subject: "Project 'Market Analysis' completed",
      preview:
        "We're pleased to inform you that your project 'Market Analysis' has been processed successfully...",
      date: "Feb 28, 2025",
      time: "04:20 PM",
      unread: false,
    },
  ]);

  // Mark message as read
  const markAsRead = (id) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, unread: false } : message
      )
    );
  };

  // Delete message
  const deleteMessage = (id) => {
    if (confirm("Are you sure you want to delete this message?")) {
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== id)
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Messages</h1>
        <div className={styles.messageControls}>
          <button className={styles.composeButton}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Compose New
          </button>
        </div>
      </div>

      <div className={styles.messagesList}>
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.messageItem} ${
                  message.unread ? styles.unread : ""
                }`}
                onClick={() => markAsRead(message.id)}
              >
                <div className={styles.messageStatus}>
                  {message.unread && <div className={styles.unreadDot}></div>}
                </div>

                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <h3 className={styles.messageSender}>{message.sender}</h3>
                    <span className={styles.messageDate}>
                      {message.date} at {message.time}
                    </span>
                  </div>

                  <h4 className={styles.messageSubject}>{message.subject}</h4>
                  <p className={styles.messagePreview}>{message.preview}</p>
                </div>

                <div className={styles.messageActions}>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(message.id);
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>

                  <button
                    className={styles.replyButton}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 10 20 15 15 20"></polyline>
                      <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M22 20.3V3.7c0-1-1-1.7-1.9-1.7H3.9C3 2 2 2.7 2 3.7v16.7c0 1 1 1.7 1.9 1.7h16.2c.9-.1 1.9-.8 1.9-1.8z"></path>
                <path d="M2 3.7l10 8.3 10-8.3M2 20.3l6.2-6.2M22 20.3l-6.2-6.2"></path>
              </svg>
            </div>
            <h3>No Messages</h3>
            <p>You don't have any messages in your inbox.</p>
            <button className={styles.composeButton}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Compose New
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
