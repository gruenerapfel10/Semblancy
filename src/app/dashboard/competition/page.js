"use client";
import { useState, useEffect } from "react";
import styles from "./competition.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Competition() {
  const [isLoading, setIsLoading] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Simulate loading competitions data
  useEffect(() => {
    // Simulating API call with timeout
    const timer = setTimeout(() => {
      const competitionsData = [
        {
          id: 1,
          title: "Mathematics Olympiad",
          date: "2025-05-15",
          registrationDeadline: "2025-05-01",
          level: "National",
          participants: 450,
          prize: "$5,000",
        },
        {
          id: 2,
          title: "Science Innovation Challenge",
          date: "2025-06-10",
          registrationDeadline: "2025-05-25",
          level: "International",
          participants: 820,
          prize: "$10,000",
        },
        {
          id: 3,
          title: "Coding Championship",
          date: "2025-07-20",
          registrationDeadline: "2025-07-01",
          level: "Regional",
          participants: 325,
          prize: "$3,000",
        },
      ];

      const leaderboardData = [
        {
          rank: 1,
          name: "Alex Johnson",
          score: 985,
          institution: "Stanford University",
        },
        { rank: 2, name: "Mia Chen", score: 970, institution: "MIT" },
        { rank: 3, name: "David Smith", score: 945, institution: "CalTech" },
        {
          rank: 4,
          name: "Sarah Williams",
          score: 920,
          institution: "Harvard University",
        },
        { rank: 5, name: "James Lee", score: 905, institution: "UC Berkeley" },
      ];

      setCompetitions(competitionsData);
      setLeaderboard(leaderboardData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Competitions</h1>
        <p className={styles.subtitle}>
          Challenge yourself and compete with students worldwide
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "upcoming" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Competitions
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "leaderboard" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("leaderboard")}
        >
          Global Leaderboard
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "past" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          Past Competitions
        </button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading competition..." />
        ) : (
          <>
            {activeTab === "upcoming" && (
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
                          {competition.participants}
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

            {activeTab === "leaderboard" && (
              <div className={styles.leaderboardContainer}>
                <table className={styles.leaderboardTable}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
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
                        <td>{entry.name}</td>
                        <td>{entry.institution}</td>
                        <td className={styles.scoreCell}>{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "past" && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🏆</div>
                <h3>Past Competition Results</h3>
                <p>
                  Check back later for past competition results and highlights.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
