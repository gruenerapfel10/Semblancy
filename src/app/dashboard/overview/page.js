"use client";

import { useState, useEffect } from "react";
import styles from "./overview.module.css";
import { useAmplify } from "@/app/Providers";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExamCalendar from "@/components/ExamCalendar";
import InteractiveMap3D from "@/components/InteractiveMap3D";
import PredictedGrades from "@/components/PredictedGrades";
import OmniSearch from "@/components/OmniSearch";
import json from "./GCSE_Math_Spec.json";
import { SearchBar, SearchIndicator } from "@/components/SearchTrigger";
import { useToast } from "@/app/context/ToastContext";

export default function OverviewPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [userStats, setUserStats] = useState({
    totalExams: 0,
    completedExams: 0,
    upcomingWeek: 0,
  });
  const toast = useToast();

  const { user, isAuthenticated } = useAmplify();

  // Simulate loading user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data
        const mockUserData = {
          name: "Alex Johnson",
          school: "Greenfield Academy",
          year: "Year 13",
          examBoard: "AQA/Edexcel",
          subjectsEnrolled: [
            "Mathematics",
            "Physics",
            "Chemistry",
            "English Literature",
          ],
        };

        // Mock upcoming exams
        const mockUpcomingExams = [
          {
            id: 1,
            subject: "Mathematics",
            type: "A Level",
            date: new Date(2025, 4, 15), // May 15, 2025
            daysRemaining: 60,
          },
          {
            id: 3,
            subject: "English Literature",
            type: "GCSE",
            date: new Date(2025, 4, 20), // May 20, 2025
            daysRemaining: 65,
          },
        ];

        // Mock user stats
        const mockUserStats = {
          totalExams: 6,
          completedExams: 0,
          upcomingWeek: 0,
        };

        setUserData(mockUserData);
        setUpcomingExams(mockUpcomingExams);
        setUserStats(mockUserStats);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    if (isAuthenticated) {
      loadUserData();
    } else {
      setIsPageLoading(false);
    }
  }, [isAuthenticated]);

  // Show loading state
  if (isPageLoading) {
    return (
      <LoadingSpinner
        fullPage={true}
        text="Loading your overview..."
        size="xl"
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* OmniSearch Bar */}
      <div className={styles.gridContainer}>
        <div className={styles.omniSearchSection}>
          {/* <OmniSearch /> */}
          {/* <SearchIndicator /> */}
          <SearchBar />
        </div>

        <div className={styles.predictedGrades}>
          <PredictedGrades />
        </div>
        <div className={styles.calendarSection}>
          <ExamCalendar />
        </div>
        <div className={styles.mapSection}>
          <InteractiveMap3D data={json} />
        </div>
      </div>
    </div>
  );
}
