"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ExamCalendar.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamCalendar() {
  const [page, setPage] = useState(1); // 1 for countdown, 2 for calendar
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [expandedExamIndex, setExpandedExamIndex] = useState(null);
  const [firstExamInfo, setFirstExamInfo] = useState(null);
  const calendarGridRef = useRef(null);

  // Mock function to simulate fetching user exam data
  const fetchUserExamData = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock exam data
    const mockExams = [
      {
        id: 1,
        type: "A Level",
        subject: "Mathematics",
        date: new Date(2025, 4, 15), // May 15, 2025
        time: "09:00 AM",
        duration: "3 hours",
        location: "Main Hall",
        notes: "Calculator permitted. Bring black pens and pencils."
      },
      {
        id: 2,
        type: "A Level",
        subject: "Physics",
        date: new Date(2025, 4, 18), // May 18, 2025
        time: "01:00 PM",
        duration: "2 hours 30 minutes",
        location: "Science Block",
        notes: "Calculator permitted. Bring drawing instruments."
      },
      {
        id: 3,
        type: "GCSE",
        subject: "English Literature",
        date: new Date(2025, 4, 20), // May 20, 2025
        time: "09:00 AM",
        duration: "1 hour 45 minutes",
        location: "Main Hall",
        notes: "No materials permitted other than pens."
      },
      {
        id: 4,
        type: "GCSE",
        subject: "Mathematics",
        date: new Date(2025, 4, 22), // May 22, 2025
        time: "01:30 PM",
        duration: "2 hours",
        location: "Gym",
        notes: "Calculator permitted for Paper 2 only."
      },
      {
        id: 5,
        type: "A Level",
        subject: "Chemistry",
        date: new Date(2025, 4, 25), // May 25, 2025
        time: "09:00 AM",
        duration: "3 hours",
        location: "Science Block",
        notes: "Periodic table will be provided. Calculator permitted."
      },
      {
        id: 6,
        type: "GCSE",
        subject: "Biology",
        date: new Date(2025, 5, 2), // June 2, 2025
        time: "09:00 AM",
        duration: "1 hour 45 minutes",
        location: "Science Block",
        notes: "Calculator permitted."
      },
    ];
    
    return mockExams;
  };

  // Toggle between pages
  const togglePage = () => {
    setPage(page === 1 ? 2 : 1);
  };

  // Calculate days until first exam
  const calculateDaysUntilFirstExam = (exams) => {
    if (!exams || exams.length === 0) return null;
    
    // Find the earliest exam date
    const sortedExams = [...exams].sort((a, b) => a.date - b.date);
    const firstExam = sortedExams[0];
    
    // Calculate days difference
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const examDate = new Date(firstExam.date);
    examDate.setHours(0, 0, 0, 0);
    
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      exam: firstExam
    };
  };

  useEffect(() => {
    // Load exam data when component mounts
    const loadExamData = async () => {
      try {
        setLoading(true);
        const data = await fetchUserExamData();
        setExamData(data);
        
        // Calculate days until first exam
        const firstExamData = calculateDaysUntilFirstExam(data);
        setFirstExamInfo(firstExamData);
      } catch (error) {
        console.error("Error loading exam data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExamData();
  }, []);

  // Close expanded view when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarGridRef.current && !calendarGridRef.current.contains(event.target)) {
        setExpandedExamIndex(null);
        setSelectedDate(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset expanded view when changing month
  useEffect(() => {
    setExpandedExamIndex(null);
    setSelectedDate(null);
  }, [currentMonth]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get day of week for the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigation functions
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format month name
  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Check if a date has exams
  const hasExams = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return examData.some(exam => 
      exam.date.getDate() === date.getDate() && 
      exam.date.getMonth() === date.getMonth() && 
      exam.date.getFullYear() === date.getFullYear()
    );
  };

  // Get exams for a specific date
  const getExamsForDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return examData.filter(exam => 
      exam.date.getDate() === date.getDate() && 
      exam.date.getMonth() === date.getMonth() && 
      exam.date.getFullYear() === date.getFullYear()
    );
  };

  // Handle date click
  const handleDateClick = (day) => {
    const exams = getExamsForDate(day);
    if (exams.length > 0) {
      if (selectedDate === day) {
        // Toggle off if already selected
        setSelectedDate(null);
        setExpandedExamIndex(null);
      } else {
        // Select this day and show first exam
        setSelectedDate(day);
        setExpandedExamIndex(day);
        setSelectedExam(exams[0]);
      }
    }
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasExam = hasExams(day);
      const isSelected = selectedDate === day;
      
      days.push(
        <motion.div 
          key={`day-${day}`}
          className={`${styles.day} ${hasExam ? styles.hasExam : ''} ${isSelected ? styles.selected : ''}`}
          onClick={() => handleDateClick(day)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {day}
          {hasExam && <span className={styles.examIndicator}></span>}
        </motion.div>
      );
    }
    
    // Add empty cells for days after the last day of the month to complete the grid
    const remainingCells = totalCells - (daysInMonth + firstDayOfMonth);
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className={styles.emptyDay}></div>);
    }

    return days;
  };

  // Render countdown page
  const renderCountdownPage = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>Loading your exam schedule...</div>
        </div>
      );
    }

    return (
      <motion.div 
        className={styles.countdownContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className={styles.countdownHeader}>
          <h1>Exam Countdown</h1>
        </div>
        
        <div className={styles.countdownContent}>
          {firstExamInfo && (
            <>
              <div className={styles.examSubject}>{firstExamInfo.exam.subject}</div>
              <div className={styles.examType}>
                <span className={`${styles.examBadge} ${styles[firstExamInfo.exam.type.replace(' ', '').toLowerCase()]}`}>
                  {firstExamInfo.exam.type}
                </span>
              </div>
              
              <motion.div 
                className={styles.daysCounter}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  duration: 0.8
                }}
              >
                <div className={styles.daysNumber}>{firstExamInfo.days}</div>
                <div className={styles.daysLabel}>days remaining</div>
              </motion.div>
              
              <div className={styles.examDateInfo}>
                <div className={styles.examDateLabel}>Exam Date</div>
                <div className={styles.examDate}>
                  {firstExamInfo.exam.date.toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
                <div className={styles.examTime}>
                  {firstExamInfo.exam.time} • {firstExamInfo.exam.location}
                </div>
              </div>
            </>
          )}
          
          <motion.button 
            className={styles.pageToggleButton}
            onClick={togglePage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Calendar
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render calendar page
  const renderCalendarPage = () => {
    return (
      <motion.div 
        className={styles.calendarPageContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className={styles.calendarHeader}>
          <h2>Exam Calendar</h2>
          <p>View your upcoming A Level and GCSE examination dates</p>
        </div>

        <div className={styles.calendarNavigation}>
          <motion.button 
            className={styles.navButton}
            onClick={previousMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            &larr;
          </motion.button>
          <h3>{formatMonth(currentMonth)}</h3>
          <motion.button 
            className={styles.navButton}
            onClick={nextMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            &rarr;
          </motion.button>
        </div>

        <div className={styles.weekdayHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className={styles.weekday}>
              {day}
            </div>
          ))}
        </div>

        <div 
          className={styles.calendarGrid}
          ref={calendarGridRef}
        >
          {loading ? (
            <div className={styles.loading}>Loading your exam schedule...</div>
          ) : (
            <>
              {renderCalendarDays()}
              
              <AnimatePresence>
                {expandedExamIndex && selectedExam && (
                  <motion.div 
                    className={styles.expandedExamContainer}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.expandedExamContent}>
                      <div className={styles.examType}>
                        <span className={`${styles.examBadge} ${styles[selectedExam.type.replace(' ', '').toLowerCase()]}`}>
                          {selectedExam.type}
                        </span>
                      </div>
                      <h3>{selectedExam.subject}</h3>
                      <div className={styles.examDetails}>
                        <div className={styles.examDetail}>
                          <strong>Date:</strong> {selectedExam.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className={styles.examDetail}>
                          <strong>Time:</strong> {selectedExam.time} ({selectedExam.duration})
                        </div>
                        <div className={styles.examDetail}>
                          <strong>Location:</strong> {selectedExam.location}
                        </div>
                        <div className={styles.examNotes}>
                          <strong>Notes:</strong> {selectedExam.notes}
                        </div>
                      </div>
                      <button 
                        className={styles.closeButton}
                        onClick={() => {
                          setSelectedDate(null);
                          setExpandedExamIndex(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
        
        <motion.button 
          className={styles.backButton}
          onClick={togglePage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Return to Countdown
        </motion.button>
      </motion.div>
    );
  };

  // Set container ref for dynamic sizing
  const containerRef = useRef(null);
  
  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div className={styles.mainContainer} ref={containerRef}>
      <AnimatePresence mode="wait">
        {page === 1 ? renderCountdownPage() : renderCalendarPage()}
      </AnimatePresence>
    </div>
  );
}