"use client";
import { useState, useEffect } from "react";
import styles from "./past-papers.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faFileAlt,
  faDownload,
  faEye,
  faBookmark,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PastPapers() {
  const [isLoading, setIsLoading] = useState(true);
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubject, setActiveSubject] = useState("all");
  const [activeYear, setActiveYear] = useState("all");

  // Simulate loading past papers data
  useEffect(() => {
    const timer = setTimeout(() => {
      const papersData = [
        {
          id: 1,
          title: "Mathematics Paper 1: Pure Mathematics",
          subject: "Mathematics",
          year: "2024",
          session: "Summer",
          duration: "2 hours",
          marks: 100,
          downloads: 3245,
          views: 8760,
          bookmarked: true,
          difficulty: "Medium",
        },
        {
          id: 2,
          title: "Physics Unit 3: Practical Skills",
          subject: "Physics",
          year: "2024",
          session: "Winter",
          duration: "1.5 hours",
          marks: 60,
          downloads: 2187,
          views: 5431,
          bookmarked: false,
          difficulty: "Hard",
        },
        {
          id: 3,
          title: "Chemistry Paper 2: Organic Chemistry",
          subject: "Chemistry",
          year: "2023",
          session: "Summer",
          duration: "2 hours",
          marks: 90,
          downloads: 2876,
          views: 6543,
          bookmarked: true,
          difficulty: "Medium",
        },
        {
          id: 4,
          title: "Biology Unit 4: Ecosystems",
          subject: "Biology",
          year: "2023",
          session: "Winter",
          duration: "1.75 hours",
          marks: 75,
          downloads: 1985,
          views: 4328,
          bookmarked: false,
          difficulty: "Easy",
        },
        {
          id: 5,
          title: "English Literature Paper 1: Poetry and Prose",
          subject: "English",
          year: "2022",
          session: "Summer",
          duration: "2.5 hours",
          marks: 80,
          downloads: 2409,
          views: 5872,
          bookmarked: false,
          difficulty: "Medium",
        },
        {
          id: 6,
          title: "Computer Science Unit 2: Algorithms",
          subject: "Computer Science",
          year: "2022",
          session: "Winter",
          duration: "2 hours",
          marks: 100,
          downloads: 3102,
          views: 7651,
          bookmarked: true,
          difficulty: "Hard",
        },
      ];

      setPapers(papersData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter papers based on search term, subject and year
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubject =
      activeSubject === "all" || paper.subject === activeSubject;
    const matchesYear = activeYear === "all" || paper.year === activeYear;

    return matchesSearch && matchesSubject && matchesYear;
  });

  // Get unique subjects and years for filters
  const subjects = ["all", ...new Set(papers.map((paper) => paper.subject))];
  const years = ["all", ...new Set(papers.map((paper) => paper.year))].sort(
    (a, b) => b - a
  );

  // Toggle bookmark
  const toggleBookmark = (id) => {
    setPapers(
      papers.map((paper) =>
        paper.id === id ? { ...paper, bookmarked: !paper.bookmarked } : paper
      )
    );
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return styles.difficultyEasy;
      case "Medium":
        return styles.difficultyMedium;
      case "Hard":
        return styles.difficultyHard;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Past Papers</h1>
        <p className={styles.subtitle}>
          Access past examination papers to prepare for your upcoming exams
        </p>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search past papers..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterDropdowns}>
          <div className={styles.filterContainer}>
            <label className={styles.filterLabel}>
              <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
              Subject:
            </label>
            <select
              className={styles.filterSelect}
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
            >
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject === "all" ? "All Subjects" : subject}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterContainer}>
            <label className={styles.filterLabel}>Year:</label>
            <select
              className={styles.filterSelect}
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
            >
              {years.map((year, index) => (
                <option key={index} value={year}>
                  {year === "all" ? "All Years" : year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading past papers..." />
        ) : (
          <div className={styles.papersGrid}>
            {filteredPapers.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
                <h3>No past papers found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              filteredPapers.map((paper) => (
                <div key={paper.id} className={styles.paperCard}>
                  <div className={styles.paperHeader}>
                    <div className={styles.paperYear}>
                      {paper.year} • {paper.session}
                    </div>
                    <button
                      className={`${styles.bookmarkButton} ${
                        paper.bookmarked ? styles.bookmarked : ""
                      }`}
                      onClick={() => toggleBookmark(paper.id)}
                    >
                      <FontAwesomeIcon icon={faBookmark} />
                    </button>
                  </div>

                  <div className={styles.paperInfo}>
                    <h3 className={styles.paperTitle}>{paper.title}</h3>
                    <div className={styles.paperSubject}>{paper.subject}</div>

                    <div className={styles.paperDetailRow}>
                      <div className={styles.paperDetail}>
                        <FontAwesomeIcon
                          icon={faClock}
                          className={styles.detailIcon}
                        />
                        <span>{paper.duration}</span>
                      </div>
                      <div className={styles.paperDetail}>
                        <span className={styles.marks}>
                          {paper.marks} marks
                        </span>
                      </div>
                    </div>

                    <div className={styles.paperStats}>
                      <div className={styles.statItem}>
                        <FontAwesomeIcon
                          icon={faEye}
                          className={styles.statIcon}
                        />
                        <span>{paper.views}</span>
                      </div>
                      <div className={styles.statItem}>
                        <FontAwesomeIcon
                          icon={faDownload}
                          className={styles.statIcon}
                        />
                        <span>{paper.downloads}</span>
                      </div>
                      <div
                        className={`${
                          styles.difficultyBadge
                        } ${getDifficultyColor(paper.difficulty)}`}
                      >
                        {paper.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className={styles.paperActions}>
                    <button className={styles.viewButton}>View Paper</button>
                    <button className={styles.downloadButton}>
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
