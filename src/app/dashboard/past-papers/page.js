"use client";
import { useState, useEffect, useMemo } from "react";
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
  faThLarge,
  faList,
  faFolder,
  faFolderOpen,
  faChevronRight,
  faChevronDown,
  faFileAlt as faFile,
  faFileDownload,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAmplify } from "@/app/context/Providers";

// HierarchicalListView Component
const HierarchicalListView = ({
  papers,
  expandedFolders,
  setExpandedFolders,
  viewPaper,
  downloadPaper,
  formatFileSize,
  toggleBookmark,
}) => {
  // Group papers by subject
  const groupBySubject = (papers) => {
    const grouped = {};
    papers.forEach((paper) => {
      if (!grouped[paper.subject]) {
        grouped[paper.subject] = [];
      }
      grouped[paper.subject].push(paper);
    });
    return grouped;
  };

  // Group papers by level within subject
  const groupByLevel = (papers) => {
    const grouped = {};
    papers.forEach((paper) => {
      if (!grouped[paper.level]) {
        grouped[paper.level] = [];
      }
      grouped[paper.level].push(paper);
    });
    return grouped;
  };

  // Group papers by exam board within level
  const groupByExamBoard = (papers) => {
    const grouped = {};
    papers.forEach((paper) => {
      if (!grouped[paper.examBoard]) {
        grouped[paper.examBoard] = [];
      }
      grouped[paper.examBoard].push(paper);
    });
    return grouped;
  };

  // Group papers by year within exam board
  const groupByYear = (papers) => {
    const grouped = {};
    papers.forEach((paper) => {
      const yearKey = paper.session
        ? `${paper.year}-${paper.session}`
        : paper.year;
      if (!grouped[yearKey]) {
        grouped[yearKey] = [];
      }
      grouped[yearKey].push(paper);
    });
    return grouped;
  };

  // Group papers by paper number within year
  const groupByPaperNumber = (papers) => {
    const grouped = {};
    papers.forEach((paper) => {
      if (!grouped[paper.paperNumber]) {
        grouped[paper.paperNumber] = [];
      }
      grouped[paper.paperNumber].push(paper);
    });
    return grouped;
  };

  // Toggle folder expansion
  const toggleFolder = (key) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Check if a folder is expanded
  const isFolderExpanded = (key) => {
    return expandedFolders[key] === true;
  };

  // Group all papers
  const subjectGroups = groupBySubject(papers);

  return (
    <div className={styles.hierarchicalList}>
      {Object.entries(subjectGroups).map(([subject, subjectPapers]) => {
        const subjectKey = `subject-${subject}`;
        const isSubjectExpanded = isFolderExpanded(subject);

        return (
          <div key={subjectKey} className={styles.folderItem}>
            <div
              className={styles.folderHeader}
              onClick={() => toggleFolder(subject)}
            >
              <span className={styles.folderIcon}>
                <FontAwesomeIcon
                  icon={isSubjectExpanded ? faFolderOpen : faFolder}
                />
              </span>
              <span className={styles.folderChevron}>
                <FontAwesomeIcon
                  icon={isSubjectExpanded ? faChevronDown : faChevronRight}
                />
              </span>
              <span className={styles.folderName}>
                {subject.replace(/-/g, " ")}
              </span>
              <span className={styles.folderCount}>{subjectPapers.length}</span>
            </div>

            {isSubjectExpanded && (
              <div className={styles.folderContent}>
                {Object.entries(groupByLevel(subjectPapers)).map(
                  ([level, levelPapers]) => {
                    const levelKey = `${subject}-${level}`;
                    const isLevelExpanded = isFolderExpanded(levelKey);

                    return (
                      <div key={levelKey} className={styles.folderItem}>
                        <div
                          className={styles.folderHeader}
                          onClick={() => toggleFolder(levelKey)}
                        >
                          <span className={styles.folderIcon}>
                            <FontAwesomeIcon
                              icon={isLevelExpanded ? faFolderOpen : faFolder}
                            />
                          </span>
                          <span className={styles.folderChevron}>
                            <FontAwesomeIcon
                              icon={
                                isLevelExpanded ? faChevronDown : faChevronRight
                              }
                            />
                          </span>
                          <span className={styles.folderName}>
                            {level.replace(/_/g, " ")}
                          </span>
                          <span className={styles.folderCount}>
                            {levelPapers.length}
                          </span>
                        </div>

                        {isLevelExpanded && (
                          <div className={styles.folderContent}>
                            {Object.entries(groupByExamBoard(levelPapers)).map(
                              ([examBoard, boardPapers]) => {
                                const boardKey = `${levelKey}-${examBoard}`;
                                const isBoardExpanded =
                                  isFolderExpanded(boardKey);

                                return (
                                  <div
                                    key={boardKey}
                                    className={styles.folderItem}
                                  >
                                    <div
                                      className={styles.folderHeader}
                                      onClick={() => toggleFolder(boardKey)}
                                    >
                                      <span className={styles.folderIcon}>
                                        <FontAwesomeIcon
                                          icon={
                                            isBoardExpanded
                                              ? faFolderOpen
                                              : faFolder
                                          }
                                        />
                                      </span>
                                      <span className={styles.folderChevron}>
                                        <FontAwesomeIcon
                                          icon={
                                            isBoardExpanded
                                              ? faChevronDown
                                              : faChevronRight
                                          }
                                        />
                                      </span>
                                      <span className={styles.folderName}>
                                        {examBoard}
                                      </span>
                                      <span className={styles.folderCount}>
                                        {boardPapers.length}
                                      </span>
                                    </div>

                                    {isBoardExpanded && (
                                      <div className={styles.folderContent}>
                                        {Object.entries(
                                          groupByYear(boardPapers)
                                        ).map(([year, yearPapers]) => {
                                          const yearKey = `${boardKey}-${year}`;
                                          const isYearExpanded =
                                            isFolderExpanded(yearKey);

                                          return (
                                            <div
                                              key={yearKey}
                                              className={styles.folderItem}
                                            >
                                              <div
                                                className={styles.folderHeader}
                                                onClick={() =>
                                                  toggleFolder(yearKey)
                                                }
                                              >
                                                <span
                                                  className={styles.folderIcon}
                                                >
                                                  <FontAwesomeIcon
                                                    icon={
                                                      isYearExpanded
                                                        ? faFolderOpen
                                                        : faFolder
                                                    }
                                                  />
                                                </span>
                                                <span
                                                  className={
                                                    styles.folderChevron
                                                  }
                                                >
                                                  <FontAwesomeIcon
                                                    icon={
                                                      isYearExpanded
                                                        ? faChevronDown
                                                        : faChevronRight
                                                    }
                                                  />
                                                </span>
                                                <span
                                                  className={styles.folderName}
                                                >
                                                  {year}
                                                </span>
                                                <span
                                                  className={styles.folderCount}
                                                >
                                                  {yearPapers.length}
                                                </span>
                                              </div>

                                              {isYearExpanded && (
                                                <div
                                                  className={
                                                    styles.folderContent
                                                  }
                                                >
                                                  {Object.entries(
                                                    groupByPaperNumber(
                                                      yearPapers
                                                    )
                                                  ).map(
                                                    ([
                                                      paperNumber,
                                                      numberPapers,
                                                    ]) => {
                                                      const paperKey = `${yearKey}-Paper-${paperNumber}`;
                                                      const isPaperExpanded =
                                                        isFolderExpanded(
                                                          paperKey
                                                        );

                                                      return (
                                                        <div
                                                          key={paperKey}
                                                          className={
                                                            styles.folderItem
                                                          }
                                                        >
                                                          <div
                                                            className={
                                                              styles.folderHeader
                                                            }
                                                            onClick={() =>
                                                              toggleFolder(
                                                                paperKey
                                                              )
                                                            }
                                                          >
                                                            <span
                                                              className={
                                                                styles.folderIcon
                                                              }
                                                            >
                                                              <FontAwesomeIcon
                                                                icon={
                                                                  isPaperExpanded
                                                                    ? faFolderOpen
                                                                    : faFolder
                                                                }
                                                              />
                                                            </span>
                                                            <span
                                                              className={
                                                                styles.folderChevron
                                                              }
                                                            >
                                                              <FontAwesomeIcon
                                                                icon={
                                                                  isPaperExpanded
                                                                    ? faChevronDown
                                                                    : faChevronRight
                                                                }
                                                              />
                                                            </span>
                                                            <span
                                                              className={
                                                                styles.folderName
                                                              }
                                                            >
                                                              Paper{" "}
                                                              {paperNumber}
                                                            </span>
                                                            <span
                                                              className={
                                                                styles.folderCount
                                                              }
                                                            >
                                                              {
                                                                numberPapers.length
                                                              }
                                                            </span>
                                                          </div>

                                                          {isPaperExpanded && (
                                                            <div
                                                              className={
                                                                styles.folderContent
                                                              }
                                                            >
                                                              {numberPapers.map(
                                                                (paper) => (
                                                                  <div
                                                                    key={
                                                                      paper.id
                                                                    }
                                                                    className={
                                                                      styles.fileItem
                                                                    }
                                                                  >
                                                                    <div
                                                                      className={
                                                                        styles.fileInfo
                                                                      }
                                                                    >
                                                                      <span
                                                                        className={
                                                                          styles.fileIcon
                                                                        }
                                                                      >
                                                                        <FontAwesomeIcon
                                                                          icon={
                                                                            faFile
                                                                          }
                                                                        />
                                                                      </span>
                                                                      <span
                                                                        className={
                                                                          styles.fileName
                                                                        }
                                                                      >
                                                                        {paper.docType ===
                                                                        "MS"
                                                                          ? "Mark Scheme"
                                                                          : "Question Paper"}
                                                                      </span>
                                                                      <span
                                                                        className={
                                                                          styles.fileSize
                                                                        }
                                                                      >
                                                                        {formatFileSize(
                                                                          paper.size
                                                                        )}
                                                                      </span>
                                                                      <span
                                                                        className={
                                                                          styles.fileStats
                                                                        }
                                                                      >
                                                                        <span
                                                                          className={
                                                                            styles.fileStat
                                                                          }
                                                                        >
                                                                          <FontAwesomeIcon
                                                                            icon={
                                                                              faEye
                                                                            }
                                                                            className={
                                                                              styles.fileStatIcon
                                                                            }
                                                                          />
                                                                          {
                                                                            paper.views
                                                                          }
                                                                        </span>
                                                                        <span
                                                                          className={
                                                                            styles.fileStat
                                                                          }
                                                                        >
                                                                          <FontAwesomeIcon
                                                                            icon={
                                                                              faDownload
                                                                            }
                                                                            className={
                                                                              styles.fileStatIcon
                                                                            }
                                                                          />
                                                                          {
                                                                            paper.downloads
                                                                          }
                                                                        </span>
                                                                      </span>
                                                                    </div>
                                                                    <div
                                                                      className={
                                                                        styles.fileActions
                                                                      }
                                                                    >
                                                                      <button
                                                                        className={`${
                                                                          styles.bookmarkButton
                                                                        } ${
                                                                          paper.bookmarked
                                                                            ? styles.bookmarked
                                                                            : ""
                                                                        }`}
                                                                        onClick={(
                                                                          e
                                                                        ) => {
                                                                          e.stopPropagation();
                                                                          toggleBookmark(
                                                                            paper.id
                                                                          );
                                                                        }}
                                                                        aria-label={
                                                                          paper.bookmarked
                                                                            ? "Remove bookmark"
                                                                            : "Add bookmark"
                                                                        }
                                                                      >
                                                                        <FontAwesomeIcon
                                                                          icon={
                                                                            faBookmark
                                                                          }
                                                                        />
                                                                      </button>
                                                                      <button
                                                                        className={
                                                                          styles.fileViewButton
                                                                        }
                                                                        onClick={(
                                                                          e
                                                                        ) => {
                                                                          e.stopPropagation();
                                                                          viewPaper(
                                                                            paper
                                                                          );
                                                                        }}
                                                                        aria-label="View paper"
                                                                      >
                                                                        <FontAwesomeIcon
                                                                          icon={
                                                                            faEye
                                                                          }
                                                                        />
                                                                      </button>
                                                                      <button
                                                                        className={
                                                                          styles.fileDownloadButton
                                                                        }
                                                                        onClick={(
                                                                          e
                                                                        ) => {
                                                                          e.stopPropagation();
                                                                          downloadPaper(
                                                                            paper
                                                                          );
                                                                        }}
                                                                        aria-label="Download paper"
                                                                      >
                                                                        <FontAwesomeIcon
                                                                          icon={
                                                                            faFileDownload
                                                                          }
                                                                        />
                                                                      </button>
                                                                    </div>
                                                                  </div>
                                                                )
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    }
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function PastPapers() {
  const { listFiles, getFileUrl, isAuthenticated } = useAmplify();

  const [isLoading, setIsLoading] = useState(true);
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showSmartOnly, setShowSmartOnly] = useState(true);

  // Filter states
  const [activeSubject, setActiveSubject] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [activeExamBoard, setActiveExamBoard] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [activePaperNumber, setActivePaperNumber] = useState("all");
  const [activeDocType, setActiveDocType] = useState("all"); // MS or QP (Mark Scheme or Question Paper)

  // Unique values for filters
  const [subjects, setSubjects] = useState(["all"]);
  const [levels, setLevels] = useState(["all"]);
  const [examBoards, setExamBoards] = useState(["all"]);
  const [years, setYears] = useState(["all"]);
  const [paperNumbers, setPaperNumbers] = useState(["all"]);
  const [docTypes, setDocTypes] = useState(["all"]);

  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading(true);
      try {
        const files = await listFiles("past-papers/");

        // Initialize expanded folders
        const initialExpandedFolders = {};
        files.forEach((file) => {
          const pathParts = file.path.split("/");
          if (pathParts.length > 1) {
            // Auto-expand the first level of folders
            initialExpandedFolders[pathParts[1]] = true;
          }
        });
        setExpandedFolders(initialExpandedFolders);

        // Filter out directories and only keep PDF files
        const pdfFiles = files.filter((file) => file.path.endsWith(".pdf"));

        // Parse files into structured paper objects
        const parsedPapers = pdfFiles
          .map((file) => {
            const pathParts = file.path.split("/");
            const filename = pathParts[pathParts.length - 1];

            // Extract docType from filename
            const docType = filename.includes("_MS.pdf") ? "MS" : "QP";

            // Extract metadata from the path
            const subject = pathParts[1];
            const level = pathParts[2];
            const examBoard = pathParts[3];
            const yearSession = pathParts[4]; // This might be "2018", "2019", "2022-June", "Specimen", etc.

            // Parse year and session from the yearSession
            let year, session;
            if (yearSession === "Specimen") {
              year = "Specimen";
              session = "";
            } else if (yearSession.includes("-")) {
              [year, session] = yearSession.split("-");
            } else {
              year = yearSession;
              session = "";
            }

            // Extract paper number from the path
            const paperPart = pathParts[5]; // This is like "Paper-1", "Paper-2", etc.
            const paperNumber = paperPart ? paperPart.split("-")[1] : "";

            // Generate a unique ID
            const id = file.path;

            // Create structured paper object
            return {
              id,
              path: file.path,
              subject,
              level,
              examBoard,
              year,
              session,
              paperNumber,
              docType,
              size: file.size,
              filename: filename,
              // Add realistic data for views, downloads, duration, marks, difficulty
              views: Math.floor(Math.random() * 1000) + 100,
              downloads: Math.floor(Math.random() * 500) + 50,
              duration: level.includes("GCSE") ? "1h 30m" : "2h",
              marks: level.includes("GCSE") ? 80 : 100,
              difficulty: ["Easy", "Medium", "Hard"][
                Math.floor(Math.random() * 3)
              ],
              bookmarked: false,
            };
          })
          .filter((paper) => paper.paperNumber); // Filter out invalid entries

        setPapers(parsedPapers);

        // Extract unique values for filters
        const subjects = [
          "all",
          ...new Set(parsedPapers.map((paper) => paper.subject)),
        ];
        const levels = [
          "all",
          ...new Set(parsedPapers.map((paper) => paper.level)),
        ];
        const examBoards = [
          "all",
          ...new Set(parsedPapers.map((paper) => paper.examBoard)),
        ];
        const years = [
          "all",
          ...new Set(parsedPapers.map((paper) => paper.year)),
        ];
        const paperNumbers = [
          "all",
          ...new Set(parsedPapers.map((paper) => paper.paperNumber)),
        ];
        const docTypes = [
          "all",
          ...new Set(parsedPapers.map((paper) => paper.docType)),
        ];

        setSubjects(subjects);
        setLevels(levels);
        setExamBoards(examBoards);
        setYears(years);
        setPaperNumbers(paperNumbers);
        setDocTypes(docTypes);
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPapers();
    }
  }, [isAuthenticated, listFiles]);

  // Filter papers based on search term and selected filters
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        paper.subject.toLowerCase().includes(searchLower) ||
        paper.level.toLowerCase().includes(searchLower) ||
        paper.examBoard.toLowerCase().includes(searchLower) ||
        paper.year.toLowerCase().includes(searchLower) ||
        paper.paperNumber.toLowerCase().includes(searchLower) ||
        (paper.session && paper.session.toLowerCase().includes(searchLower)) ||
        paper.docType.toLowerCase().includes(searchLower);

      // Check if paper matches all selected filters
      const matchesSubject =
        activeSubject === "all" || paper.subject === activeSubject;
      const matchesLevel = activeLevel === "all" || paper.level === activeLevel;
      const matchesExamBoard =
        activeExamBoard === "all" || paper.examBoard === activeExamBoard;
      const matchesYear = activeYear === "all" || paper.year === activeYear;
      const matchesPaperNumber =
        activePaperNumber === "all" || paper.paperNumber === activePaperNumber;
      const matchesDocType =
        activeDocType === "all" || paper.docType === activeDocType;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLevel &&
        matchesExamBoard &&
        matchesYear &&
        matchesPaperNumber &&
        matchesDocType
      );
    });
  }, [
    papers,
    searchTerm,
    activeSubject,
    activeLevel,
    activeExamBoard,
    activeYear,
    activePaperNumber,
    activeDocType,
  ]);

  // Toggle bookmark state
  const toggleBookmark = (paperId) => {
    setPapers((prevPapers) =>
      prevPapers.map((paper) =>
        paper.id === paperId
          ? { ...paper, bookmarked: !paper.bookmarked }
          : paper
      )
    );
  };

  // View paper function
  const viewPaper = async (paper) => {
    try {
      const url = await getFileUrl(paper.path);
      window.open(url, "_blank");

      // Update view count
      setPapers((prevPapers) =>
        prevPapers.map((p) =>
          p.id === paper.id ? { ...p, views: p.views + 1 } : p
        )
      );
    } catch (error) {
      console.error(`Error opening file: ${paper.path}`, error);
    }
  };

  // Download paper function
  const downloadPaper = async (paper) => {
    try {
      const url = await getFileUrl(paper.path);

      // Create an anchor and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = paper.path.split("/").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Update download count
      setPapers((prevPapers) =>
        prevPapers.map((p) =>
          p.id === paper.id ? { ...p, downloads: p.downloads + 1 } : p
        )
      );
    } catch (error) {
      console.error(`Error downloading file: ${paper.path}`, error);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Helper function to get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return styles.difficultyEasy;
      case "medium":
        return styles.difficultyMedium;
      case "hard":
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
        <div className={styles.topControls}>
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

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewToggleButton} ${
                viewMode === "list" ? styles.activeView : ""
              }`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
            <button
              className={`${styles.viewToggleButton} ${
                viewMode === "grid" ? styles.activeView : ""
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button
              className={`${styles.viewToggleButton} ${
                viewMode === "smart" ? styles.activeView : ""
              } ${styles.premiumButton}`}
              onClick={() => setViewMode("smart")}
              title="Smart Papers"
            >
              <FontAwesomeIcon icon={faBrain} />
            </button>
          </div>
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
                  {subject === "all"
                    ? "All Subjects"
                    : subject.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterContainer}>
            <label className={styles.filterLabel}>Level:</label>
            <select
              className={styles.filterSelect}
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value)}
            >
              {levels.map((level, index) => (
                <option key={index} value={level}>
                  {level === "all" ? "All Levels" : level.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterContainer}>
            <label className={styles.filterLabel}>Exam Board:</label>
            <select
              className={styles.filterSelect}
              value={activeExamBoard}
              onChange={(e) => setActiveExamBoard(e.target.value)}
            >
              {examBoards.map((board, index) => (
                <option key={index} value={board}>
                  {board === "all" ? "All Exam Boards" : board}
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

          <div className={styles.filterContainer}>
            <label className={styles.filterLabel}>Paper:</label>
            <select
              className={styles.filterSelect}
              value={activePaperNumber}
              onChange={(e) => setActivePaperNumber(e.target.value)}
            >
              {paperNumbers.map((number, index) => (
                <option key={index} value={number}>
                  {number === "all" ? "All Papers" : `Paper ${number}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterContainer}>
            <label className={styles.filterLabel}>Type:</label>
            <select
              className={styles.filterSelect}
              value={activeDocType}
              onChange={(e) => setActiveDocType(e.target.value)}
            >
              {docTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type === "all"
                    ? "All Types"
                    : type === "MS"
                    ? "Mark Scheme"
                    : type === "QP"
                    ? "Question Paper"
                    : type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterContainer}>
            <div className={styles.smartFilter}>
              <label className={styles.switchLabel}>
                <span>Smart Papers</span>
                <div className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={showSmartOnly}
                    onChange={() => setShowSmartOnly(!showSmartOnly)}
                  />
                  <span className={styles.slider}></span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading past papers..." />
        ) : filteredPapers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <h3>No past papers found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className={styles.papersGrid}>
            {filteredPapers.map((paper) => (
              <div key={paper.id} className={styles.paperCard}>
                <div className={styles.paperHeader}>
                  <div className={styles.paperYear}>
                    {paper.year} • {paper.examBoard}{" "}
                    {paper.session && `• ${paper.session}`}
                  </div>
                  <button
                    className={`${styles.bookmarkButton} ${
                      paper.bookmarked ? styles.bookmarked : ""
                    }`}
                    onClick={() => toggleBookmark(paper.id)}
                    aria-label={
                      paper.bookmarked ? "Remove bookmark" : "Add bookmark"
                    }
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                  </button>
                </div>

                <div className={styles.paperInfo}>
                  <div className={styles.paperTypeLabel}>
                    {paper.docType === "MS" ? "Mark Scheme" : "Question Paper"}
                  </div>
                  <h3 className={styles.paperTitle}>
                    {paper.subject.replace(/-/g, " ")} •{" "}
                    {paper.level.replace(/_/g, " ")} • Paper {paper.paperNumber}
                  </h3>

                  <div className={styles.paperDetailRow}>
                    <div className={styles.paperDetail}>
                      <FontAwesomeIcon
                        icon={faClock}
                        className={styles.detailIcon}
                      />
                      <span>{paper.duration}</span>
                    </div>
                    <div className={styles.paperDetail}>
                      <span className={styles.marks}>{paper.marks} marks</span>
                    </div>
                    <div className={styles.paperDetail}>
                      <span>{formatFileSize(paper.size)}</span>
                    </div>
                  </div>

                  <div className={styles.paperStats}>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faEye}
                        className={styles.statIcon}
                      />
                      <span>{paper.views.toLocaleString()}</span>
                    </div>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faDownload}
                        className={styles.statIcon}
                      />
                      <span>{paper.downloads.toLocaleString()}</span>
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
                  {paper.hasSmartVersion && (
                    <button
                      className={styles.smartButton}
                      onClick={() => openSmartPaper(paper)}
                    >
                      <FontAwesomeIcon icon={faBrain} />
                    </button>
                  )}
                  <button
                    className={styles.viewButton}
                    onClick={() => viewPaper(paper)}
                    aria-label="View paper"
                  >
                    View Paper
                  </button>
                  <button
                    className={styles.downloadButton}
                    onClick={() => downloadPaper(paper)}
                    aria-label="Download paper"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View (Hierarchical)
          <div className={styles.listView}>
            <HierarchicalListView
              papers={filteredPapers}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
              viewPaper={viewPaper}
              downloadPaper={downloadPaper}
              formatFileSize={formatFileSize}
              toggleBookmark={toggleBookmark}
            />
          </div>
        )}
      </div>
    </div>
  );
}
