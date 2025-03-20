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
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Changelog() {
  const [isLoading, setIsLoading] = useState(true);
  const [changelogs, setChangelogs] = useState([]);

  // Simulate loading changelog data
  useEffect(() => {
    const timer = setTimeout(() => {
      const changelogData = [
        {
          id: 1,
          version: "2.5.0",
          date: "2025-03-10",
          title: "Major Update - New Exam Practice Mode",
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Changelog</h1>
        <p className={styles.subtitle}>
          Keep track of platform updates, new features, and improvements
        </p>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading changelog" />
        ) : (
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

                  <ul className={styles.changesList}>
                    {log.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className={styles.changeItem}>
                        {getChangeIcon(change.type)}
                        <span className={styles.changeText}>{change.text}</span>
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
    </div>
  );
}
