"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";
import { useSearch } from "@/app/context/SearchContext";
import { SearchIndicator } from "@/components/SearchTrigger";
import GlassNavbar from "@/components/GlassNavbar";
import InteractiveMap3D from "@/components/InteractiveMap3D";
import json from "../dashboard/overview/GCSE_Math_Spec.json";
import {
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Star,
  BookOpen,
  Activity,
  BarChart2,
  Clock,
  Award,
  Users,
  Grid,
  FileText,
  Monitor,
  Brain,
  ExternalLink,
} from "lucide-react";

// Custom Modal component for InteractiveMap3D
const CustomMathTopicModal = ({ planetId, data, onClose }) => {
  // Find the exam boards from the tags
  const examBoards = data.tags ? [...new Set(data.tags.map(tag => tag.examBoard))] : [];
  const levels = data.tags ? [...new Set(data.tags.flatMap(tag => tag.level))] : [];
  
  // Calculate random progress percentages for demo purposes
  // In a real app, these would come from the student's actual progress data
  const knowledgeProgress = Math.floor(Math.random() * 100);
  const memoryProgress = Math.floor(Math.random() * 100);
  const practiceProgress = Math.floor(Math.random() * 100);
  
  // Reference for dragging
  const modalRef = useRef(null);
  const dragDataRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });
  
  // Common drag start handler for header and corner handles
  const handleDragStart = (e) => {
    e.preventDefault();
    dragDataRef.current.isDragging = true;
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    dragDataRef.current.startX = clientX;
    dragDataRef.current.startY = clientY;

    if (modalRef.current) {
      const parentRect = modalRef.current.offsetParent.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();
      dragDataRef.current.initialLeft = modalRect.left - parentRect.left;
      dragDataRef.current.initialTop = modalRect.top - parentRect.top;
    }

    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDrag);
    window.addEventListener("touchend", handleDragEnd);
  };

  const handleDrag = (e) => {
    if (!dragDataRef.current.isDragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragDataRef.current.startX;
    const deltaY = clientY - dragDataRef.current.startY;
    
    if (modalRef.current) {
      modalRef.current.style.left = `${dragDataRef.current.initialLeft + deltaX}px`;
      modalRef.current.style.top = `${dragDataRef.current.initialTop + deltaY}px`;
      modalRef.current.style.transform = "none";
    }
  };

  const handleDragEnd = () => {
    dragDataRef.current.isDragging = false;
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchmove", handleDrag);
    window.removeEventListener("touchend", handleDragEnd);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    
    // Add exit animation
    if (modalRef.current) {
      modalRef.current.style.opacity = "0";
      modalRef.current.style.transform = "scale(0.95) translateY(10px)";
      
      setTimeout(() => {
        onClose();
      }, 200);
    } else {
      onClose();
    }
  };
  
  return (
    <div
      ref={modalRef}
      className={styles.customModal}
      style={{
        left: "var(--padding-s)",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      {/* Header - draggable */}
      <div 
        className={styles.customModalHeader}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className={styles.customModalTopic}>
          <div className={styles.customModalLevel}>
            {levels.join(", ")}
          </div>
          <h3 className={styles.customModalTitle}>Math Topic</h3>
        </div>
        <button 
          onClick={handleClose}
          className={styles.customModalClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <div className={styles.customModalContent}>
        {/* Content */}
        <p className={styles.customModalDescription}>
          {data.point}
        </p>
        
        {data.extra && (
          <div className={styles.customModalExtra}>
            <h4>Additional Notes</h4>
            <p>{data.extra}</p>
          </div>
        )}
        
        {/* Progress bars */}
        <div className={styles.customModalProgress}>
          <div className={styles.progressItem}>
            <div className={styles.progressLabel}>
              <span>Knowledge</span>
              <span>{knowledgeProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${knowledgeProgress}%`,
                  backgroundColor: 'var(--brand-color)'
                }}
              ></div>
            </div>
          </div>
          
          <div className={styles.progressItem}>
            <div className={styles.progressLabel}>
              <span>Memory</span>
              <span>{memoryProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${memoryProgress}%`,
                  backgroundColor: 'var(--kredirel-medium-blue)'
                }}
              ></div>
            </div>
          </div>
          
          <div className={styles.progressItem}>
            <div className={styles.progressLabel}>
              <span>Practice</span>
              <span>{practiceProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${practiceProgress}%`,
                  backgroundColor: 'var(--kredirel-orange)'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Exam boards */}
        {examBoards.length > 0 && (
          <div className={styles.customModalExamBoards}>
            <h4>Exam Boards</h4>
            <div className={styles.examBoardTags}>
              {examBoards.map((board, index) => (
                <span key={index} className={styles.examBoardTag}>
                  {board}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with button */}
      <div className={styles.customModalFooter}>
        <button className={styles.customModalButton}>
          <span>Learning Materials</span>
          <ExternalLink size={16} />
        </button>
      </div>
      
      {/* Corner drag handles */}
      <div
        className={styles.dragHandle}
        style={{ top: 0, left: 0 }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
      <div
        className={styles.dragHandle}
        style={{ top: 0, right: 0 }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
      <div
        className={styles.dragHandle}
        style={{ bottom: 0, left: 0 }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
      <div
        className={styles.dragHandle}
        style={{ bottom: 0, right: 0 }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
    </div>
  );
};

export default function Home() {
  const { openSearch } = useSearch();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [countStats, setCountStats] = useState({
    students: 0,
    questions: 0,
    subjects: 0,
  });
  const [scrollY, setScrollY] = useState(0);

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Parallax effect on scroll with debounce for better performance
  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      // Clear the timeout if it exists
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }

      // Schedule the scroll update with requestAnimationFrame
      scrollTimeout = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
    };
  }, []);

  // Simple state setup without animations
  useEffect(() => {
    setIsVisible(true);

    // Set statistics immediately without animation
    setCountStats({
      students: 25000,
      questions: 50000,
      subjects: 15,
    });

    return () => {
      // No cleanup needed
    };
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      text: "The GCSE Simulator transformed my exam preparation. I improved from a grade 5 to an 8 in Mathematics and feel so much more confident!",
      author: "Emily Johnson",
      school: "Oakwood Academy",
      subject: "Mathematics",
      grade: "8",
      avatar: "/images/avatars/student-1.jpg",
    },
    {
      id: 2,
      text: "The practice questions and mock exams are incredibly similar to the real thing. The detailed analytics helped me focus on my weak areas.",
      author: "Michael Chen",
      school: "St. Mary's School",
      subject: "Chemistry",
      grade: "9",
      avatar: "/images/avatars/student-2.jpg",
    },
    {
      id: 3,
      text: "As a teacher, I recommend GCSE Simulator to all my students. The data helps me identify class-wide issues and tailor my lessons accordingly.",
      author: "Ms. Sarah Williams",
      school: "Westfield High",
      subject: "English Literature",
      grade: "Teacher",
      avatar: "/images/avatars/teacher-1.jpg",
    },
  ];

  // Feature cards data
  const features = [
    {
      icon: <BookOpen size={24} />,
      color: "var(--brand-color)",
      title: "Comprehensive Study Resources",
      description:
        "Access thousands of past papers, notes, and revision materials tailored to your GCSE curriculum.",
    },
    {
      icon: <Activity size={24} />,
      color: "var(--kredirel-medium-blue)",
      title: "AI-Powered Performance Analytics",
      description:
        "Track your progress with detailed analytics that identify your strengths and areas for improvement.",
    },
    {
      icon: <Monitor size={24} />,
      color: "var(--kredirel-orange)",
      title: "Realistic Mock Exams",
      description:
        "Practice with exam-standard questions and receive instant feedback to enhance understanding.",
    },
    {
      icon: <Brain size={24} />,
      color: "var(--brand-color-darker)",
      title: "Smart Revision System",
      description:
        "Our algorithm creates personalized study plans based on your performance data.",
    },
  ];

  // Subjects data
  const subjects = [
    { name: "Mathematics", grade: "A*" },
    { name: "English Literature", grade: "A" },
    { name: "Physics", grade: "A" },
    { name: "Chemistry", grade: "B" },
    { name: "Biology", grade: "A" },
    { name: "Computer Science", grade: "A*" },
    { name: "History", grade: "A" },
    { name: "Geography", grade: "B" },
  ];

  return (
    <div className={styles.container}>
      <GlassNavbar />
      <div className={styles.backgroundElements}>
        <div
          className={`${styles.sphere} ${styles.sphere1}`}
          style={{
            transform: `translate3d(${scrollY * 0.03}px, ${
              -scrollY * 0.02
            }px, 0)`,
            willChange: "transform",
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere2}`}
          style={{
            transform: `translate3d(${-scrollY * 0.04}px, ${
              scrollY * 0.02
            }px, 0)`,
            willChange: "transform",
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere3}`}
          style={{
            transform: `translate3d(${scrollY * 0.05}px, ${
              scrollY * 0.01
            }px, 0)`,
            willChange: "transform",
          }}
        ></div>
        <div className={styles.grid}></div>
      </div>

      <section
        ref={heroRef}
        className={`${styles.heroSection} ${isVisible ? styles.visible : ""}`}
      >
        <div className={styles.heroContent}>
          <div className={styles.heroTagline}>
            <span className={styles.pill}>GCSE Exam Preparation</span>
          </div>

          <h1 className={styles.heroTitle}>
            The <span className={styles.highlight}>all-in-one</span> revision
            platform
          </h1>

          <p className={styles.heroSubtitle}>
            The ultimate platform for GCSE and A Level success, our simulator contains every resource you need to ace your exams.
            Revision notes, past papers, infinite skill practice, advanced AI-powered progress tracking, your own personal AI tutor.
            All included with the simulator.
          </p>

          <div className={styles.heroCta}>
            <Link href="/signup" className={styles.primaryButton}>
              <span>Start Your Free Trial</span>
              <ArrowRight size={18} />
            </Link>

            <button onClick={openSearch} className={styles.secondaryButton}>
              <span>Explore Features</span>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <CheckCircle size={14} />
              <span>Used by 500+ schools</span>
            </div>
            <div className={styles.trustBadge}>
              <CheckCircle size={14} />
              <span>Average grade improvement: 2+</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <InteractiveMap3D
            data={json}
            transparentBackground={true}
            pulse={true}
            pulseColor="var(--brand-color)"
            pulseDuration={1500}
            initialZoom={40}
            minZoom={8}
            maxZoom={50}
            rotationAxisX={45}
            rotationAxisY={45}
            rotationAxisZ={45}
            customModal={CustomMathTopicModal}
            draggable={true}
          />
        </div>
      </section>

      <section ref={statsRef} className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statNumber}>
              {countStats.students.toLocaleString()}+
            </h3>
            <p className={styles.statLabel}>Students</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statNumber}>
              {countStats.questions.toLocaleString()}+
            </h3>
            <p className={styles.statLabel}>Practice Questions</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Grid size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statNumber}>{countStats.subjects}+</h3>
            <p className={styles.statLabel}>GCSE Subjects</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How GCSE Simulator Works</h2>
          <p className={styles.sectionSubtitle}>
            Our AI-powered platform adapts to your learning style for maximum
            results
          </p>
        </div>

        <div className={styles.workflowContainer}>
          <div className={styles.workflowSteps}>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Start with a diagnostic test</h3>
                <p>
                  We analyze your current knowledge and identify your strengths
                  and weaknesses
                </p>
              </div>
            </div>

            <div className={styles.workflowPath}></div>

            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Get your personalized study plan</h3>
                <p>
                  Our AI creates a custom revision schedule optimized for your
                  learning style
                </p>
              </div>
            </div>

            <div className={styles.workflowPath}></div>

            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Practice with realistic mock exams</h3>
                <p>
                  Experience exam conditions with our simulator and receive
                  instant feedback
                </p>
              </div>
            </div>

            <div className={styles.workflowPath}></div>

            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Track your progress and improve</h3>
                <p>
                  Monitor your growth with detailed analytics and adjust your
                  approach
                </p>
              </div>
            </div>
          </div>

          <div className={styles.workflowVisual}>
            <div className={styles.pulsingCircle}></div>
            <div className={styles.connectingLines}>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Tools Designed for GCSE Success
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to achieve your target grades
          </p>
        </div>

        <div className={styles.featuresContainer}>
          <div className={styles.featuresTabs}>
            {features.map((feature, index) => (
              <button
                key={index}
                className={`${styles.featureTab} ${
                  activeFeature === index ? styles.activeTab : ""
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div
                  className={styles.featureTabIcon}
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>
                <div className={styles.featureTabContent}>
                  <h3>{feature.title}</h3>
                </div>
              </button>
            ))}
          </div>

          <div className={styles.featureShowcase}>
            <div className={styles.featureDetail}>
              <h3 style={{ color: features[activeFeature].color }}>
                {features[activeFeature].title}
              </h3>
              <p>{features[activeFeature].description}</p>

              <div className={styles.featureHighlights}>
                {activeFeature === 0 && (
                  <>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Past papers from all exam boards</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Detailed teacher-created notes</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Video explanations for complex topics</span>
                    </div>
                  </>
                )}

                {activeFeature === 1 && (
                  <>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Visual progress dashboard</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Topic-by-topic performance tracking</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Weak area identification</span>
                    </div>
                  </>
                )}

                {activeFeature === 2 && (
                  <>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Timed exam conditions</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Examiner-standard marking</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Detailed answer explanations</span>
                    </div>
                  </>
                )}

                {activeFeature === 3 && (
                  <>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Daily study recommendations</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Adaptive learning technology</span>
                    </div>
                    <div className={styles.featureHighlight}>
                      <CheckCircle size={16} />
                      <span>Spaced repetition for better retention</span>
                    </div>
                  </>
                )}
              </div>

              <Link
                href={`/features/${activeFeature}`}
                className={styles.featureLink}
              >
                <span>Learn more</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className={styles.featurePreview}>
              {activeFeature === 0 && (
                <div className={styles.featureVisual}>
                  <div className={styles.resourcesPreview}>
                    <div className={styles.resourceCard}>
                      <div className={styles.resourceLabel}>Past Papers</div>
                    </div>
                    <div className={styles.resourceCard}>
                      <div className={styles.resourceLabel}>Revision Notes</div>
                    </div>
                    <div className={styles.resourceCard}>
                      <div className={styles.resourceLabel}>Formula Sheets</div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 1 && (
                <div className={styles.featureVisual}>
                  <div className={styles.analyticsPreview}>
                    <div className={styles.analyticsHeader}>
                      <div className={styles.analyticsTitle}>
                        Physics Performance
                      </div>
                    </div>
                    <div className={styles.analyticsChart}>
                      <div className={styles.analyticsPieChart}>
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="transparent"
                            stroke="#e2e8f0"
                            strokeWidth="15"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="transparent"
                            stroke="var(--brand-color)"
                            strokeWidth="15"
                            strokeDasharray="314"
                            strokeDashoffset="78.5"
                            transform="rotate(-90 60 60)"
                          />
                        </svg>
                        <div className={styles.pieChartLabel}>75%</div>
                      </div>
                      <div className={styles.analyticsTopics}>
                        <div className={styles.analyticsTopic}>
                          <div className={styles.topicName}>Forces</div>
                          <div className={styles.topicBar}>
                            <div
                              className={styles.topicProgress}
                              style={{ width: "85%" }}
                            ></div>
                          </div>
                        </div>
                        <div className={styles.analyticsTopic}>
                          <div className={styles.topicName}>Waves</div>
                          <div className={styles.topicBar}>
                            <div
                              className={styles.topicProgress}
                              style={{ width: "65%" }}
                            ></div>
                          </div>
                        </div>
                        <div className={styles.analyticsTopic}>
                          <div className={styles.topicName}>Energy</div>
                          <div className={styles.topicBar}>
                            <div
                              className={styles.topicProgress}
                              style={{ width: "90%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 2 && (
                <div className={styles.featureVisual}>
                  <div className={styles.mockExamPreview}>
                    <div className={styles.mockExamHeader}>
                      <div className={styles.mockExamTitle}>
                        Mathematics Paper 1
                      </div>
                      <div className={styles.mockExamTimer}>
                        <Clock size={14} />
                        <span>01:24:36</span>
                      </div>
                    </div>
                    <div className={styles.mockExamQuestion}>
                      <div className={styles.questionNumber}>Question 4</div>
                      <div className={styles.questionContent}>
                        Solve the quadratic equation: x² + 5x + 6 = 0
                      </div>
                      <div className={styles.questionAnswer}>
                        <div className={styles.answerField}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 3 && (
                <div className={styles.featureVisual}>
                  <div className={styles.studyPlanPreview}>
                    <div className={styles.studyPlanHeader}>
                      <div className={styles.studyPlanTitle}>
                        Today's Study Plan
                      </div>
                    </div>
                    <div className={styles.studyTasks}>
                      <div className={styles.studyTask}>
                        <div className={styles.taskCheckbox}></div>
                        <div className={styles.taskContent}>
                          <div className={styles.taskTitle}>
                            Review Algebra Equations
                          </div>
                          <div className={styles.taskMeta}>
                            Mathematics • 30 min
                          </div>
                        </div>
                      </div>
                      <div className={styles.studyTask}>
                        <div className={styles.taskCheckbox}></div>
                        <div className={styles.taskContent}>
                          <div className={styles.taskTitle}>
                            Practice Chemical Reactions
                          </div>
                          <div className={styles.taskMeta}>
                            Chemistry • 45 min
                          </div>
                        </div>
                      </div>
                      <div className={styles.studyTask}>
                        <div className={styles.taskCheckbox}></div>
                        <div className={styles.taskContent}>
                          <div className={styles.taskTitle}>
                            Complete Mock Exam Section
                          </div>
                          <div className={styles.taskMeta}>
                            English Lit • 60 min
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Success Stories</h2>
          <p className={styles.sectionSubtitle}>
            See how students have improved their GCSE results with our platform
          </p>
        </div>

        <div className={styles.testimonialSlider}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`${styles.testimonialCard} ${
                index === activeTestimonial ? styles.activeTestimonial : ""
              }`}
            >
              <div className={styles.testimonialContent}>
                <div className={styles.quoteIcon}>"</div>

                <p className={styles.testimonialText}>{testimonial.text}</p>

                <div className={styles.testimonialRating}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={styles.star}
                      fill="currentColor"
                    />
                  ))}
                </div>
              </div>

              <div className={styles.testimonialFooter}>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        width={50}
                        height={50}
                        className={styles.avatarImage}
                      />
                    ) : (
                      testimonial.author.charAt(0)
                    )}
                  </div>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>{testimonial.author}</h4>
                    <p className={styles.authorDetails}>
                      {testimonial.school} • {testimonial.subject}
                    </p>
                  </div>
                </div>

                <div className={styles.gradeImprovement}>
                  <div className={styles.gradeLabel}>
                    {testimonial.grade === "Teacher" ? (
                      <span className={styles.teacherBadge}>Teacher</span>
                    ) : (
                      <>
                        Grade{" "}
                        <span className={styles.gradValue}>
                          {testimonial.grade}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className={styles.testimonialControls}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`${styles.testimonialDot} ${
                  index === activeTestimonial ? styles.activeDot : ""
                }`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section ref={ctaRef} className={styles.ctaSection}>
        <div className={styles.ctaGlass}>
          <h2 className={styles.ctaTitle}>
            Ready to Achieve Your Target Grades?
          </h2>
          <p className={styles.ctaText}>
            Join thousands of students who have improved their GCSE results with
            our AI-powered platform.
          </p>

          <div className={styles.ctaBenefits}>
            <div className={styles.ctaBenefit}>
              <CheckCircle className={styles.benefitIcon} />
              <span>Personalized study plans</span>
            </div>
            <div className={styles.ctaBenefit}>
              <CheckCircle className={styles.benefitIcon} />
              <span>Thousands of practice questions</span>
            </div>
            <div className={styles.ctaBenefit}>
              <CheckCircle className={styles.benefitIcon} />
              <span>Detailed performance analytics</span>
            </div>
            <div className={styles.ctaBenefit}>
              <CheckCircle className={styles.benefitIcon} />
              <span>Realistic mock exams</span>
            </div>
          </div>

          <div className={styles.ctaPlans}>
            <div className={styles.pricePill}>
              <span className={styles.priceLabel}>Starting at just</span>
              <span className={styles.priceValue}>£9.99</span>
              <span className={styles.priceInterval}>/month</span>
            </div>
          </div>

          <div className={styles.ctaButtons}>
            <Link href="/signup" className={styles.ctaButton}>
              <span>Start 7-Day Free Trial</span>
              <ArrowRight />
            </Link>

            <Link href="/pricing" className={styles.ctaOutlineButton}>
              <span>View All Plans</span>
            </Link>
          </div>

          <div className={styles.ctaGuarantee}>
            <div className={styles.guaranteeIcon}>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <span>14-day money-back guarantee. No questions asked.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
