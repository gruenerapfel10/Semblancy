"use client";

import { useState, useEffect } from "react";
import styles from "./overview.module.css";

import { useAmplify } from "@/app/context/Providers";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExamCalendar from "@/components/ExamCalendar";
import InteractiveMap3D from "@/components/InteractiveMap3D";
import PredictedGrades from "@/components/PredictedGrades";
import OmniSearch from "@/components/OmniSearch";
import { SearchBar, SearchIndicator } from "@/components/SearchTrigger";
import { useToast } from "@/app/context/ToastContext";
import MathContentFilter from "@/components/MathContentFilter";
import MathContentModal from "@/components/MathContentModal";

import A2MATH from "./A2_MATH_SPEC.json";

// Use the imported JSON
const mathData = A2MATH;

const subjects = {
  "Math": {
    "A2": A2MATH,
  }
}

export default function OverviewPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [userStats, setUserStats] = useState({
    totalExams: 0,
    completedExams: 0,
    upcomingWeek: 0,
  });
  
  // Filter states
  const [filteredData, setFilteredData] = useState(mathData);
  const [filters, setFilters] = useState({
    exam_board: 'all',
    level: 'all'
  });
  
  const toast = useToast();
  const { user, isAuthenticated } = useAmplify();

  // Apply filters to math data
  useEffect(() => {
    if (filters.exam_board === 'all' && filters.level === 'all') {
      setFilteredData(mathData);
      return;
    }
    
    const filtered = mathData.filter(item => {
      return item.levels.some(option => {
        const matchesBoard = option.exam_board && option.exam_board === filters.exam_board;
        const matchesLevel = option.level && option.level === filters.level;
        return matchesBoard && matchesLevel;
      });
    });

    console.log(filtered)
    
    setFilteredData(filtered);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Custom modal render function for InteractiveMap3D
  const renderMathContentModal = ({ planetId, data }) => {
    return <MathContentModal planetId={planetId} data={data} filters={filters} />;
  };

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
          <SearchBar />
        </div>
        
        <div className={styles.predictedGrades}>
          <PredictedGrades />
        </div>
        
        <div className={styles.calendarSection}>
          <ExamCalendar />
        </div>
        
        <div className={styles.mapSection}>
          <div className={styles.mapHeader}>
            <MathContentFilter onFilterChange={handleFilterChange} />
          </div>
          
          <InteractiveMap3D 
            data={filteredData} 
            pulse={true}
            renderModalContent={renderMathContentModal}
            draggable={true}
          />
        </div>
      </div>
    </div>
  );
}