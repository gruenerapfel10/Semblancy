"use client";
import { useState, useEffect } from "react";
import styles from "./flashcards.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBookOpen,
  faPlus,
  faPlay,
  faEdit,
  faEllipsisH,
  faSyncAlt,
  faClock,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Flashcards() {
  const [isLoading, setIsLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate loading flashcards data
  useEffect(() => {
    const timer = setTimeout(() => {
      const flashcardData = [
        {
          id: 1,
          title: "Mathematics: Calculus Concepts",
          description: "Key calculus formulas and theorems",
          totalCards: 48,
          masteredCards: 32,
          lastPracticed: "2025-03-14T10:30:00",
          subject: "Mathematics",
          color: "#4285F4", // Blue
        },
        {
          id: 2,
          title: "Physics: Mechanics",
          description: "Formulas and concepts for mechanics problems",
          totalCards: 36,
          masteredCards: 28,
          lastPracticed: "2025-03-10T15:45:00",
          subject: "Physics",
          color: "#EA4335", // Red
        },
        {
          id: 3,
          title: "Chemistry: Periodic Table",
          description: "Elements and their properties",
          totalCards: 54,
          masteredCards: 35,
          lastPracticed: "2025-03-12T09:15:00",
          subject: "Chemistry",
          color: "#34A853", // Green
        },
        {
          id: 4,
          title: "Biology: Human Anatomy",
          description: "Systems of the human body",
          totalCards: 42,
          masteredCards: 22,
          lastPracticed: "2025-03-08T14:20:00",
          subject: "Biology",
          color: "#FBBC05", // Yellow
        },
        {
          id: 5,
          title: "English: Literary Terms",
          description: "Important literary devices and terminology",
          totalCards: 30,
          masteredCards: 24,
          lastPracticed: "2025-03-15T11:30:00",
          subject: "English",
          color: "#8E44AD", // Purple
        },
        {
          id: 6,
          title: "Computer Science: Algorithms",
          description: "Common algorithms and their properties",
          totalCards: 38,
          masteredCards: 26,
          lastPracticed: "2025-03-13T16:45:00",
          subject: "Computer Science",
          color: "#E67E22", // Orange
        },
      ];

      setDecks(flashcardData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter decks based on search term
  const filteredDecks = decks.filter(
    (deck) =>
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatLastPracticed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Flashcards</h1>
          <button className={styles.createButton}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Deck</span>
          </button>
        </div>
        <p className={styles.subtitle}>
          Master concepts with spaced repetition flashcards
        </p>
      </div>

      <div className={styles.searchBar}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search flashcards..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading flashcards..." />
        ) : (
          <div className={styles.decksGrid}>
            {filteredDecks.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <FontAwesomeIcon icon={faBookOpen} />
                </div>
                <h3>No flashcard decks found</h3>
                <p>Create your first deck or adjust your search.</p>
                <button className={styles.createDeckButton}>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create New Deck</span>
                </button>
              </div>
            ) : (
              filteredDecks.map((deck) => (
                <div
                  key={deck.id}
                  className={styles.deckCard}
                  style={{
                    borderTop: `4px solid ${deck.color}`,
                  }}
                >
                  <div className={styles.deckActions}>
                    <button className={styles.actionButton}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className={styles.actionButton}>
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </button>
                  </div>

                  <div className={styles.deckInfo}>
                    <h3 className={styles.deckTitle}>{deck.title}</h3>
                    <div className={styles.deckSubject}>{deck.subject}</div>
                    <p className={styles.deckDescription}>{deck.description}</p>
                  </div>

                  <div className={styles.deckStats}>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faLayerGroup}
                        className={styles.statIcon}
                      />
                      <div className={styles.statText}>
                        <span className={styles.statValue}>
                          {deck.totalCards}
                        </span>
                        <span className={styles.statLabel}>cards</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.masteryCircle}>
                        <svg viewBox="0 0 36 36">
                          <path
                            className={styles.masteryCircleBg}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={styles.masteryCircleFill}
                            strokeDasharray={`${
                              (deck.masteredCards / deck.totalCards) * 100
                            }, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <text
                            x="18"
                            y="20.35"
                            className={styles.masteryPercent}
                          >
                            {Math.round(
                              (deck.masteredCards / deck.totalCards) * 100
                            )}
                            %
                          </text>
                        </svg>
                      </div>
                      <span className={styles.masteryLabel}>Mastery</span>
                    </div>

                    <div className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faClock}
                        className={styles.statIcon}
                      />
                      <div className={styles.statText}>
                        <span className={styles.timeValue}>
                          {formatLastPracticed(deck.lastPracticed)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.deckButtons}>
                    <button className={styles.studyButton}>
                      <FontAwesomeIcon icon={faPlay} />
                      <span>Study</span>
                    </button>
                    <button className={styles.resetButton}>
                      <FontAwesomeIcon icon={faSyncAlt} />
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
