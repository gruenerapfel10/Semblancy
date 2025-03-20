"use client";
import { useState, useEffect } from "react";
import styles from "./mocks.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Mocks() {
  const [isLoading, setIsLoading] = useState(true);
  const [mockExams, setMockExams] = useState([]);

  // Simulate loading mock exams data
  useEffect(() => {
    // Simulating API call with timeout
    const timer = setTimeout(() => {
      const mockData = [
        {
          id: 1,
          title: "Mathematics Mock Exam 1",
          duration: "3 hours",
          questions: 25,
          level: "Advanced",
          date: "2025-04-10",
        },
        {
          id: 2,
          title: "Physics Mock Exam",
          duration: "2 hours",
          questions: 20,
          level: "Intermediate",
          date: "2025-04-15",
        },
        {
          id: 3,
          title: "Chemistry Foundation",
          duration: "1.5 hours",
          questions: 18,
          level: "Beginner",
          date: "2025-04-17",
        },
        {
          id: 4,
          title: "Biology Mock Exam",
          duration: "2.5 hours",
          questions: 22,
          level: "Advanced",
          date: "2025-04-22",
        },
      ];
      setMockExams(mockData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mock Exams</h1>
        <p className={styles.subtitle}>
          Prepare for your exams with our comprehensive mock tests
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryButton}>Take a Mock Exam</button>
          <button className={styles.secondaryButton}>View Past Results</button>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading mock exams" />
        ) : (
          <div className={styles.cardGrid}>
            {mockExams.map((mock) => (
              <div key={mock.id} className={styles.card}>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{mock.title}</h3>
                  <div className={styles.cardDetails}>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Duration:</span>
                      <span className={styles.detailValue}>
                        {mock.duration}
                      </span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Questions:</span>
                      <span className={styles.detailValue}>
                        {mock.questions}
                      </span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Level:</span>
                      <span className={styles.detailValue}>{mock.level}</span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Date:</span>
                      <span className={styles.detailValue}>
                        {new Date(mock.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.startButton}>Start Exam</button>
                  <button className={styles.infoButton}>More Info</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
