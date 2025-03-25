// Modified dashboard layout with loading indicators
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useAmplify } from "../context/Providers";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AIAssistantIndicator } from "@/components/AIAssistantTrigger";
import {
  faTh,
  faBell,
  faComment,
  faQuestionCircle,
  faCog,
  faRepeat,
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faMicrochip,
  faBook,
  faTrophy,
  faComments,
  faHistory,
  faSearchLocation,
  faFileAlt,
  faStickyNote,
  faTools,
  faLayerGroup,
  faClipboardList,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import { extractFullName } from "@/utils";

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, isLoading } = useAmplify();
  const router = useRouter();
  const pathname = usePathname();
  // Track which section is currently loading
  const [loadingSection, setLoadingSection] = useState(null);

  // Extract the active section from the path
  const getActiveSection = (path) => {
    const sections = path.split("/");
    return sections.length > 2 ? sections[2] : "overview";
  };

  const activeSection = getActiveSection(pathname);

  // State for the entire sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Reset loading when pathname changes (navigation completes)
  useEffect(() => {
    setLoadingSection(null);
  }, [pathname]);

  // Handle menu item click to set loading state
  const handleMenuItemClick = (e, section, href) => {
    // Only set loading if we're navigating to a different section
    if (section !== activeSection) {
      e.preventDefault();
      setLoadingSection(section);
      // Use setTimeout to simulate a small delay before navigation
      // This ensures the spinner is visible before page transition
      setTimeout(() => {
        router.push(href);
      }, 50);
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner fullPage={true} text="Loading your dashboard..." />;
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
                    activeSection === "overview" || pathname === "/dashboard"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/overview" 
                    onClick={(e) => handleMenuItemClick(e, "overview", "/dashboard/overview")}
                  >
                    <FontAwesomeIcon 
                      icon={faMicrochip} 
                      className={loadingSection === "overview" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Overview</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "mocks"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/mocks" 
                    onClick={(e) => handleMenuItemClick(e, "mocks", "/dashboard/mocks")}
                  >
                    <FontAwesomeIcon 
                      icon={faBook} 
                      className={loadingSection === "mocks" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Mocks</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "competition"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/competition" 
                    onClick={(e) => handleMenuItemClick(e, "competition", "/dashboard/competition")}
                  >
                    <FontAwesomeIcon 
                      icon={faTrophy} 
                      className={loadingSection === "competition" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Competition</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "forums"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/forums" 
                    onClick={(e) => handleMenuItemClick(e, "forums", "/dashboard/forums")}
                  >
                    <FontAwesomeIcon 
                      icon={faComments} 
                      className={loadingSection === "forums" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Forums</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "how-it-works"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/how-it-works" 
                    onClick={(e) => handleMenuItemClick(e, "how-it-works", "/dashboard/how-it-works")}
                  >
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className={loadingSection === "how-it-works" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>How It Works</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "changelog"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/changelog" 
                    onClick={(e) => handleMenuItemClick(e, "changelog", "/dashboard/changelog")}
                  >
                    <FontAwesomeIcon 
                      icon={faHistory} 
                      className={loadingSection === "changelog" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Changelog</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "exam-centre-finder"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/exam-centre-finder" 
                    onClick={(e) => handleMenuItemClick(e, "exam-centre-finder", "/dashboard/exam-centre-finder")}
                  >
                    <FontAwesomeIcon 
                      icon={faSearchLocation} 
                      className={loadingSection === "exam-centre-finder" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Exam Centre Finder</span>}
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Revision Section */}
            <div className={styles.menuSection}>
              {!isSidebarCollapsed && <h4>Revision</h4>}
              <ul className={styles.menuItems}>
                <li
                  className={
                    activeSection === "past-papers"
                      ? styles.activeMenuItem
                      : ""
                  }
                >
                  <Link 
                    href="/dashboard/past-papers" 
                    onClick={(e) => handleMenuItemClick(e, "past-papers", "/dashboard/past-papers")}
                  >
                    <FontAwesomeIcon 
                      icon={faFileAlt} 
                      className={loadingSection === "past-papers" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Past Papers</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "notes" ? styles.activeMenuItem : ""
                  }
                >
                  <Link 
                    href="/dashboard/notes" 
                    onClick={(e) => handleMenuItemClick(e, "notes", "/dashboard/notes")}
                  >
                    <FontAwesomeIcon 
                      icon={faStickyNote} 
                      className={loadingSection === "notes" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Notes</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "skills" ? styles.activeMenuItem : ""
                  }
                >
                  <Link 
                    href="/dashboard/skills" 
                    onClick={(e) => handleMenuItemClick(e, "skills", "/dashboard/skills")}
                  >
                    <FontAwesomeIcon 
                      icon={faTools} 
                      className={loadingSection === "skills" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Skills</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "flashcards" ? styles.activeMenuItem : ""
                  }
                >
                  <Link 
                    href="/dashboard/flashcards" 
                    onClick={(e) => handleMenuItemClick(e, "flashcards", "/dashboard/flashcards")}
                  >
                    <FontAwesomeIcon 
                      icon={faLayerGroup} 
                      className={loadingSection === "flashcards" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Flashcards</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "specifications" ? styles.activeMenuItem : ""
                  }
                >
                  <Link 
                    href="/dashboard/specifications" 
                    onClick={(e) => handleMenuItemClick(e, "specifications", "/dashboard/specifications")}
                  >
                    <FontAwesomeIcon 
                      icon={faClipboardList} 
                      className={loadingSection === "specifications" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Specifications</span>}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.sideMenuBottom}>
            <div className={styles.menuSection}>
              {!isSidebarCollapsed && <h4>Support</h4>}
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
                  <Link 
                    href="/dashboard/settings" 
                    onClick={(e) => handleMenuItemClick(e, "settings", "/dashboard/settings")}
                  >
                    <FontAwesomeIcon 
                      icon={faCog} 
                      className={loadingSection === "settings" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Settings</span>}
                  </Link>
                </li>
                <li
                  className={
                    activeSection === "contact" ? styles.activeMenuItem : ""
                  }
                >
                  <Link 
                    href="/dashboard/contact" 
                    onClick={(e) => handleMenuItemClick(e, "contact", "/dashboard/contact")}
                  >
                    <FontAwesomeIcon 
                      icon={faEnvelope} 
                      className={loadingSection === "contact" ? styles.spinningIcon : ""}
                    />
                    {!isSidebarCollapsed && <span>Contact</span>}
                  </Link>
                </li>
              </ul>
            </div>
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
      
      {/* AI Assistant Indicator (only shown when sidebar is collapsed) */}
      {isSidebarCollapsed && (
        <div className={styles.aiIndicatorContainer}>
          <AIAssistantIndicator theme="dark" />
        </div>
      )}
    </div>
  );
}