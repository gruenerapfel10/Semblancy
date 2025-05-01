"use client";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faGraduationCap,
  faBook,
  faBookmark,
  faChevronDown,
  faChevronRight,
  faList,
  faGrip,
  faTimes,
  faDownload,
  faStar,
  faShare,
  faPrint,
  faCalendar,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./notes.module.css";

export default function Notes() {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("hierarchical");
  const [notesData, setNotesData] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    examBoards: [],
    levels: [],
    specs: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef(null);

  // Simulate loading notes data
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockNotesData = [
        {
          id: "sub-1",
          name: "Mathematics",
          icon: "📐",
          topics: [
            {
              id: "top-1-1",
              name: "Calculus",
              notes: [
                {
                  id: "note-1-1-1",
                  title: "Integration Techniques",
                  lastUpdated: "2025-03-15",
                  examBoards: [
                    {
                      name: "AQA",
                      content:
                        "Comprehensive guide to integration methods including substitution, parts, and partial fractions.",
                      specs: ["Pure Mathematics", "A Level", "Paper 1"],
                    },
                    {
                      name: "Edexcel",
                      content:
                        "Integration methods with a focus on definite integrals and applications.",
                      specs: ["Pure Mathematics", "A Level", "Paper 2"],
                    },
                  ],
                },
                {
                  id: "note-1-1-2",
                  title: "Differential Equations",
                  lastUpdated: "2025-03-10",
                  examBoards: [
                    {
                      name: "AQA",
                      content:
                        "First and second order differential equations with applications.",
                      specs: ["Pure Mathematics", "A Level", "Paper 2"],
                    },
                    {
                      name: "OCR",
                      content:
                        "Methods for solving differential equations including separation of variables.",
                      specs: ["Further Mathematics", "A Level", "Paper 3"],
                    },
                  ],
                },
              ],
            },
            {
              id: "top-1-2",
              name: "Statistics",
              notes: [
                {
                  id: "note-1-2-1",
                  title: "Probability Distributions",
                  lastUpdated: "2025-02-28",
                  examBoards: [
                    {
                      name: "Edexcel",
                      content:
                        "Normal, binomial, and Poisson distributions with real-world applications.",
                      specs: ["Statistics", "A Level", "Paper 3"],
                    },
                    {
                      name: "AQA",
                      content:
                        "Understanding probability distributions and their properties.",
                      specs: ["Statistics", "A Level", "Paper 3"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "sub-2",
          name: "Physics",
          icon: "⚛️",
          topics: [
            {
              id: "top-2-1",
              name: "Mechanics",
              notes: [
                {
                  id: "note-2-1-1",
                  title: "Newton's Laws of Motion",
                  lastUpdated: "2025-03-05",
                  examBoards: [
                    {
                      name: "AQA",
                      content:
                        "Detailed explanation of Newton's three laws with practical examples.",
                      specs: ["Mechanics", "A Level", "Paper 1"],
                    },
                    {
                      name: "OCR",
                      content:
                        "Applications of Newton's laws to complex mechanical systems.",
                      specs: ["Mechanics", "A Level", "Paper 1"],
                    },
                  ],
                },
              ],
            },
            {
              id: "top-2-2",
              name: "Waves",
              notes: [
                {
                  id: "note-2-2-1",
                  title: "Wave Properties and Behaviors",
                  lastUpdated: "2025-02-20",
                  examBoards: [
                    {
                      name: "Edexcel",
                      content:
                        "Wave equations, interference, diffraction, and standing waves.",
                      specs: ["Waves", "A Level", "Paper 2"],
                    },
                    {
                      name: "OCR",
                      content:
                        "Comprehensive notes on wave phenomena and mathematical representations.",
                      specs: ["Waves", "GCSE", "Paper 1"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "sub-3",
          name: "Chemistry",
          icon: "🧪",
          topics: [
            {
              id: "top-3-1",
              name: "Organic Chemistry",
              notes: [
                {
                  id: "note-3-1-1",
                  title: "Alkanes and Alkenes",
                  lastUpdated: "2025-03-12",
                  examBoards: [
                    {
                      name: "AQA",
                      content:
                        "Properties, reactions, and mechanisms of alkanes and alkenes.",
                      specs: ["Organic Chemistry", "A Level", "Paper 2"],
                    },
                    {
                      name: "Edexcel",
                      content:
                        "Functional groups and reaction mechanisms for hydrocarbons.",
                      specs: ["Organic Chemistry", "GCSE", "Paper 2"],
                    },
                  ],
                },
              ],
            },
            {
              id: "top-3-2",
              name: "Physical Chemistry",
              notes: [
                {
                  id: "note-3-2-1",
                  title: "Thermodynamics",
                  lastUpdated: "2025-02-15",
                  examBoards: [
                    {
                      name: "OCR",
                      content:
                        "Laws of thermodynamics and their applications in chemical reactions.",
                      specs: ["Physical Chemistry", "A Level", "Paper 1"],
                    },
                  ],
                },
                {
                  id: "note-3-2-2",
                  title: "Chemical Equilibrium",
                  lastUpdated: "2025-02-10",
                  examBoards: [
                    {
                      name: "AQA",
                      content:
                        "Dynamic equilibrium, Le Chatelier's principle, and equilibrium constants.",
                      specs: ["Physical Chemistry", "A Level", "Paper 1"],
                    },
                    {
                      name: "Edexcel",
                      content:
                        "Factors affecting equilibrium with practical applications.",
                      specs: ["Physical Chemistry", "AS Level", "Paper 1"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      // Initialize expanded state for all subjects
      const initialExpandedSubjects = {};
      mockNotesData.forEach((subject) => {
        initialExpandedSubjects[subject.id] = false;
      });

      setNotesData(mockNotesData);
      setFilteredNotes(mockNotesData);
      setExpandedSubjects(initialExpandedSubjects);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Filter notes based on search query and active filters
  useEffect(() => {
    if (notesData.length === 0) return;

    let filtered = [...notesData];

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .map((subject) => {
          const filteredTopics = subject.topics
            .map((topic) => {
              const filteredNotes = topic.notes.filter((note) => {
                const titleMatch = note.title.toLowerCase().includes(query);
                const examBoardMatch = note.examBoards.some(
                  (board) =>
                    board.name.toLowerCase().includes(query) ||
                    board.content.toLowerCase().includes(query) ||
                    board.specs.some((spec) =>
                      spec.toLowerCase().includes(query)
                    )
                );
                return titleMatch || examBoardMatch;
              });
              return filteredNotes.length > 0
                ? { ...topic, notes: filteredNotes }
                : null;
            })
            .filter(Boolean);

          return filteredTopics.length > 0
            ? { ...subject, topics: filteredTopics }
            : null;
        })
        .filter(Boolean);
    }

    // Apply filters
    if (
      activeFilters.examBoards.length > 0 ||
      activeFilters.levels.length > 0 ||
      activeFilters.specs.length > 0
    ) {
      filtered = filtered
        .map((subject) => {
          const filteredTopics = subject.topics
            .map((topic) => {
              const filteredNotes = topic.notes.filter((note) => {
                // Filter by exam board
                if (activeFilters.examBoards.length > 0) {
                  const hasMatchingBoard = note.examBoards.some((board) =>
                    activeFilters.examBoards.includes(board.name)
                  );
                  if (!hasMatchingBoard) return false;
                }

                // Filter by level (A Level, AS Level, GCSE)
                if (activeFilters.levels.length > 0) {
                  const hasMatchingLevel = note.examBoards.some((board) =>
                    board.specs.some((spec) =>
                      activeFilters.levels.some((level) => spec.includes(level))
                    )
                  );
                  if (!hasMatchingLevel) return false;
                }

                // Filter by specifications
                if (activeFilters.specs.length > 0) {
                  const hasMatchingSpec = note.examBoards.some((board) =>
                    board.specs.some((spec) =>
                      activeFilters.specs.some((filterSpec) =>
                        spec.includes(filterSpec)
                      )
                    )
                  );
                  if (!hasMatchingSpec) return false;
                }

                return true;
              });
              return filteredNotes.length > 0
                ? { ...topic, notes: filteredNotes }
                : null;
            })
            .filter(Boolean);

          return filteredTopics.length > 0
            ? { ...subject, topics: filteredTopics }
            : null;
        })
        .filter(Boolean);
    }

    setFilteredNotes(filtered);
  }, [searchQuery, activeFilters, notesData]);

  // Handlers
  const toggleSubject = (subjectId) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current.focus();
  };

  const toggleFilter = (filterType, value) => {
    setActiveFilters((prev) => {
      const currentFilters = [...prev[filterType]];
      const index = currentFilters.indexOf(value);

      if (index === -1) {
        // Add filter
        return { ...prev, [filterType]: [...currentFilters, value] };
      } else {
        // Remove filter
        currentFilters.splice(index, 1);
        return { ...prev, [filterType]: currentFilters };
      }
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      examBoards: [],
      levels: [],
      specs: [],
    });
  };

  const selectNote = (note) => {
    setActiveNote(note);
  };

  // Get all available exam boards, levels, and specs for filters
  const getAllExamBoards = () => {
    const boards = new Set();
    notesData.forEach((subject) => {
      subject.topics.forEach((topic) => {
        topic.notes.forEach((note) => {
          note.examBoards.forEach((board) => {
            boards.add(board.name);
          });
        });
      });
    });
    return Array.from(boards);
  };

  const getAllLevels = () => {
    const levels = new Set();
    notesData.forEach((subject) => {
      subject.topics.forEach((topic) => {
        topic.notes.forEach((note) => {
          note.examBoards.forEach((board) => {
            board.specs.forEach((spec) => {
              if (spec.includes("A Level")) levels.add("A Level");
              if (spec.includes("AS Level")) levels.add("AS Level");
              if (spec.includes("GCSE")) levels.add("GCSE");
            });
          });
        });
      });
    });
    return Array.from(levels);
  };

  const getAllSpecs = () => {
    const specs = new Set();
    notesData.forEach((subject) => {
      subject.topics.forEach((topic) => {
        topic.notes.forEach((note) => {
          note.examBoards.forEach((board) => {
            board.specs.forEach((spec) => {
              // Extract subject area, ignoring level and paper info
              const parts = spec.split(",");
              if (parts.length > 0) {
                specs.add(parts[0].trim());
              }
            });
          });
        });
      });
    });
    return Array.from(specs);
  };

  // Render functions
  const renderHierarchicalView = () => {
    if (filteredNotes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📚</div>
          <h3>No matching notes found</h3>
          <p>Try adjusting your search or filters</p>
          <button
            className={styles.resetButton}
            onClick={() => {
              setSearchQuery("");
              clearFilters();
            }}
          >
            Reset all filters
          </button>
        </div>
      );
    }

    return (
      <div className={styles.hierarchicalView}>
        {filteredNotes.map((subject) => (
          <div key={subject.id} className={styles.subjectContainer}>
            <div
              className={`${styles.subjectHeader} ${
                expandedSubjects[subject.id] ? styles.expanded : ""
              }`}
              onClick={() => toggleSubject(subject.id)}
            >
              <div className={styles.subjectInfo}>
                <span className={styles.subjectIcon}>{subject.icon}</span>
                <h3 className={styles.subjectName}>{subject.name}</h3>
              </div>
              <FontAwesomeIcon
                icon={
                  expandedSubjects[subject.id] ? faChevronDown : faChevronRight
                }
                className={styles.expandIcon}
              />
            </div>

            {expandedSubjects[subject.id] && (
              <div className={styles.topicsContainer}>
                {subject.topics.map((topic) => (
                  <div key={topic.id} className={styles.topicContainer}>
                    <div
                      className={`${styles.topicHeader} ${
                        expandedTopics[topic.id] ? styles.expanded : ""
                      }`}
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <h4 className={styles.topicName}>{topic.name}</h4>
                      <FontAwesomeIcon
                        icon={
                          expandedTopics[topic.id]
                            ? faChevronDown
                            : faChevronRight
                        }
                        className={styles.expandIcon}
                      />
                    </div>

                    {expandedTopics[topic.id] && (
                      <div className={styles.notesContainer}>
                        {topic.notes.map((note) => (
                          <div
                            key={note.id}
                            className={`${styles.noteItem} ${
                              activeNote?.id === note.id
                                ? styles.activeNote
                                : ""
                            }`}
                            onClick={() => selectNote(note)}
                          >
                            <div className={styles.noteInfo}>
                              <h5 className={styles.noteTitle}>{note.title}</h5>
                              <div className={styles.noteMetadata}>
                                <span className={styles.noteDate}>
                                  <FontAwesomeIcon icon={faCalendar} />
                                  {new Date(
                                    note.lastUpdated
                                  ).toLocaleDateString()}
                                </span>
                                <div className={styles.examBoardTags}>
                                  {note.examBoards.map((board) => (
                                    <span
                                      key={board.name}
                                      className={styles.examBoardTag}
                                    >
                                      {board.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGridView = () => {
    // Flatten the hierarchical structure for grid view
    const allNotes = [];
    filteredNotes.forEach((subject) => {
      subject.topics.forEach((topic) => {
        topic.notes.forEach((note) => {
          allNotes.push({
            ...note,
            subject: subject.name,
            subjectIcon: subject.icon,
            topic: topic.name,
          });
        });
      });
    });

    if (allNotes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📚</div>
          <h3>No matching notes found</h3>
          <p>Try adjusting your search or filters</p>
          <button
            className={styles.resetButton}
            onClick={() => {
              setSearchQuery("");
              clearFilters();
            }}
          >
            Reset all filters
          </button>
        </div>
      );
    }

    return (
      <div className={styles.gridView}>
        {allNotes.map((note) => (
          <div
            key={note.id}
            className={`${styles.noteCard} ${
              activeNote?.id === note.id ? styles.activeCard : ""
            }`}
            onClick={() => selectNote(note)}
          >
            <div className={styles.noteCardHeader}>
              <span className={styles.subjectIconSmall}>
                {note.subjectIcon}
              </span>
              <div className={styles.noteBreadcrumbs}>
                <span className={styles.noteBreadcrumbSubject}>
                  {note.subject}
                </span>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.noteBreadcrumbTopic}>{note.topic}</span>
              </div>
            </div>
            <h4 className={styles.noteCardTitle}>{note.title}</h4>
            <div className={styles.noteCardDate}>
              <FontAwesomeIcon icon={faCalendar} />
              <span>{new Date(note.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className={styles.noteCardBoardTags}>
              {note.examBoards.map((board) => (
                <span key={board.name} className={styles.noteCardBoardTag}>
                  {board.name}
                </span>
              ))}
            </div>
            <div className={styles.noteCardSpecs}>
              {note.examBoards.flatMap((board) =>
                board.specs.map((spec, index) => (
                  <span
                    key={`${board.name}-${index}`}
                    className={styles.noteCardSpecTag}
                  >
                    <FontAwesomeIcon icon={faTag} className={styles.specIcon} />
                    {spec}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNoteDetail = () => {
    if (!activeNote) return null;

    return (
      <div className={styles.noteDetailContainer}>
        <div className={styles.noteDetailHeader}>
          <h2 className={styles.noteDetailTitle}>{activeNote.title}</h2>
          <div className={styles.noteDetailActions}>
            <button className={styles.actionButton}>
              <FontAwesomeIcon icon={faDownload} />
              <span>Download</span>
            </button>
            <button className={styles.actionButton}>
              <FontAwesomeIcon icon={faPrint} />
              <span>Print</span>
            </button>
            <button className={styles.actionButton}>
              <FontAwesomeIcon icon={faShare} />
              <span>Share</span>
            </button>
            <button className={styles.actionButton}>
              <FontAwesomeIcon icon={faStar} />
              <span>Favorite</span>
            </button>
          </div>
        </div>

        <div className={styles.examBoardTabs}>
          {activeNote.examBoards.map((board) => (
            <div key={board.name} className={styles.examBoardTab}>
              <div className={styles.examBoardName}>{board.name}</div>
              <div className={styles.examBoardSpecs}>
                {board.specs.map((spec, index) => (
                  <span key={index} className={styles.specBadge}>
                    {spec}
                  </span>
                ))}
              </div>
              <div className={styles.examBoardContent}>
                <p>{board.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search notes..."
              value={searchQuery}
              onChange={handleSearchChange}
              ref={searchInputRef}
            />
            {searchQuery && (
              <button
                className={styles.clearSearchButton}
                onClick={clearSearch}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          <button
            className={`${styles.filterButton} ${
              showFilters ? styles.active : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filters</span>
            {(activeFilters.examBoards.length > 0 ||
              activeFilters.levels.length > 0 ||
              activeFilters.specs.length > 0) && (
              <span className={styles.filterCount}>
                {activeFilters.examBoards.length +
                  activeFilters.levels.length +
                  activeFilters.specs.length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterHeader}>
              <h3>Filters</h3>
              {(activeFilters.examBoards.length > 0 ||
                activeFilters.levels.length > 0 ||
                activeFilters.specs.length > 0) && (
                <button
                  className={styles.clearFiltersButton}
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              )}
            </div>

            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>
                <FontAwesomeIcon icon={faBook} className={styles.filterIcon} />
                Exam Board
              </h4>
              <div className={styles.filterOptions}>
                {getAllExamBoards().map((board) => (
                  <div key={board} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      id={`board-${board}`}
                      checked={activeFilters.examBoards.includes(board)}
                      onChange={() => toggleFilter("examBoards", board)}
                    />
                    <label htmlFor={`board-${board}`}>{board}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className={styles.filterIcon}
                />
                Level
              </h4>
              <div className={styles.filterOptions}>
                {getAllLevels().map((level) => (
                  <div key={level} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      id={`level-${level}`}
                      checked={activeFilters.levels.includes(level)}
                      onChange={() => toggleFilter("levels", level)}
                    />
                    <label htmlFor={`level-${level}`}>{level}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>
                <FontAwesomeIcon
                  icon={faBookmark}
                  className={styles.filterIcon}
                />
                Specification
              </h4>
              <div className={styles.filterOptions}>
                {getAllSpecs().map((spec) => (
                  <div key={spec} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      id={`spec-${spec}`}
                      checked={activeFilters.specs.includes(spec)}
                      onChange={() => toggleFilter("specs", spec)}
                    />
                    <label htmlFor={`spec-${spec}`}>{spec}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewToggleButton} ${
              viewMode === "hierarchical" ? styles.activeView : ""
            }`}
            onClick={() => setViewMode("hierarchical")}
          >
            <FontAwesomeIcon icon={faList} />
            <span>Hierarchical</span>
          </button>
          <button
            className={`${styles.viewToggleButton} ${
              viewMode === "grid" ? styles.activeView : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            <FontAwesomeIcon icon={faGrip} />
            <span>Grid</span>
          </button>
        </div>

        <div className={styles.notesListContainer}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading notes...</p>
            </div>
          ) : viewMode === "hierarchical" ? (
            renderHierarchicalView()
          ) : (
            renderGridView()
          )}
        </div>
      </div>

      <div className={styles.contentArea}>
        {activeNote ? (
          renderNoteDetail()
        ) : (
          <div className={styles.emptyNoteState}>
            <div className={styles.emptyNoteIcon}>📝</div>
            <h2>Select a note to view</h2>
            <p>Choose a note from the sidebar to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}
