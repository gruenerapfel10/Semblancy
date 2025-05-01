"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "./flashcards.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBookOpen,
  faPlus,
  faPlay,
  faEdit,
  faChartLine,
  faTimes,
  faArrowLeft,
  faFilter,
  faSort,
  faLayerGroup,
  faGraduationCap,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";
import InteractiveStudy from '@/components/Flashcards/InteractiveStudy';
import LearningHeader from '@/components/Flashcards/LearningHeader';

export default function Flashcards() {
  // Main state
  const [isLoading, setIsLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [sortOption, setSortOption] = useState("lastPracticed");
  const [showFilters, setShowFilters] = useState(false);
  
  // View states
  const [view, setView] = useState("decks"); // decks, study, analytics
  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentDeckStats, setCurrentDeckStats] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [newDeck, setNewDeck] = useState({
    title: "",
    description: "",
    subject: "",
    cards: [],
  });
  
  const [newCard, setNewCard] = useState({
    question: "",
    answer: "",
    hint: "",
  });
  
  // Study history for analytics
  const [studyHistory, setStudyHistory] = useState([]);

  // Mock data initialization - in a real app, this would come from an API
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sample flashcard decks
      const flashcardData = [
        {
          id: 1,
          title: "Mathematics: Calculus Concepts",
          description: "Key calculus formulas and theorems",
          totalCards: 48,
          masteredCards: 32,
          lastPracticed: "2025-03-14T10:30:00",
          subject: "Mathematics",
          color: "#4285F4",
          cards: [
            {
              id: 1,
              question: "What is the derivative of x²?",
              answer: "2x",
              hint: "Use the power rule: d/dx(x^n) = nx^(n-1)",
              explanation: "The power rule states that for any power n, the derivative of x^n is nx^(n-1). For x², n=2, so the derivative is 2x^(2-1) = 2x.",
              difficulty: 3,
              srs: {
                interval: 6,
                ease: 2.5,
                consecutiveCorrect: 2,
                lastReview: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                reviews: 4,
              },
            },
            {
              id: 2,
              question: "What is the integral of 2x?",
              answer: "x² + C",
              hint: "Use the power rule for integration",
              explanation: "The power rule for integration states that ∫x^n dx = x^(n+1)/(n+1) + C. For 2x, we have 2∫x dx = 2[x^(1+1)/(1+1)] + C = 2[x²/2] + C = x² + C.",
              difficulty: 3,
              srs: {
                interval: 4,
                ease: 2.2,
                consecutiveCorrect: 1,
                lastReview: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                reviews: 3,
              },
            },
            {
              id: 3,
              question: "What is the chain rule in calculus?",
              answer: "If y = f(g(x)), then dy/dx = (df/dg) × (dg/dx)",
              hint: "Think about differentiating a composite function",
              explanation: "The chain rule allows us to find the derivative of composite functions. If y = f(g(x)), then dy/dx = (df/dg) × (dg/dx).",
              difficulty: 6,
              srs: {
                interval: 1,
                ease: 2.5,
                consecutiveCorrect: 0,
                lastReview: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                nextReview: new Date().toISOString(),
                reviews: 2,
              },
            },
            {
              id: 4,
              question: "What is the product rule for derivatives?",
              answer: "If y = f(x) × g(x), then dy/dx = f'(x) × g(x) + f(x) × g'(x)",
              hint: "The derivative of a product is not the product of the derivatives",
              explanation: "The product rule states that the derivative of a product of two functions is the first function times the derivative of the second, plus the second function times the derivative of the first.",
              difficulty: 5,
              srs: {
                interval: 2,
                ease: 2.1,
                consecutiveCorrect: 1,
                lastReview: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                reviews: 3,
              },
            },
          ],
        },
        {
          id: 2,
          title: "Physics: Mechanics",
          description: "Formulas and concepts for mechanics problems",
          totalCards: 36,
          masteredCards: 28,
          lastPracticed: "2025-03-10T15:45:00",
          subject: "Physics",
          color: "#EA4335",
          cards: [
            {
              id: 1,
              question: "What is Newton's Second Law?",
              answer: "F = ma (Force equals mass times acceleration)",
              hint: "It relates force, mass, and acceleration",
              explanation: "Newton's Second Law states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.",
              difficulty: 2,
              srs: {
                interval: 8,
                ease: 2.7,
                consecutiveCorrect: 3,
                lastReview: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                reviews: 5,
              },
            },
            {
              id: 2,
              question: "What is the kinetic energy formula?",
              answer: "KE = ½mv² (Kinetic Energy equals one-half mass times velocity squared)",
              hint: "It's proportional to mass and velocity squared",
              explanation: "Kinetic energy is the energy an object possesses due to its motion. The formula KE = ½mv² shows that it depends on both mass and the square of velocity.",
              difficulty: 4,
              srs: {
                interval: 3,
                ease: 2.3,
                consecutiveCorrect: 1,
                lastReview: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                reviews: 4,
              },
            },
          ],
        },
      ];

      // Generate mock study history for analytics
      const mockStudyHistory = [
        {
          deckId: 1,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          cardsStudied: 10,
          correctAnswers: 6,
          studyTimeSeconds: 450,
          reviewedCards: [],
        },
        {
          deckId: 1,
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          cardsStudied: 15,
          correctAnswers: 11,
          studyTimeSeconds: 600,
          reviewedCards: [],
        },
        {
          deckId: 1,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          cardsStudied: 25,
          correctAnswers: 21,
          studyTimeSeconds: 840,
          reviewedCards: [],
        },
        {
          deckId: 2,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          cardsStudied: 8,
          correctAnswers: 5,
          studyTimeSeconds: 360,
          reviewedCards: [],
        },
        {
          deckId: 2,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          cardsStudied: 12,
          correctAnswers: 9,
          studyTimeSeconds: 480,
          reviewedCards: [],
        },
      ];

      setDecks(flashcardData);
      setStudyHistory(mockStudyHistory);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Handle creating a new deck
  const handleCreateDeck = () => {
    const newDeckWithId = {
      ...newDeck,
      id: decks.length + 1,
      totalCards: newDeck.cards.length,
      masteredCards: 0,
      lastPracticed: new Date().toISOString(),
      color: getRandomColor(),
    };
    setDecks([...decks, newDeckWithId]);
    setNewDeck({
      title: "",
      description: "",
      subject: "",
      cards: [],
    });
    setShowCreateModal(false);
  };

  // Handle adding a card to a deck
  const handleAddCard = () => {
    if (newCard.question && newCard.answer) {
      setNewDeck({
        ...newDeck,
        cards: [
          ...newDeck.cards,
          { 
            ...newCard, 
            id: newDeck.cards.length + 1, 
            difficulty: 5, // Default difficulty
            srs: {
              interval: 1,
              ease: 2.5,
              consecutiveCorrect: 0,
              lastReview: new Date().toISOString(),
              nextReview: new Date().toISOString(),
              reviews: 0,
            }
          },
        ],
      });
      setNewCard({ question: "", answer: "", hint: "" });
    }
  };

  // Start study mode for a deck
  const handleStartStudy = (deck) => {
    setCurrentDeck(deck);
    setView("study");
  };

  // View analytics for a deck
  const handleViewAnalytics = (deck) => {
    // Calculate stats for the deck
    const mastery = {
      overall: Math.round((deck.masteredCards / deck.totalCards) * 100),
      byDifficulty: {
        easy: deck.cards ? deck.cards.filter(c => c.difficulty <= 3).length : 0,
        medium: deck.cards ? deck.cards.filter(c => c.difficulty > 3 && c.difficulty <= 6).length : 0,
        hard: deck.cards ? deck.cards.filter(c => c.difficulty > 6).length : 0
      }
    };
    
    // Get deck history
    const deckHistory = studyHistory.filter(session => session.deckId === deck.id);
    
    // Set current deck stats
    setCurrentDeckStats({
      mastery,
      history: deckHistory,
    });
    
    setCurrentDeck(deck);
    setView("analytics");
  };

  // Save a study session
  const handleSaveSession = (sessionData) => {
    setStudyHistory([...studyHistory, sessionData]);
  };

  // Random color generator for new decks
  const getRandomColor = () => {
    const colors = ["#4285F4", "#EA4335", "#34A853", "#FBBC05", "#8E44AD", "#E67E22"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Filter and sort decks
  const getFilteredDecks = useCallback(() => {
    return decks
      .filter(deck => 
        deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(deck => 
        filterSubject ? deck.subject === filterSubject : true
      )
      .sort((a, b) => {
        switch (sortOption) {
          case "title":
            return a.title.localeCompare(b.title);
          case "lastPracticed":
            return new Date(b.lastPracticed) - new Date(a.lastPracticed);
          case "mastery":
            const aMastery = a.masteredCards / a.totalCards;
            const bMastery = b.masteredCards / b.totalCards;
            return bMastery - aMastery;
          case "dueCards":
            const now = new Date();
            const aDueCards = a.cards ? a.cards.filter(card => 
              card.srs && new Date(card.srs.nextReview) <= now
            ).length : 0;
            const bDueCards = b.cards ? b.cards.filter(card => 
              card.srs && new Date(card.srs.nextReview) <= now
            ).length : 0;
            return bDueCards - aDueCards;
          default:
            return 0;
        }
      });
  }, [decks, searchTerm, filterSubject, sortOption]);
  
  // Get list of unique subjects for filtering
  const subjects = [...new Set(decks.map(deck => deck.subject))].filter(Boolean);
  
  // Get filtered decks
  const filteredDecks = getFilteredDecks();

  // Render different views
  if (view === "study" && currentDeck) {
    return (
      <InteractiveStudy 
        deck={currentDeck}
        onBack={() => setView("decks")}
        onComplete={handleSaveSession}
      />
    );
  }
  
  if (view === "analytics" && currentDeck && currentDeckStats) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <button 
              className={styles.backButton}
              onClick={() => setView("decks")}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Decks</span>
            </button>
          </div>
          <h1 className={styles.title}>{currentDeck.title} Analytics</h1>
        </div>
        
        <LearningHeader 
          deck={currentDeck}
          studyHistory={studyHistory.filter(session => session.deckId === currentDeck.id)}
        />
      </div>
    );
  }

  // Main decks view
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Deck
          </button>
        </div>
        <h1 className={styles.title}>Flashcards</h1>
        <p className={styles.subtitle}>Master concepts with spaced repetition flashcards</p>
      </header>

      {/* User Progression Header */}
      <div className={styles.progressHeader}>
        <h2 className={styles.progressTitle}>Your Learning Progress</h2>
        <div className={styles.progressStats}>
          <div className={styles.progressStat}>
            <div className={styles.statCircle}>
              {isLoading ? "-" : decks.reduce((sum, deck) => sum + deck.totalCards, 0)}
            </div>
            <span className={styles.statLabel}>Total Cards</span>
          </div>
          <div className={styles.progressStat}>
            <div className={styles.statCircle}>
              {isLoading ? "-" : decks.reduce((sum, deck) => sum + deck.masteredCards, 0)}
            </div>
            <span className={styles.statLabel}>Mastered</span>
          </div>
          <div className={styles.progressStat}>
            <div className={styles.statCircle}>
              {isLoading 
                ? "-" 
                : Math.round(
                    (decks.reduce((sum, deck) => sum + deck.masteredCards, 0) / 
                    Math.max(1, decks.reduce((sum, deck) => sum + deck.totalCards, 0))) * 100
                  ) + "%"
              }
            </div>
            <span className={styles.statLabel}>Completion</span>
          </div>
          <div className={styles.progressStat}>
            <div className={styles.statCircle}>
              {isLoading ? "-" : decks.length}
            </div>
            <span className={styles.statLabel}>Decks</span>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div 
            className={styles.progressBarFill} 
            style={{ 
              width: isLoading
                ? "0%"
                : `${Math.round(
                    (decks.reduce((sum, deck) => sum + deck.masteredCards, 0) / 
                    Math.max(1, decks.reduce((sum, deck) => sum + deck.totalCards, 0))) * 100
                  )}%` 
            }}
          />
        </div>
      </div>

      <div className={styles.searchFilterBar}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search flashcards..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.filterControls}>
          <button 
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filter</span>
          </button>
          
          <div className={styles.sortControl}>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="lastPracticed">Recently Practiced</option>
              <option value="title">Alphabetical</option>
              <option value="mastery">Mastery Level</option>
              <option value="dueCards">Due Cards</option>
            </select>
            <FontAwesomeIcon icon={faSort} className={styles.sortIcon} />
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Subject</label>
            <div className={styles.filterOptions}>
              <button 
                className={`${styles.filterButton} ${filterSubject === '' ? styles.active : ''}`}
                onClick={() => setFilterSubject('')}
              >
                All
              </button>
              {subjects.map(subject => (
                <button 
                  key={subject}
                  className={`${styles.filterButton} ${filterSubject === subject ? styles.active : ''}`}
                  onClick={() => setFilterSubject(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <p>Create your first deck to get started!</p>
                <button 
                  className={styles.createButton}
                  onClick={() => setShowCreateModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create New Deck</span>
                </button>
              </div>
            ) : (
              filteredDecks.map((deck) => {
                // Calculate due cards
                const now = new Date();
                const dueCards = deck.cards ? deck.cards.filter(card => 
                  card.srs && new Date(card.srs.nextReview) <= now
                ).length : 0;
                
                return (
                <div
                  key={deck.id}
                  className={styles.deckCard}
                  style={{
                    borderTop: `4px solid ${deck.color}`,
                  }}
                >
                  <div className={styles.deckActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => {
                        setCurrentDeck(deck);
                        setShowCreateModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewAnalytics(deck)}
                    >
                      <FontAwesomeIcon icon={faChartLine} />
                    </button>
                  </div>

                  <div className={styles.deckInfo}>
                    <h3 className={styles.deckTitle}>{deck.title}</h3>
                    <div className={styles.deckSubject}>{deck.subject}</div>
                    <p className={styles.deckDescription}>{deck.description}</p>
                  </div>

                  <div className={styles.deckStats}>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon icon={faLayerGroup} className={styles.statIcon} />
                      <div className={styles.statText}>
                        <span className={styles.statValue}>{deck.cards ? deck.cards.length : 0}</span>
                        <span className={styles.statLabel}>cards</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <FontAwesomeIcon icon={faGraduationCap} className={styles.statIcon} />
                      <div className={styles.statText}>
                        <span className={styles.statValue}>
                          {Math.round((deck.masteredCards / (deck.totalCards || 1)) * 100)}%
                        </span>
                        <span className={styles.statLabel}>mastered</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <FontAwesomeIcon icon={faCalendarAlt} className={styles.statIcon} />
                      <div className={styles.statText}>
                        <span className={styles.statValue}>{dueCards}</span>
                        <span className={styles.statLabel}>due today</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.deckButtons}>
                    <button
                      className={styles.studyButton}
                      onClick={() => handleStartStudy(deck)}
                    >
                      <FontAwesomeIcon icon={faPlay} />
                      <span>{dueCards > 0 ? `Study Now (${dueCards} Due)` : 'Study Now'}</span>
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Flashcard Deck</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newDeck.title}
                  onChange={(e) =>
                    setNewDeck({ ...newDeck, title: e.target.value })
                  }
                  placeholder="e.g., Mathematics: Algebra Basics"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Subject</label>
                <input
                  type="text"
                  value={newDeck.subject}
                  onChange={(e) =>
                    setNewDeck({ ...newDeck, subject: e.target.value })
                  }
                  placeholder="e.g., Mathematics"
                  list="subjects"
                />
                <datalist id="subjects">
                  {subjects.map(subject => (
                    <option key={subject} value={subject} />
                  ))}
                </datalist>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newDeck.description}
                  onChange={(e) =>
                    setNewDeck({ ...newDeck, description: e.target.value })
                  }
                  placeholder="Brief description of the deck content"
                />
              </div>

              <div className={styles.cardsList}>
                <h3>Cards ({newDeck.cards.length})</h3>
                {newDeck.cards.map((card, index) => (
                  <div key={card.id} className={styles.cardPreview}>
                    <div className={styles.cardNumber}>{index + 1}</div>
                    <div className={styles.cardContent}>
                      <p><strong>Q:</strong> {card.question}</p>
                      <p><strong>A:</strong> {card.answer}</p>
                      {card.hint && <p><strong>Hint:</strong> {card.hint}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.addCard}>
                <div className={styles.formGroup}>
                  <label>Question</label>
                  <input
                    type="text"
                    value={newCard.question}
                    onChange={(e) =>
                      setNewCard({ ...newCard, question: e.target.value })
                    }
                    placeholder="Enter question"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Answer</label>
                  <input
                    type="text"
                    value={newCard.answer}
                    onChange={(e) =>
                      setNewCard({ ...newCard, answer: e.target.value })
                    }
                    placeholder="Enter answer"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Hint (Optional)</label>
                  <input
                    type="text"
                    value={newCard.hint}
                    onChange={(e) =>
                      setNewCard({ ...newCard, hint: e.target.value })
                    }
                    placeholder="Enter a hint (optional)"
                  />
                </div>

                <button
                  className={styles.addCardButton}
                  onClick={handleAddCard}
                  disabled={!newCard.question || !newCard.answer}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Add Card</span>
                </button>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.createButton}
                onClick={handleCreateDeck}
                disabled={!newDeck.title || !newDeck.subject || newDeck.cards.length === 0}
              >
                Create Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}