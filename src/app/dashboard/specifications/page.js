"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./specifications.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faFileContract,
  faDownload,
  faInfoCircle,
  faTag,
  faLevelUpAlt,
  faTable,
  faList,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import mathSpecifications from "../../../assets/Mathematics_Spec.json";
import LoadingSpinner from "@/components/LoadingSpinner";

// Constants to avoid re-creation on each render
const PAGE_SIZE = 30; // Number of items per page

export default function Specifications() {
  const [isLoading, setIsLoading] = useState(true);
  const [specPoints, setSpecPoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBoard, setActiveBoard] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [uniqueBoards, setUniqueBoards] = useState([]);
  const [uniqueLevels, setUniqueLevels] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null); // Only allow one expanded row at a time
  const [currentPage, setCurrentPage] = useState(1);
  
  // Load data only once
  useEffect(() => {
    // Use a small timeout to prevent blocking the main thread
    const timer = setTimeout(() => {
      processSpecificationData(mathSpecifications);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Process the specification data
  const processSpecificationData = useCallback((data) => {
    setSpecPoints(data);
    
    // Extract unique exam boards and levels from tags
    const boards = new Set();
    const levels = new Set();
    
    data.forEach(point => {
      if (point.tags && point.tags.length > 0) {
        point.tags.forEach(tag => {
          const [board, level] = tag.split('_');
          boards.add(board);
          levels.add(level);
        });
      }
    });
    
    setUniqueBoards(['all', ...Array.from(boards).sort()]);
    setUniqueLevels(['all', ...Array.from(levels).sort()]);
    setIsLoading(false);
  }, []);

  // Filter specifications using memoization to prevent recalculations
  const filteredSpecPoints = useMemo(() => {
    return specPoints.filter((point) => {
      const matchesSearch = searchTerm === "" ||
        point.point.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (point.guidance && point.guidance.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesBoard = activeBoard === "all" || 
        (point.tags && point.tags.some(tag => tag.startsWith(activeBoard + "_")));
      
      const matchesLevel = activeLevel === "all" || 
        (point.tags && point.tags.some(tag => tag.endsWith("_" + activeLevel)));

      return matchesSearch && matchesBoard && matchesLevel;
    });
  }, [specPoints, searchTerm, activeBoard, activeLevel]);

  // Paginate the filtered results
  const paginatedPoints = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredSpecPoints.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredSpecPoints, currentPage]);

  // Total number of pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredSpecPoints.length / PAGE_SIZE);
  }, [filteredSpecPoints]);

  // Get tags for a specification point that match the active filters
  const getMatchingTags = useCallback((tags) => {
    if (!tags) return [];
    
    if (activeBoard === "all" && activeLevel === "all") {
      return tags;
    }
    
    return tags.filter(tag => {
      const [board, level] = tag.split('_');
      const matchesBoard = activeBoard === "all" || board === activeBoard;
      const matchesLevel = activeLevel === "all" || level === activeLevel;
      return matchesBoard && matchesLevel;
    });
  }, [activeBoard, activeLevel]);

  // Format tag for display
  const formatTag = useCallback((tag) => {
    const [board, level] = tag.split('_');
    return `${board} ${level}`;
  }, []);

  // Toggle row expansion in list view (only allow one expanded row at a time)
  const toggleRowExpansion = useCallback((index) => {
    setExpandedRow(prevIndex => prevIndex === index ? null : index);
  }, []);

  // Handle search input with debounce
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mathematics Specifications</h1>
        <p className={styles.subtitle}>
          Browse specification points across different exam boards and qualification levels
        </p>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search specification points..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filterDropdowns}>
            <div className={styles.filterContainer}>
              <div className={styles.filterLabel}>
                <FontAwesomeIcon
                  icon={faFilter}
                  className={styles.filterIcon}
                />
                <span>Exam Board</span>
              </div>
              <select
                className={styles.filterSelect}
                value={activeBoard}
                onChange={(e) => {
                  setActiveBoard(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
              >
                {uniqueBoards.map((board) => (
                  <option key={board} value={board}>
                    {board === "all" ? "All Boards" : board}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterContainer}>
              <div className={styles.filterLabel}>
                <FontAwesomeIcon
                  icon={faLevelUpAlt}
                  className={styles.filterIcon}
                />
                <span>Level</span>
              </div>
              <select
                className={styles.filterSelect}
                value={activeLevel}
                onChange={(e) => {
                  setActiveLevel(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
              >
                {uniqueLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === "all" ? "All Levels" : level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                viewMode === "grid" ? styles.activeView : ""
              }`}
              aria-label="Grid view"
              onClick={() => setViewMode("grid")}
            >
              <FontAwesomeIcon icon={faTable} />
            </button>
            <button
              className={`${styles.viewButton} ${
                viewMode === "list" ? styles.activeView : ""
              }`}
              aria-label="List view"
              onClick={() => setViewMode("list")}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading specifications..." />
        ) : (
          <>
            <div className={styles.resultSummary}>
              <span>Found {filteredSpecPoints.length} of {specPoints.length} specification points</span>
              {filteredSpecPoints.length > PAGE_SIZE && (
                <span className={styles.pagination}>
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            
            {filteredSpecPoints.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <FontAwesomeIcon icon={faFileContract} />
                </div>
                <h3>No specification points found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            ) : viewMode === "grid" ? (
              <>
                <div className={styles.specificationsGrid}>
                  {paginatedPoints.map((point, index) => {
                    const matchingTags = getMatchingTags(point.tags);
                    const actualIndex = (currentPage - 1) * PAGE_SIZE + index;
                    
                    return (
                      <div key={actualIndex} className={styles.specCard}>
                        <div className={styles.cardContent}>
                          <div className={styles.specTags}>
                            {matchingTags.map((tag, tagIndex) => (
                              <span key={tagIndex} className={styles.tagBadge}>
                                {formatTag(tag)}
                              </span>
                            ))}
                          </div>

                          <h3 className={styles.specTitle}>{point.point}</h3>
                          
                          {point.guidance && (
                            <div className={styles.guidanceSection}>
                              <h4 className={styles.guidanceHeader}>
                                <FontAwesomeIcon icon={faInfoCircle} /> Guidance
                              </h4>
                              <p className={styles.guidanceText}>{point.guidance}</p>
                            </div>
                          )}
                        </div>

                        <div className={styles.specActions}>
                          <button className={styles.viewSpecButton}>
                            View Resources
                          </button>
                          <button className={styles.downloadButton}>
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className={styles.specificationsList}>
                  {paginatedPoints.map((point, index) => {
                    const matchingTags = getMatchingTags(point.tags);
                    const actualIndex = (currentPage - 1) * PAGE_SIZE + index;
                    const isExpanded = expandedRow === actualIndex;
                    
                    return (
                      <div 
                        key={actualIndex} 
                        className={styles.listItem}
                      >
                        <div 
                          className={styles.listItemHeader}
                          onClick={() => toggleRowExpansion(actualIndex)}
                        >
                          <div className={styles.specPoint}>
                            <FontAwesomeIcon 
                              icon={isExpanded ? faChevronDown : faChevronRight} 
                              className={styles.expandIcon}
                            />
                            <span>{point.point}</span>
                          </div>
                          <div className={styles.tagsList}>
                            {matchingTags.slice(0, 3).map((tag, tagIndex) => (
                              <span key={tagIndex} className={styles.tagBadge}>
                                {formatTag(tag)}
                              </span>
                            ))}
                            {matchingTags.length > 3 && (
                              <span className={styles.moreTags}>+{matchingTags.length - 3}</span>
                            )}
                          </div>
                          <div className={styles.listItemActions}>
                            <button className={styles.resourceButton}>
                              Resources
                            </button>
                            <button className={styles.downloadBadge}>
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className={styles.expandedContent}>
                            {point.guidance && (
                              <div className={styles.expandedGuidance}>
                                <h4><FontAwesomeIcon icon={faInfoCircle} /> Guidance</h4>
                                <p>{point.guidance}</p>
                              </div>
                            )}
                            {matchingTags.length > 3 && (
                              <div className={styles.expandedTags}>
                                <h4><FontAwesomeIcon icon={faTag} /> All Boards & Levels</h4>
                                <div className={styles.tagsExpanded}>
                                  {matchingTags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className={styles.tagBadge}>
                                      {formatTag(tag)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            {/* Pagination controls */}
            {filteredSpecPoints.length > PAGE_SIZE && (
              <div className={styles.paginationControls}>
                <button 
                  className={styles.pageButton}
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button 
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show 5 page numbers centered around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pageNumber} ${currentPage === pageNum ? styles.currentPage : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button 
                  className={styles.pageButton}
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}