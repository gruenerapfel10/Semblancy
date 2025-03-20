"use client";
import { useState, useEffect } from "react";
import styles from "./competition.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Competition() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [competitions, setCompetitions] = useState([]);
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({});

  // Simulate loading data
  useEffect(() => {
    // Simulating API call with timeout
    const timer = setTimeout(() => {
      const statsData = {
        activeUsers: 12458,
        competitionsCompleted: 34567,
        avgScore: 78.5,
        topCategory: "Mathematics"
      };

      const liveCompetitionsData = [
        {
          id: 101,
          title: "Speed Mathematics",
          category: "Math",
          difficulty: "Intermediate",
          participants: 247,
          timeLeft: "23:45",
          maxParticipants: 300
        },
        {
          id: 102,
          title: "Physics Problem Solving",
          category: "Science",
          difficulty: "Advanced",
          participants: 183,
          timeLeft: "45:12",
          maxParticipants: 250
        },
        {
          id: 103,
          title: "Biology Quiz",
          category: "Science",
          difficulty: "Beginner",
          participants: 312,
          timeLeft: "12:30",
          maxParticipants: 400
        },
        {
          id: 104,
          title: "Chemistry Challenge",
          category: "Science",
          difficulty: "Intermediate",
          participants: 98,
          timeLeft: "01:15",
          maxParticipants: 150
        }
      ];
      
      const competitionsData = [
        {
          id: 1,
          title: "International Mathematics Olympiad",
          date: "2025-05-15",
          registrationDeadline: "2025-05-01",
          level: "International",
          participants: 1250,
          prize: "$10,000",
        },
        {
          id: 2,
          title: "Science Innovation Challenge",
          date: "2025-06-10",
          registrationDeadline: "2025-05-25",
          level: "International",
          participants: 820,
          prize: "$8,000",
        },
        {
          id: 3,
          title: "National Coding Championship",
          date: "2025-07-20",
          registrationDeadline: "2025-07-01",
          level: "National",
          participants: 725,
          prize: "$5,000",
        },
      ];

      const leaderboardData = [
        {
          rank: 1,
          name: "Alex Johnson",
          score: 9850,
          institution: "Stanford University",
          avatar: "👨‍🎓"
        },
        { 
          rank: 2, 
          name: "Mia Chen", 
          score: 9700, 
          institution: "MIT",
          avatar: "👩‍🔬" 
        },
        { 
          rank: 3, 
          name: "David Smith", 
          score: 9450, 
          institution: "CalTech",
          avatar: "👨‍💻" 
        },
        {
          rank: 4,
          name: "Sarah Williams",
          score: 9200,
          institution: "Harvard University",
          avatar: "👩‍🎓"
        },
        { 
          rank: 5, 
          name: "James Lee", 
          score: 9050, 
          institution: "UC Berkeley",
          avatar: "🧠" 
        },
        { 
          rank: 6, 
          name: "Emma Garcia", 
          score: 8900, 
          institution: "Princeton",
          avatar: "📚" 
        },
        { 
          rank: 7, 
          name: "Michael Brown", 
          score: 8750, 
          institution: "Yale University",
          avatar: "🔬" 
        },
      ];

      setStats(statsData);
      setLiveCompetitions(liveCompetitionsData);
      setCompetitions(competitionsData);
      setLeaderboard(leaderboardData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Function to get progress percentage for live competitions
  const getProgressPercentage = (current, max) => {
    return (current / max) * 100;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Competitions Hub</h1>
        <p className={styles.subtitle}>
          Challenge yourself, compete with peers, and rise to the top of the leaderboards
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeSection === "home" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveSection("home")}
        >
          Home
        </button>
        <button
          className={`${styles.tabButton} ${
            activeSection === "live" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveSection("live")}
        >
          Live Competitions
        </button>
        <button
          className={`${styles.tabButton} ${
            activeSection === "leaderboard" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveSection("leaderboard")}
        >
          Leaderboards
        </button>
        <button
          className={`${styles.tabButton} ${
            activeSection === "official" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveSection("official")}
        >
          Official Olympiads
        </button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading competition data...</p>
          </div>
        ) : (
          <>
            {activeSection === "home" && (
              <div className={styles.bentoGrid}>
                <div className={`${styles.bentoItem} ${styles.featuredCompetition}`}>
                  <div className={styles.featuredBadge}>Featured</div>
                  <h3>International Math Challenge</h3>
                  <p className={styles.featuredDescription}>
                    Join the most popular competition this week and test your mathematical prowess!
                  </p>
                  <div className={styles.featuredStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>1,248</span>
                      <span className={styles.statLabel}>Participants</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>Advanced</span>
                      <span className={styles.statLabel}>Difficulty</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>45 min</span>
                      <span className={styles.statLabel}>Duration</span>
                    </div>
                  </div>
                  <button className={styles.joinNowButton}>Join Now</button>
                </div>
                
                <div className={`${styles.bentoItem} ${styles.statsCard}`}>
                  <h3>Platform Stats</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statBox}>
                      <span className={styles.statIcon}>👥</span>
                      <span className={styles.statNumber}>{stats.activeUsers.toLocaleString()}</span>
                      <span className={styles.statDescription}>Active Users</span>
                    </div>
                    <div className={styles.statBox}>
                      <span className={styles.statIcon}>🏆</span>
                      <span className={styles.statNumber}>{stats.competitionsCompleted.toLocaleString()}</span>
                      <span className={styles.statDescription}>Competitions Completed</span>
                    </div>
                    <div className={styles.statBox}>
                      <span className={styles.statIcon}>📊</span>
                      <span className={styles.statNumber}>{stats.avgScore}%</span>
                      <span className={styles.statDescription}>Average Score</span>
                    </div>
                    <div className={styles.statBox}>
                      <span className={styles.statIcon}>🔝</span>
                      <span className={styles.statNumber}>{stats.topCategory}</span>
                      <span className={styles.statDescription}>Top Category</span>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.bentoItem} ${styles.quickLeaderboard}`}>
                  <h3>Top Players</h3>
                  <div className={styles.topPlayersList}>
                    {leaderboard.slice(0, 5).map((player) => (
                      <div key={player.rank} className={styles.topPlayer}>
                        <div className={styles.topPlayerRank}>
                          <span className={styles.playerRankBadge}>{player.rank}</span>
                        </div>
                        <div className={styles.playerAvatar}>{player.avatar}</div>
                        <div className={styles.playerInfo}>
                          <div className={styles.playerName}>{player.name}</div>
                          <div className={styles.playerInstitution}>{player.institution}</div>
                        </div>
                        <div className={styles.playerScore}>{player.score.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className={styles.viewMoreButton}
                    onClick={() => setActiveSection("leaderboard")}
                  >
                    View Complete Leaderboard
                  </button>
                </div>
                
                <div className={`${styles.bentoItem} ${styles.categoriesCard}`}>
                  <h3>Competition Categories</h3>
                  <div className={styles.categoriesList}>
                    <div className={styles.categoryItem}>
                      <span className={styles.categoryIcon}>🧮</span>
                      <span className={styles.categoryName}>Mathematics</span>
                    </div>
                    <div className={styles.categoryItem}>
                      <span className={styles.categoryIcon}>🔬</span>
                      <span className={styles.categoryName}>Science</span>
                    </div>
                    <div className={styles.categoryItem}>
                      <span className={styles.categoryIcon}>💻</span>
                      <span className={styles.categoryName}>Programming</span>
                    </div>
                    <div className={styles.categoryItem}>
                      <span className={styles.categoryIcon}>📚</span>
                      <span className={styles.categoryName}>Literature</span>
                    </div>
                    <div className={styles.categoryItem}>
                      <span className={styles.categoryIcon}>🌎</span>
                      <span className={styles.categoryName}>Geography</span>
                    </div>
                    <div className={styles.categoryItem}>
                      <span className={styles.categoryIcon}>📜</span>
                      <span className={styles.categoryName}>History</span>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.bentoItem} ${styles.liveCompetitionsPreview}`}>
                  <h3>Active Competitions</h3>
                  <div className={styles.liveCompetitionsList}>
                    {liveCompetitions.slice(0, 3).map((comp) => (
                      <div key={comp.id} className={styles.liveCompetitionItem}>
                        <div className={styles.competitionInfo}>
                          <h4>{comp.title}</h4>
                          <div className={styles.competitionMeta}>
                            <span className={styles.competitionCategory}>{comp.category}</span>
                            <span className={styles.competitionDifficulty}>{comp.difficulty}</span>
                          </div>
                        </div>
                        <div className={styles.participantsInfo}>
                          <div className={styles.participantsProgress}>
                            <div 
                              className={styles.progressBar}
                              style={{ width: `${getProgressPercentage(comp.participants, comp.maxParticipants)}%` }}
                            ></div>
                          </div>
                          <div className={styles.participantsText}>
                            {comp.participants}/{comp.maxParticipants} participants
                          </div>
                        </div>
                        <div className={styles.timeLeftBadge}>
                          {comp.timeLeft} left
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className={styles.viewMoreButton}
                    onClick={() => setActiveSection("live")}
                  >
                    View All Live Competitions
                  </button>
                </div>
                
                <div className={`${styles.bentoItem} ${styles.officialPreview}`}>
                  <h3>Upcoming Official Competitions</h3>
                  <div className={styles.officialList}>
                    {competitions.slice(0, 2).map((competition) => (
                      <div key={competition.id} className={styles.officialPreviewItem}>
                        <div className={styles.officialBadge}>
                          {competition.level}
                        </div>
                        <h4>{competition.title}</h4>
                        <div className={styles.officialDate}>
                          <span className={styles.dateLabel}>Date:</span>
                          <span className={styles.dateValue}>
                            {new Date(competition.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={styles.officialPrize}>
                          <span className={styles.prizeLabel}>Prize:</span>
                          <span className={styles.prizeValue}>{competition.prize}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className={styles.viewMoreButton}
                    onClick={() => setActiveSection("official")}
                  >
                    Explore Official Competitions
                  </button>
                </div>
              </div>
            )}

            {activeSection === "live" && (
              <div className={styles.liveCompetitionsGrid}>
                {liveCompetitions.map((comp) => (
                  <div key={comp.id} className={styles.competitionCard}>
                    <div className={styles.competitionHeader}>
                      <div className={`${styles.difficultyBadge} ${styles[comp.difficulty.toLowerCase()]}`}>
                        {comp.difficulty}
                      </div>
                      <h3 className={styles.competitionTitle}>{comp.title}</h3>
                      <div className={styles.competitionCategory}>{comp.category}</div>
                    </div>
                    <div className={styles.competitionDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Status:</span>
                        <span className={styles.liveStatus}>Live Now</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Participants:</span>
                        <span className={styles.detailValue}>
                          {comp.participants}/{comp.maxParticipants}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Time Left:</span>
                        <span className={styles.detailValue}>{comp.timeLeft}</span>
                      </div>
                      
                      <div className={styles.participationProgress}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${getProgressPercentage(comp.participants, comp.maxParticipants)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className={styles.competitionActions}>
                      <button className={styles.registerButton}>Join Competition</button>
                      <button className={styles.moreInfoButton}>Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === "leaderboard" && (
              <div className={styles.leaderboardSection}>
                <div className={styles.leaderboardFilters}>
                  <div className={styles.filterGroup}>
                    <label>Time Period:</label>
                    <select className={styles.filterSelect}>
                      <option>All Time</option>
                      <option>This Month</option>
                      <option>This Week</option>
                      <option>Today</option>
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label>Category:</label>
                    <select className={styles.filterSelect}>
                      <option>All Categories</option>
                      <option>Mathematics</option>
                      <option>Science</option>
                      <option>Programming</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.leaderboardContainer}>
                  <table className={styles.leaderboardTable}>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Institution</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={entry.rank <= 3 ? styles.topRank : ""}
                        >
                          <td className={styles.rankCell}>
                            <span className={styles.rankBadge}>{entry.rank}</span>
                          </td>
                          <td className={styles.userCell}>
                            <div className={styles.userAvatar}>{entry.avatar}</div>
                            <div className={styles.userName}>{entry.name}</div>
                          </td>
                          <td>{entry.institution}</td>
                          <td className={styles.scoreCell}>{entry.score.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === "official" && (
              <div className={styles.competitionsList}>
                {competitions.map((competition) => (
                  <div key={competition.id} className={styles.competitionCard}>
                    <div className={styles.competitionBadge}>
                      {competition.level}
                    </div>
                    <h3 className={styles.competitionTitle}>
                      {competition.title}
                    </h3>
                    <div className={styles.competitionDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Date:</span>
                        <span className={styles.detailValue}>
                          {new Date(competition.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>
                          Registration Deadline:
                        </span>
                        <span className={styles.detailValue}>
                          {new Date(
                            competition.registrationDeadline
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>
                          Participants:
                        </span>
                        <span className={styles.detailValue}>
                          {competition.participants.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Prize:</span>
                        <span className={styles.detailValue}>
                          {competition.prize}
                        </span>
                      </div>
                    </div>
                    <div className={styles.competitionActions}>
                      <button className={styles.registerButton}>
                        Register Now
                      </button>
                      <button className={styles.moreInfoButton}>
                        More Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}