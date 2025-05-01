"use client";
import { useState, useEffect } from "react";
import styles from "./changelog.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBug,
  faCode,
  faFeather,
  faRocket,
  faWrench,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt,
  faTag
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Changelog() {
  const [isLoading, setIsLoading] = useState(true);
  const [changelogs, setChangelogs] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid or timeline

  // Simulate loading changelog data
  useEffect(() => {
    const timer = setTimeout(() => {
      const changelogData = [
        {
          id: 1,
          version: "2.5.0",
          date: "2025-03-10",
          title: "Major Update - New Exam Practice Mode",
          summary: "Introducing our new timed exam simulation mode with adaptive difficulty and enhanced flashcard algorithms.",
          changes: [
            { type: "feature", text: "Added new timed exam simulation mode" },
            {
              type: "feature",
              text: "Implemented adaptive question difficulty based on user performance",
            },
            {
              type: "improvement",
              text: "Enhanced flashcard algorithms for better retention",
            },
            {
              type: "fix",
              text: "Fixed loading issues with large question banks",
            },
            {
              type: "fix",
              text: "Corrected scoring calculation in multiple-choice questions",
            },
          ],
        },
        {
          id: 2,
          version: "2.4.5",
          date: "2025-02-25",
          title: "Performance Improvements",
          summary: "Major performance optimizations with 40% faster startup time and new export functionality.",
          changes: [
            {
              type: "improvement",
              text: "Optimized application startup time by 40%",
            },
            {
              type: "improvement",
              text: "Reduced memory consumption for large datasets",
            },
            {
              type: "feature",
              text: "Added export functionality for study notes",
            },
            {
              type: "fix",
              text: "Fixed mobile UI layout issues on smaller screens",
            },
          ],
        },
        {
          id: 3,
          version: "2.4.0",
          date: "2025-02-10",
          title: "New Content & Community Features",
          summary: "Launching community forums with 500+ new practice questions and study group functionality.",
          changes: [
            {
              type: "feature",
              text: "Launched community forums for peer discussions",
            },
            {
              type: "feature",
              text: "Added 500+ new practice questions across all subjects",
            },
            { type: "feature", text: "Implemented study group functionality" },
            {
              type: "improvement",
              text: "Enhanced search capabilities with filters",
            },
            { type: "fix", text: "Resolved syncing issues between devices" },
          ],
        },
        {
          id: 4,
          version: "2.3.2",
          date: "2025-01-15",
          title: "Bug Fixes & UI Refinements",
          summary: "Various bug fixes and UI improvements including better accessibility and dark mode refinements.",
          changes: [
            {
              type: "fix",
              text: "Fixed authentication issues affecting some users",
            },
            { type: "fix", text: "Corrected display of progress statistics" },
            {
              type: "improvement",
              text: "Updated UI for better accessibility",
            },
            { type: "improvement", text: "Refined dark mode color scheme" },
          ],
        },
      ];

      setChangelogs(changelogData);
      setActiveVersion(changelogData[0]);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Get icon based on change type
  const getChangeIcon = (type) => {
    switch (type) {
      case "feature":
        return (
          <FontAwesomeIcon
            icon={faRocket}
            className={`${styles.changeIcon} ${styles.featureIcon}`}
          />
        );
      case "improvement":
        return (
          <FontAwesomeIcon
            icon={faFeather}
            className={`${styles.changeIcon} ${styles.improvementIcon}`}
          />
        );
      case "fix":
        return (
          <FontAwesomeIcon
            icon={faBug}
            className={`${styles.changeIcon} ${styles.fixIcon}`}
          />
        );
      case "code":
        return (
          <FontAwesomeIcon
            icon={faCode}
            className={`${styles.changeIcon} ${styles.codeIcon}`}
          />
        );
      case "info":
        return (
          <FontAwesomeIcon
            icon={faInfoCircle}
            className={`${styles.changeIcon} ${styles.infoIcon}`}
          />
        );
      default:
        return (
          <FontAwesomeIcon icon={faWrench} className={styles.changeIcon} />
        );
    }
  };

  // Function to get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case "feature":
        return "New Feature";
      case "improvement":
        return "Improvement";
      case "fix":
        return "Bug Fix";
      case "code":
        return "Code Change";
      case "info":
        return "Information";
      default:
        return "Change";
    }
  };

  // Count changes by type
  const countChangesByType = (changes) => {
    const counts = {
      feature: 0,
      improvement: 0,
      fix: 0,
      code: 0,
      info: 0
    };
    
    changes.forEach(change => {
      if (counts[change.type] !== undefined) {
        counts[change.type]++;
      }
    });
    
    return counts;
  };

  // Handle pagination
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(changelogs.length / 2) - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  // Toggle between grid and timeline view
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "timeline" : "grid");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Changelog</h1>
        <div className={styles.headerControls}>
          <p className={styles.subtitle}>
            Keep track of platform updates, new features, and improvements
          </p>
          <button 
            className={styles.viewToggleButton}
            onClick={toggleViewMode}
          >
            {viewMode === "grid" ? "Switch to Timeline View" : "Switch to Grid View"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading changelog</p>
        </div>
      ) : (
        <div className={styles.content}>
          {viewMode === "grid" && (
            <>
              <div className={styles.featuredUpdate}>
                {activeVersion && (
                  <div className={styles.featuredCard}>
                    <div className={styles.featuredHeader}>
                      <div className={styles.versionTag}>
                        <FontAwesomeIcon icon={faTag} className={styles.versionIcon} />
                        <span>{activeVersion.version}</span>
                      </div>
                      <div className={styles.dateTag}>
                        <FontAwesomeIcon icon={faCalendarAlt} className={styles.dateIcon} />
                        <span>{new Date(activeVersion.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h2 className={styles.featuredTitle}>{activeVersion.title}</h2>
                    <p className={styles.featuredSummary}>{activeVersion.summary}</p>
                    
                    <div className={styles.changeCounts}>
                      {Object.entries(countChangesByType(activeVersion.changes)).map(([type, count]) => {
                        if (count > 0) {
                          return (
                            <div key={type} className={`${styles.changeCount} ${styles[`${type}Count`]}`}>
                              {getChangeIcon(type)}
                              <span>{count} {getTypeLabel(type)}{count > 1 ? 's' : ''}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <div className={styles.changeDetailsWrapper}>
                      <h3 className={styles.changeDetailsTitle}>What's New</h3>
                      <ul className={styles.changeDetails}>
                        {activeVersion.changes.map((change, index) => (
                          <li key={index} className={`${styles.changeDetailItem} ${styles[`${change.type}Item`]}`}>
                            {getChangeIcon(change.type)}
                            <div className={styles.changeInfo}>
                              <span className={styles.changeType}>{getTypeLabel(change.type)}</span>
                              <span className={styles.changeText}>{change.text}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.paginationControls}>
                <button 
                  className={styles.paginationButton} 
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span className={styles.paginationText}>
                  {currentPage + 1} / {Math.ceil(changelogs.length / 2)}
                </span>
                <button 
                  className={styles.paginationButton} 
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(changelogs.length / 2) - 1}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>

              <div className={styles.updatesGrid}>
                {changelogs.slice(currentPage * 2, (currentPage + 1) * 2).map((log) => (
                  <div 
                    key={log.id} 
                    className={`${styles.updateCard} ${activeVersion?.id === log.id ? styles.activeCard : ''}`}
                    onClick={() => setActiveVersion(log)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.versionNumber}>{log.version}</div>
                      <div className={styles.updateDate}>{new Date(log.date).toLocaleDateString()}</div>
                    </div>
                    <h3 className={styles.updateTitle}>{log.title}</h3>
                    <p className={styles.updateSummary}>{log.summary}</p>
                    <div className={styles.changeTypesPreview}>
                      {Object.entries(countChangesByType(log.changes)).map(([type, count]) => {
                        if (count > 0) {
                          return (
                            <div key={type} className={styles.typeTag}>
                              {getChangeIcon(type)}
                              <span>{count}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <button className={styles.viewDetailsButton}>
                      {activeVersion?.id === log.id ? 'Current Selection' : 'View Details'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {viewMode === "timeline" && (
            <div className={styles.timeline}>
              {changelogs.map((log, index) => (
                <div key={log.id} className={styles.timelineItem}>
                  <div className={styles.timelineBadge}>
                    <span className={styles.versionNumber}>{log.version}</span>
                  </div>

                  <div className={styles.timelineContent}>
                    <div className={styles.releaseHeader}>
                      <h3 className={styles.releaseTitle}>{log.title}</h3>
                      <span className={styles.releaseDate}>
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className={styles.timelineSummary}>
                      {log.summary}
                    </div>

                    <ul className={styles.changesList}>
                      {log.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className={styles.changeItem}>
                          {getChangeIcon(change.type)}
                          <div className={styles.changeContent}>
                            <span className={styles.changeTypeLabel}>{getTypeLabel(change.type)}</span>
                            <span className={styles.changeText}>{change.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              <div className={styles.timelineEnd}>
                <div className={styles.timelineEndBadge}>
                  <span className={styles.timelineEndText}>Earlier versions</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}