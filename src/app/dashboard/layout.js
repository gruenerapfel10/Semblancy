"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useAmplify } from "../Providers";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTh,
  faBell,
  faComment,
  faQuestionCircle,
  faCog,
  faRepeat,
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { extractFullName } from "@/utils";

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, isLoading } = useAmplify();
  const router = useRouter();
  const pathname = usePathname();

  // Extract the active section from the path
  const getActiveSection = (path) => {
    const sections = path.split("/");
    return sections.length > 2 ? sections[2] : "projects";
  };

  const activeSection = getActiveSection(pathname);

  // State for the entire sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner fullPage={true} text="Loading your dashboard..." />;
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className={styles.errorContainer}>
        <h2>Authentication Required</h2>
        <p>Please log in to access your dashboard.</p>
        <button
          onClick={() => router.push("/login")}
          className={styles.loginButton}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.appLayout}>
      {/* Main Container */}
      <div className={styles.layoutContainer}>
        {/* Side Menu */}
        <aside
          className={`${styles.sideMenu} ${
            isSidebarCollapsed ? styles.collapsed : ""
          }`}
        >
          <div className={styles.sideMenuTop}>
            {/* Sidebar toggle button */}
            <div
              className={`${styles.collapseContainer} ${
                isSidebarCollapsed ? styles.collapsed : ""
              }`}
            >
              <button
                className={styles.sidebarToggle}
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              >
                <FontAwesomeIcon
                  icon={
                    isSidebarCollapsed ? faAngleDoubleRight : faAngleDoubleLeft
                  }
                />
              </button>
            </div>
            {/* Menu Section */}
            <div className={styles.menuSection}>
              {!isSidebarCollapsed && <h4>Menu</h4>}
              <ul className={styles.menuItems}>
                <li
                  className={
                    activeSection === "projects" || pathname === "/dashboard"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link href="/dashboard/projects">
                    <FontAwesomeIcon icon={faTh} />
                    {!isSidebarCollapsed && <span>Projects</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "how-it-works"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link href="/dashboard/how-it-works">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    {!isSidebarCollapsed && <span>How It Works</span>}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Support Section */}
            {/* <div className={styles.menuSection}>
              {!isSidebarCollapsed && <h4>Support</h4>}
              <ul className={styles.menuItems}>
                <li
                  className={
                    activeSection === "notifications"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link href="/dashboard/notifications">
                    <FontAwesomeIcon icon={faBell} />
                    {!isSidebarCollapsed && <span>Notifications</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "messages" ? styles.activeMenuItem : ""
                  }
                >
                  <Link href="/dashboard/messages">
                    <FontAwesomeIcon icon={faComment} />
                    {!isSidebarCollapsed && <span>Messages</span>}
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>

          <div className={styles.sideMenuBottom}>
            <ul className={styles.menuItems}>
              <li>
                <Link href="" onClick={() => window.location.reload()}>
                  <FontAwesomeIcon icon={faRepeat} />
                  {!isSidebarCollapsed && <span>Refresh</span>}
                </Link>
              </li>
              <li
                className={
                  activeSection === "settings" ? styles.activeMenuItem : ""
                }
              >
                <Link href="/dashboard/settings">
                  <FontAwesomeIcon icon={faCog} />
                  {!isSidebarCollapsed && <span>Settings</span>}
                </Link>
              </li>
            </ul>
            <div className={styles.userProfile}>
              <div className={styles.userAvatar}>
                {user?.username?.charAt(0) || "U"}
              </div>
              {!isSidebarCollapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {user?.username ? extractFullName(user.username) : "User"}
                  </span>
                  <span className={styles.userEmail}>
                    {user?.attributes?.email || ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
