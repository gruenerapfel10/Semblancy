"use client";
import { useState, useEffect } from "react";
import styles from "./notes.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faStickyNote,
  faEdit,
  faTrashAlt,
  faTags,
  faSort,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Notes() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc");

  // Simulate loading notes data
  useEffect(() => {
    const timer = setTimeout(() => {
      const notesData = [
        {
          id: 1,
          title: "Calculus Integration Methods",
          preview:
            "Methods for solving integration problems including substitution, by parts, and partial fractions...",
          content: "Full content would go here...",
          tags: ["Mathematics", "Calculus", "Important"],
          dateCreated: "2025-03-01T10:30:00",
          dateModified: "2025-03-15T14:22:00",
        },
        {
          id: 2,
          title: "Physics: Electromagnetic Induction",
          preview:
            "Faraday's law, Lenz's law, and applications of electromagnetic induction...",
          content: "Full content would go here...",
          tags: ["Physics", "Electromagnetism"],
          dateCreated: "2025-02-20T09:15:00",
          dateModified: "2025-03-10T11:45:00",
        },
        {
          id: 3,
          title: "Organic Chemistry Reactions",
          preview:
            "Summary of key organic chemistry reactions including addition, substitution and elimination...",
          content: "Full content would go here...",
          tags: ["Chemistry", "Organic", "Important"],
          dateCreated: "2025-03-05T16:40:00",
          dateModified: "2025-03-05T16:40:00",
        },
        {
          id: 4,
          title: "Shakespeare's Macbeth: Key Themes",
          preview:
            "Analysis of ambition, guilt, supernatural elements, and gender roles in Macbeth...",
          content: "Full content would go here...",
          tags: ["English", "Literature"],
          dateCreated: "2025-01-25T13:20:00",
          dateModified: "2025-03-08T09:30:00",
        },
        {
          id: 5,
          title: "Biology: Homeostasis Mechanisms",
          preview:
            "Detailed notes on temperature regulation, osmoregulation, and blood glucose control...",
          content: "Full content would go here...",
          tags: ["Biology", "Physiology"],
          dateCreated: "2025-02-15T11:10:00",
          dateModified: "2025-02-28T15:50:00",
        },
        {
          id: 6,
          title: "Computer Science: Sorting Algorithms",
          preview:
            "Comparison of bubble sort, merge sort, quick sort, and their time complexities...",
          content: "Full content would go here...",
          tags: ["Computer Science", "Algorithms", "Important"],
          dateCreated: "2025-03-12T08:45:00",
          dateModified: "2025-03-14T10:15:00",
        },
      ];

      setNotes(notesData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Get all unique tags from notes
  const allTags = ["all", ...new Set(notes.flatMap((note) => note.tags))];

  // Filter notes based on search term and active tag
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.preview.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = activeTag === "all" || note.tags.includes(activeTag);

    return matchesSearch && matchesTag;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case "titleAsc":
        return a.title.localeCompare(b.title);
      case "titleDesc":
        return b.title.localeCompare(a.title);
      case "dateAsc":
        return new Date(a.dateModified) - new Date(b.dateModified);
      case "dateDesc":
      default:
        return new Date(b.dateModified) - new Date(a.dateModified);
    }
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Notes</h1>
          <button className={styles.createButton}>
            <FontAwesomeIcon icon={faPlus} />
            <span>New Note</span>
          </button>
        </div>
        <p className={styles.subtitle}>
          Create, organize and review your study notes
        </p>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search notes..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.tagFilter}>
            <div className={styles.filterLabel}>
              <FontAwesomeIcon icon={faTags} />
              <span>Tags:</span>
            </div>
            <select
              className={styles.filterSelect}
              value={activeTag}
              onChange={(e) => setActiveTag(e.target.value)}
            >
              {allTags.map((tag, index) => (
                <option key={index} value={tag}>
                  {tag === "all" ? "All Tags" : tag}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.sortControls}>
            <div className={styles.filterLabel}>
              <FontAwesomeIcon icon={faSort} />
              <span>Sort by:</span>
            </div>
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dateDesc">Date (Newest)</option>
              <option value="dateAsc">Date (Oldest)</option>
              <option value="titleAsc">Title (A-Z)</option>
              <option value="titleDesc">Title (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading notes..." />
        ) : (
          <div className={styles.notesGrid}>
            {sortedNotes.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <FontAwesomeIcon icon={faStickyNote} />
                </div>
                <h3>No notes found</h3>
                <p>Create your first note or adjust your search criteria.</p>
                <button className={styles.createNoteButton}>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create New Note</span>
                </button>
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div key={note.id} className={styles.noteCard}>
                  <div className={styles.noteActions}>
                    <button className={styles.actionButton}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className={styles.actionButton}>
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </button>
                  </div>

                  <div className={styles.noteContent}>
                    <h3 className={styles.noteTitle}>{note.title}</h3>
                    <div className={styles.notePreview}>{note.preview}</div>

                    <div className={styles.noteTags}>
                      {note.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={styles.tagBadge}
                          onClick={() => setActiveTag(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.noteFooter}>
                    <div className={styles.noteDate}>
                      Updated: {formatDate(note.dateModified)}
                    </div>
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
