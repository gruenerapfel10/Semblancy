"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";
import Link from "next/link";
import { useAmplify } from "../../Providers";

export default function SettingsPage() {
  const { userPreferences, updateUserPreferences, isLoading } = useAmplify();
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    company: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectCompletions: true,
    newMessages: true,
    systemUpdates: false,
    marketingEmails: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    compactView: false,
  });

  // Show toast notification
  const showToast = (message, type = "success") => {
    if (toast.show) {
      setToast({ ...toast, exiting: true });
      setTimeout(() => {
        setToast({ show: true, message, type, exiting: false });
      }, 300);
    } else {
      setToast({ show: true, message, type, exiting: false });
    }

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, exiting: true }));
      setTimeout(() => {
        setToast({ show: false, message: "", type: "", exiting: false });
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  };

  // Load preferences when component mounts
  useEffect(() => {
    if (userPreferences && !isLoading) {
      console.log("Loading user preferences:", userPreferences);

      setProfileForm({
        firstName: userPreferences.firstName || "",
        lastName: userPreferences.lastName || "",
        email: userPreferences.email || "",
        jobTitle: userPreferences.jobTitle || "",
        company: userPreferences.company || "",
      });

      if (userPreferences.notifications) {
        setNotificationSettings({
          emailNotifications:
            userPreferences.notifications.emailNotifications ?? true,
          projectCompletions:
            userPreferences.notifications.projectCompletions ?? true,
          newMessages: userPreferences.notifications.newMessages ?? true,
          systemUpdates: userPreferences.notifications.systemUpdates ?? false,
          marketingEmails:
            userPreferences.notifications.marketingEmails ?? false,
        });
      }

      setSecuritySettings({
        twoFactorAuth: userPreferences.twoFactorAuth ?? false,
        sessionTimeout: userPreferences.sessionTimeout || "30",
      });

      setAppearance({
        theme: userPreferences.theme || "light",
        compactView: userPreferences.compactView ?? false,
      });
    }
  }, [userPreferences, isLoading]);

  // Initialize active tab from URL hash and listen for changes
  useEffect(() => {
    const setTabFromHash = () => {
      const hash = window.location.hash.slice(1) || "profile";
      setActiveTab(hash);
    };

    // Set on mount
    setTabFromHash();

    // Listen for hash changes
    window.addEventListener("hashchange", setTabFromHash);
    return () => window.removeEventListener("hashchange", setTabFromHash);
  }, []);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle notification toggle changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle security settings changes
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle appearance settings changes
  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setAppearance((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (name === "theme") {
      const event = new CustomEvent("themeChange", {
        detail: { theme: value },
      });
      window.dispatchEvent(event);
      updateUserPreferences({ theme: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedPreferences = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        jobTitle: profileForm.jobTitle,
        company: profileForm.company,
        theme: appearance.theme,
        compactView: appearance.compactView,
        notifications: notificationSettings,
        sessionTimeout: securitySettings.sessionTimeout,
        twoFactorAuth: securitySettings.twoFactorAuth,
      };

      await updateUserPreferences(updatedPreferences);
      showToast("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings. Please try again.", "error");
    }
  };

  // Display initials for profile picture
  const getInitials = () => {
    return `${profileForm.firstName.charAt(0)}${profileForm.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={styles.container}>
      {toast.show && (
        <div
          className={`${styles.toast} ${styles[toast.type]} ${
            toast.exiting ? styles.exiting : ""
          }`}
        >
          <div className={styles.toastContent}>
            <span>{toast.message}</span>
            <button
              className={styles.toastClose}
              onClick={() => {
                setToast((prev) => ({ ...prev, exiting: true }));
                setTimeout(() => {
                  setToast({
                    show: false,
                    message: "",
                    type: "",
                    exiting: false,
                  });
                }, 300);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>

      <div className={styles.settingsContainer}>
        <div className={styles.settingsTabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "profile" ? styles.activeTab : ""
            }`}
            onClick={() => (window.location.hash = "profile")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </button>

          <button
            className={`${styles.tabButton} ${
              activeTab === "notifications" ? styles.activeTab : ""
            }`}
            onClick={() => (window.location.hash = "notifications")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            Notifications
          </button>

          <button
            className={`${styles.tabButton} ${
              activeTab === "security" ? styles.activeTab : ""
            }`}
            onClick={() => (window.location.hash = "security")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Security
          </button>
        </div>

        <div className={styles.settingsContent}>
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h2 className={styles.sectionTitle}>Profile Information</h2>

              <div className={styles.profileHeader}>
                <div className={styles.profilePicture}>
                  <span>{getInitials() || "U"}</span>
                </div>
                <div className={styles.profileInfo}>
                  <h3>
                    {profileForm.firstName || "User"}{" "}
                    {profileForm.lastName || ""}
                  </h3>
                  <p>{profileForm.email || "No email set"}</p>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={profileForm.jobTitle}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={profileForm.company}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
              <p className={styles.sectionDescription}>
                Manage how and when you receive notifications from the platform.
              </p>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div>
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Project Completions</h3>
                    <p>Get notified when your projects are complete</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="projectCompletions"
                      checked={notificationSettings.projectCompletions}
                      onChange={handleNotificationChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>New Messages</h3>
                    <p>Receive alerts for new messages</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="newMessages"
                      checked={notificationSettings.newMessages}
                      onChange={handleNotificationChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>System Updates</h3>
                    <p>Get notified about platform updates and maintenance</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onChange={handleNotificationChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Marketing Emails</h3>
                    <p>Receive newsletters and promotional content</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onChange={handleNotificationChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Save Preferences
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h2 className={styles.sectionTitle}>Security Settings</h2>

              <div className={styles.securitySection}>
                <h3 className={styles.subsectionTitle}>Password</h3>
                <div className={styles.passwordActions}>
                  <Link href="/forgot-password">
                    <button type="button" className={styles.outlineButton}>
                      Change Password
                    </button>
                  </Link>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
