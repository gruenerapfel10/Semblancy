"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Target,
  TrendingUp,
  Calendar,
  RefreshCcw,
  Zap,
  Play,
  ChevronDown,
  NotebookPen,
  BrainCircuit,
  Hammer,
  Layers,
  LifeBuoy,
  ChevronUp,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTh,
  faBell,
  faComment,
  faQuestionCircle,
  faCog,
  faRepeat,
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faMicrochip,
  faBook,
  faTrophy,
  faComments,
  faHistory,
  faSearchLocation,
  faFileAlt,
  faStickyNote,
  faTools,
  faLayerGroup,
  faClipboardList,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

{
  /* Add this component inside your Home function */
}
const ComparisonSection = () => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (rowId) => {
    setExpandedRows({
      ...expandedRows,
      [rowId]: !expandedRows[rowId],
    });
  };

  const comparisons = [
    {
      id: "mocs",
      icon: <BrainCircuit size={20} />,
      title: "Modern Learning Technique",
      shortDescription:
        "MOCs (Maps of Content) - a modern learning technique proven by top students",
      fullDescription:
        "MOCs (Maps of Content) - a modern technique used by top productivity experts, medical students, and Obsidian users to effectively learn and retain complex information",
      competitor:
        "Traditional linear learning paths with outdated techniques that don't optimize retention",
    },
    {
      id: "ai",
      icon: <Brain size={20} />,
      title: "AI-Powered Learning",
      shortDescription:
        "Integrated AI tutor that understands your knowledge gaps and guides next steps",
      fullDescription:
        "Integrated AI tutor directly linked with MOCs, providing unparalleled understanding of knowledge gaps and personalized next steps that make success feel achievable",
      competitor:
        "Overwhelming content dumps with no intelligent guidance on where to focus",
    },
    {
      id: "ux",
      icon: <Layers size={20} />,
      title: "User Experience",
      shortDescription:
        "Modern, intuitive interface where everything is easy to find",
      fullDescription:
        "All-in-one app with modern UI/UX design where everything is intuitive and easy to find, eliminating frustration and wasted time",
      competitor:
        "Outdated, cluttered interfaces that are difficult to navigate",
    },
    {
      id: "skills",
      icon: <Target size={20} />,
      title: "Skills Development",
      shortDescription:
        "Specialized modules for infinitely refining specific abilities like organic chemistry",
      fullDescription:
        "Specialized skill modules (like organic chemistry naming) allow infinite practice and refinement of specific abilities in an engaging, game-like format",
      competitor:
        "Generic practice questions without focused skill-building capabilities",
    },
    {
      id: "specs",
      icon: <FileText size={20} />,
      title: "Relevance & Focus",
      shortDescription:
        "Everything based on official exam board specifications for guaranteed progress",
      fullDescription:
        "Strict specification-based approach where every resource is directly linked to official exam board requirements, ensuring every minute spent leads to progress",
      competitor:
        "Vague content organization with poor alignment to actual exam requirements",
    },
    {
      id: "beyond",
      icon: <Users size={20} />,
      title: "Beyond Revision",
      shortDescription:
        "Exam center finder, forums, competitions, and community features",
      fullDescription:
        "Comprehensive support including exam center finder, active discussion forums, student competitions, and community building features",
      competitor:
        "Narrow focus on content delivery with no additional tools or community features",
    },
    {
      id: "support",
      icon: <LifeBuoy size={20} />,
      title: "Customer Support",
      shortDescription: "Responsive team ready to help with any queries",
      fullDescription:
        "Responsive and active support team ready to help with queries, ensuring students and parents never feel stranded or confused",
      competitor:
        "Minimal support with slow response times and generic answers",
    },
  ];

  return (
    <section className={styles.comparisonSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Why Semblance?</h2>
        <p className={styles.sectionSubtitle}>
          See how we compare to traditional learning methods and other revision
          platforms
        </p>
      </div>

      <div className={styles.comparisonContainer}>
        <div className={styles.comparisonHeader}>
          <div className={styles.comparisonHeaderItem}>
            <div className={styles.emptySpace}></div>
          </div>
          <div className={styles.comparisonHeaderItem}>
            <div className={styles.semblanceBadge}>
              <div className={styles.badgeIcon}>
                <Zap size={16} />
              </div>
              <span>Semblance</span>
            </div>
          </div>
          <div className={styles.comparisonHeaderItem}>
            <div className={styles.competitorBadge}>
              <span>Others</span>
            </div>
          </div>
        </div>

        <div className={styles.comparisonRows}>
          {comparisons.map((item) => (
            <div
              key={item.id}
              className={`${styles.comparisonRow} ${
                expandedRows[item.id] ? styles.expanded : styles.collapsed
              }`}
            >
              <div className={styles.comparisonFeature}>
                <div className={styles.featureIcon}>{item.icon}</div>
                <div className={styles.featureText}>
                  <h3>{item.title}</h3>
                </div>
              </div>
              <div className={styles.comparisonSemblance}>
                <div className={styles.semblanceAdvantage}>
                  <span>
                    {expandedRows[item.id]
                      ? item.fullDescription
                      : item.shortDescription}
                  </span>
                  <CheckCircle size={18} className={styles.checkIcon} />
                </div>
              </div>
              <div className={styles.comparisonCompetitor}>
                {expandedRows[item.id] && <span>{item.competitor}</span>}
              </div>
              <button
                onClick={() => toggleRow(item.id)}
                className={styles.learnMoreButton}
              >
                {expandedRows[item.id] ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span>Learn more</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.comparisonCta}>
          <p className={styles.comparisonCtaText}>
            Experience the Semblance difference for yourself
          </p>
          <Link href="/signup" className={styles.comparisonCtaButton}>
            <span>Start Your Free Trial Today</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Add this component to your Home export
// <ComparisonSection />

const howItWorksData = {
  diagnostic: {
    icon: <FileText size={24} />,
    title: "Know what to learn!",
    description:
      "Many students struggle to know what they need to learn and it can be overwhelming and time-consuming. Semblance uses a new, modern approach to learning; MOCs (Maps Of Content) based on official Exam Board specifications to give users an ultimate view of their entire knowledge base.",
    keyPoints: [
      {
        icon: <Target size={20} />,
        title: "Easily identify weak points.",
        description:
          "With MOCs you can see ALL your knowledge, weak points, strong points in one place.",
      },
      {
        icon: <BarChart2 size={20} />,
        title: "Knowledge Fall Off",
        description:
          "Using scientific 'forgetting curve', we encourage the user to keep going over each point increasing retention.",
      },
      {
        icon: <Brain size={20} />,
        title: "Master Tutor",
        description:
          "Our AI, Simmy, can use this MOCs to track how well you are progressing in each subject.",
      },
    ],
    visualCaption:
      "Complete an adaptive diagnostic that adjusts to your knowledge level",
    technicalDescription:
      "Our diagnostic tests use item response theory to efficiently map your knowledge across the entire curriculum.",
    technicalPoints: [
      "Adaptive questions that respond to your performance",
      "Coverage of all exam board specifications",
      "Detailed breakdown by topic and subtopic",
      "Initial grade prediction based on diagnostic results",
    ],
  },
  studyPlan: {
    icon: <Calendar size={24} />,
    title: "How to learn!",
    description:
      "After guiding the student on what he needs to learn, Semblance provides S-tier resources for learning based on the offical Exam Board specification so the student is ALWAYS and ONLY learning something relevant.",
    keyPoints: [
      {
        icon: <NotebookPen size={20} />,
        title: "Revision Notes",
        description:
          "Every revision note is linked with its specification point so you know what and why you are learning it.",
      },
      {
        icon: <BrainCircuit size={20} />,
        title: "Smart Past Papers",
        description:
          "Only at Semblance, we transform regular past papers into interactive past papers which users can take and be graded instantly by our smart AI assistant.",
      },
      {
        icon: <Hammer size={20} />,
        title: "Skills",
        description:
          "Our rich library of skills help students hone in on must-know abilities in a fun, gameified way.",
      },
    ],
    visualCaption:
      "Your custom study schedule balances all subjects and prioritizes weak areas",
    technicalDescription:
      "The study planner uses cognitive science principles to maximize retention and minimize forgetting.",
    technicalPoints: [
      "Integration with digital calendars",
      "Customizable to fit your available study hours",
      "Balance between revision and practice sessions",
      "Countdown to exam dates with progress indicators",
    ],
  },
  mockExams: {
    icon: <Monitor size={24} />,
    title: "How to prepare for exams",
    description:
      "Semblance offers official mock-examinations made by our team, hosted every 3 months, designed to simulate as accurately as possible the real exams.",
    keyPoints: [
      {
        icon: <NotebookPen size={20} />,
        title: "Mocks",
        description:
          "Build confidence with realistic accurate mocks made by real teachers.",
      },
      {
        icon: <Clock size={20} />,
        title: "Past Papers",
        description:
          "Our past paper suite offers interactive and exam-conditions-taken papers, ensuring you are comfortable when the official exams start.",
      },
      {
        icon: <Award size={20} />,
        title: "Competitions",
        description:
          "Students can compete against each other to help each other improve in their accuracy and speed.",
      },
    ],
    visualCaption:
      "Simulate the pressure and format of real exams in a supportive environment",
    technicalDescription:
      "Mock exams are crafted by experienced examiners to match official exam formats and grading criteria.",
    technicalPoints: [
      "Papers for all major exam boards (AQA, Edexcel, OCR, WJEC)",
      "Question-by-question explanations and model answers",
      "Full and sectional mock options for flexible practice",
      "Simulated mark schemes matching actual exam criteria",
    ],
  },
  progress: {
    icon: <TrendingUp size={24} />,
    title: "Track your progress and improve",
    description:
      "Monitor your growth with detailed analytics and adjust your approach based on performance data. Visualize your improvement over time and stay motivated with achievement milestones.",
    keyPoints: [
      {
        icon: <BarChart2 size={20} />,
        title: "Performance Dashboard",
        description: "View progress across subjects and topics",
      },
      {
        icon: <Target size={20} />,
        title: "Target Tracking",
        description: "Monitor progress toward your grade goals",
      },
      {
        icon: <Star size={20} />,
        title: "Achievement System",
        description: "Stay motivated with badges and milestones",
      },
    ],
    visualCaption:
      "See your improvement over time with comprehensive analytics and insights",
    technicalDescription:
      "Our analytics engine transforms practice data into actionable insights to continuously refine your revision strategy.",
    technicalPoints: [
      "Detailed breakdown by topic, question type, and difficulty",
      "Time analysis to improve exam speed and efficiency",
      "Comparative metrics against target grades",
      "Weekly summary reports with personalized recommendations",
    ],
  },
};

export default function Home() {
  const { openSearch } = useSearch();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState("resources");
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
  const howItWorksRef = useRef(null);
  const [activeHowItWorksStep, setActiveHowItWorksStep] =
    useState("diagnostic");

  // Step 2: Create a scrollToHowItWorks function
  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Feature data similar to the section data in how-it-works/page.js
  const featuresData = {
    resources: {
      icon: <BookOpen size={24} />,
      title: "Study Resources",
      description:
        "Access thousands of past papers, notes, and revision materials tailored to your GCSE curriculum. Our comprehensive collection covers all major exam boards and is regularly updated with the latest content.",
      keyFeatures: [
        {
          icon: <FileText size={20} />,
          title: "Past Papers",
          description:
            "Official past papers from all exam boards with detailed mark schemes",
        },
        {
          icon: <BookOpen size={20} />,
          title: "Revision Notes",
          description:
            "Concise, examiner-approved notes for every topic in the curriculum",
        },
        {
          icon: <Grid size={20} />,
          title: "Formula Sheets",
          description:
            "Essential formulas and equations for Science and Mathematics",
        },
      ],
      visualCaption:
        "Browse through our extensive library of study materials for every subject",
      technicalDescription:
        "Our study resources are developed by experienced teachers and examiners, with regular updates to match curriculum changes.",
      technicalPoints: [
        "Content aligned with latest specifications from AQA, Edexcel, OCR, and WJEC",
        "High-quality notes and explanations for every topic",
        "Downloadable PDFs and printable materials",
        "Mobile-friendly for studying on any device",
      ],
    },
    analytics: {
      icon: <Activity size={24} />,
      title: "Performance Analytics",
      description:
        "Track your progress with detailed analytics that identify your strengths and areas for improvement. Our AI algorithms analyze your performance to provide personalized insights and recommendations for focused study.",
      keyFeatures: [
        {
          icon: <BarChart2 size={20} />,
          title: "Performance Dashboard",
          description:
            "Visual tracking of progress across all subjects and topics",
        },
        {
          icon: <Target size={20} />,
          title: "Gap Analysis",
          description: "Identify knowledge gaps and areas that need more focus",
        },
        {
          icon: <TrendingUp size={20} />,
          title: "Progress Timeline",
          description: "Track improvement over time with detailed metrics",
        },
      ],
      visualCaption:
        "Gain insights into your learning patterns and optimize your revision strategy",
      technicalDescription:
        "Our analytics engine processes thousands of data points from quizzes, mock exams, and practice sessions to generate actionable insights.",
      technicalPoints: [
        "Topic-by-topic breakdown of performance",
        "Comparison against target grades",
        "Prediction of potential exam scores based on current progress",
        "Custom recommendations for improvement areas",
      ],
    },
    mocks: {
      icon: <Monitor size={24} />,
      title: "Mock Exams",
      description:
        "Practice with exam-standard questions and receive instant feedback to enhance understanding. Our mock exams simulate real exam conditions to build confidence and timing skills essential for success.",
      keyFeatures: [
        {
          icon: <Clock size={20} />,
          title: "Timed Sessions",
          description: "Realistic exam timing with automated countdown",
        },
        {
          icon: <CheckCircle size={20} />,
          title: "Instant Marking",
          description: "Immediate feedback with detailed explanations",
        },
        {
          icon: <FileText size={20} />,
          title: "Exam Technique",
          description: "Learn how to structure answers for maximum marks",
        },
      ],
      visualCaption:
        "Experience the pressure and format of real GCSE exams in a supportive environment",
      technicalDescription:
        "Our mock exam system uses questions written by experienced examiners, with marking schemes aligned to official grading criteria.",
      technicalPoints: [
        "Questions categorized by difficulty and topic",
        "Simulated exam papers matching official format",
        "Grade predictions based on performance",
        "Detailed answer explanations written by examiners",
      ],
    },
    revision: {
      icon: <Brain size={24} />,
      title: "Smart Revision",
      description:
        "Our algorithm creates personalized study plans based on your performance data, optimizing your revision time for maximum results. Learn more efficiently with our scientifically-backed approach.",
      keyFeatures: [
        {
          icon: <Calendar size={20} />,
          title: "Custom Schedules",
          description: "Daily and weekly plans tailored to your needs",
        },
        {
          icon: <RefreshCcw size={20} />,
          title: "Spaced Repetition",
          description:
            "Science-backed learning techniques for better retention",
        },
        {
          icon: <Zap size={20} />,
          title: "Focus Mode",
          description: "Targeted sessions for your weaker areas",
        },
      ],
      visualCaption:
        "Let our AI optimize your study time based on your learning patterns and goals",
      technicalDescription:
        "The Smart Revision System adapts to your learning style and progress, continuously refining recommendations based on performance data.",
      technicalPoints: [
        "Personalized learning algorithms based on cognitive science",
        "Balance between reviewing weak areas and maintaining strong ones",
        "Automatic adjustment based on upcoming exams and deadlines",
        "Integration with calendar apps for scheduling",
      ],
    },
  };

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

  // Sample testimonials data - extended for infinite scroll effect
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
    {
      id: 4,
      text: "The AI tutor feature has been a game-changer for my revision. It's like having a personal teacher available 24/7.",
      author: "James Wilson",
      school: "Riverside College",
      subject: "Physics",
      grade: "9",
      avatar: "/images/avatars/student-3.jpg",
    },
    {
      id: 5,
      text: "My son's confidence has skyrocketed since using GCSE Simulator. The personalized study plans really work!",
      author: "Karen Thompson",
      school: "Parent",
      subject: "Biology",
      grade: "Parent",
      avatar: "/images/avatars/parent-1.jpg",
    },
    {
      id: 6,
      text: "Our school has seen a 30% improvement in GCSE results since implementing GCSE Simulator across our curriculum.",
      author: "Dr. Robert Clark",
      school: "Oakridge School",
      subject: "Headmaster",
      grade: "Admin",
      avatar: "/images/avatars/teacher-2.jpg",
    },
    {
      id: 7,
      text: "The flashcard system helped me memorize key concepts for my History GCSE. I went from struggling to achieving an 8!",
      author: "Sophie Taylor",
      school: "Kings Academy",
      subject: "History",
      grade: "8",
      avatar: "/images/avatars/student-4.jpg",
    },
    {
      id: 8,
      text: "The exam simulation feature prepared me mentally for the real thing. No surprises on exam day!",
      author: "Daniel Ahmed",
      school: "Westfield High",
      subject: "Computer Science",
      grade: "9",
      avatar: "/images/avatars/student-5.jpg",
    },
  ];

  return (
    <div className={styles.container}>
      <GlassNavbar />
      {/* Floating search indicator */}
      <SearchIndicator />

      {/* Add more decorative blobs to the backgroundElements div */}
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

        {/* Additional blobs */}
        <div
          className={`${styles.sphere} ${styles.sphere4}`}
          style={{
            transform: `translate3d(${scrollY * 0.02}px, ${
              scrollY * 0.03
            }px, 0)`,
            willChange: "transform",
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere5}`}
          style={{
            transform: `translate3d(${-scrollY * 0.03}px, ${
              -scrollY * 0.04
            }px, 0)`,
            willChange: "transform",
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere6}`}
          style={{
            transform: `translate3d(${scrollY * 0.01}px, ${
              -scrollY * 0.05
            }px, 0)`,
            willChange: "transform",
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere7}`}
          style={{
            transform: `translate3d(${-scrollY * 0.06}px, ${
              scrollY * 0.04
            }px, 0)`,
            willChange: "transform",
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere8}`}
          style={{
            transform: `translate3d(${scrollY * 0.04}px, ${
              scrollY * 0.07
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
            <span className={styles.pill}>
              GCSE, A Level, AS Exam Preparation
            </span>
          </div>

          <h1 className={styles.heroTitle}>
            The <span className={styles.highlight}>all-in-one</span> revision
            platform
          </h1>

          <p className={styles.heroSubtitle}>
            This website has{" "}
            <strong className={styles.highlight}>everything</strong> you or your
            child needs to smash GCSE and A Level exams with our expertly
            crafted suite of resources specialised for maximum retention and
            ease of use.
          </p>

          <div className={styles.heroCta}>
            <Link href="/signup" className={styles.primaryButton}>
              <span>Try for free no account</span>
              <ArrowRight size={18} />
            </Link>

            <button
              onClick={scrollToHowItWorks}
              className={styles.secondaryButton}
            >
              <span>Learn how first</span>
              <ChevronDown size={18} />
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
            renderModalContent={({ planetId, data }) => (
              <div>{/* Additional custom content */}</div>
            )}
            draggable={true}
            lockZoom={true}
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
      <section className={styles.howItWorksSection} ref={howItWorksRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How Semblance Works</h2>
          <p className={styles.sectionSubtitle}>
            Semblance follows a well-ordered, science-based, psychology-driven
            approach to learning, making it the most efficient way to learn and
            most importantly to remember.
          </p>
        </div>

        <div className={styles.contentLayout}>
          {/* Navigation Sidebar */}
          <aside className={styles.sidebar}>
            <nav className={styles.navigation}>
              <div className={styles.navTitle}>Learning Journey</div>

              <div className={styles.navLinks}>
                {Object.entries(howItWorksData).map(([key, step], index) => (
                  <button
                    key={key}
                    className={`${styles.navLink} ${
                      activeHowItWorksStep === key ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveHowItWorksStep(key)}
                  >
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <span>{step.title}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {/* Dynamic Step Panel */}
            <section className={styles.dynamicPanel}>
              <div className={styles.sectionHeading}>
                {React.cloneElement(howItWorksData[activeHowItWorksStep].icon, {
                  className: styles.sectionIcon,
                })}
                <h2>{howItWorksData[activeHowItWorksStep].title}</h2>
              </div>

              <div className={styles.sectionContent}>
                <div className={styles.featureDescription}>
                  <p>{howItWorksData[activeHowItWorksStep].description}</p>

                  <div className={styles.keyFeatures}>
                    {howItWorksData[activeHowItWorksStep].keyPoints.map(
                      (point, index) => (
                        <div key={index} className={styles.keyFeature}>
                          <div className={styles.featureIcon}>{point.icon}</div>
                          <div className={styles.featureInfo}>
                            <h3>{point.title}</h3>
                            <p>{point.description}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className={styles.featureVisual}>
                  {/* Visualization based on active step */}
                  {activeHowItWorksStep === "diagnostic" && (
                    <div className={styles.diagnosticPreview}>
                      <InteractiveMap3D
                        data={json}
                        transparentBackground={true}
                        pulse={true}
                        pulseColor="var(--brand-color)"
                        pulseDuration={1500}
                        initialZoom={35}
                        minZoom={8}
                        maxZoom={50}
                        rotationAxisX={45}
                        rotationAxisY={45}
                        rotationAxisZ={45}
                        renderModalContent={({ planetId, data }) => (
                          <div>{/* Additional custom content */}</div>
                        )}
                        draggable={true}
                        lockZoom={true}
                      />
                    </div>
                  )}

                  {activeHowItWorksStep === "studyPlan" && (
                    <div className={styles.studyPlanPreview}></div>
                  )}

                  {activeHowItWorksStep === "mockExams" && (
                    <div className={styles.mockExamPreview}>
                      <div className={styles.mockExamHeader}>
                        <div className={styles.mockExamTitle}>
                          Biology Paper 1
                        </div>
                        <div className={styles.mockExamTimer}>
                          <Clock size={14} />
                          <span>01:15:23 remaining</span>
                        </div>
                      </div>
                      <div className={styles.mockExamQuestion}>
                        <div className={styles.questionNumber}>
                          Question 5 (6 marks)
                        </div>
                        <div className={styles.questionContent}>
                          <p>
                            Explain how the structure of the lungs is adapted
                            for efficient gas exchange. In your answer, include
                            details about:
                          </p>
                          <ul>
                            <li>Surface area</li>
                            <li>Diffusion distance</li>
                            <li>Ventilation mechanism</li>
                          </ul>
                        </div>
                        <div className={styles.questionAnswer}>
                          <div className={styles.answerField}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeHowItWorksStep === "progress" && (
                    <div className={styles.progressPreview}></div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </section>

      {/* Features Section - Updated with how-it-works style */}
      {/* Features Section - Updated with dashboard menu items */}
      <section ref={featuresRef} className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Expertly-designed tools Designed for Success
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to achieve your target grades
          </p>
        </div>

        <div className={styles.contentLayout}>
          {/* Navigation Sidebar */}
          <aside className={styles.sidebar}>
            <nav className={styles.navigation}>
              <div className={styles.navTitle}>Platform Features</div>

              <div className={styles.navLinks}>
                {/* Menu Section */}
                <div className={styles.navSection}>
                  <div className={styles.navSectionTitle}>Menu</div>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "overview" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("overview")}
                  >
                    <FontAwesomeIcon icon={faMicrochip} size={18} />
                    <span>Overview</span>
                  </button>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "mocks" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("mocks")}
                  >
                    <FontAwesomeIcon icon={faBook} size={18} />
                    <span>Mocks</span>
                  </button>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "competition" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("competition")}
                  >
                    <FontAwesomeIcon icon={faTrophy} size={18} />
                    <span>Competition</span>
                  </button>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "forums" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("forums")}
                  >
                    <FontAwesomeIcon icon={faComments} size={18} />
                    <span>Forums</span>
                  </button>
                </div>

                {/* Revision Section */}
                <div className={styles.navSection}>
                  <div className={styles.navSectionTitle}>Revision</div>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "past-papers" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("past-papers")}
                  >
                    <FontAwesomeIcon icon={faFileAlt} size={18} />
                    <span>Past Papers</span>
                  </button>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "notes" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("notes")}
                  >
                    <FontAwesomeIcon icon={faStickyNote} size={18} />
                    <span>Notes</span>
                  </button>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "skills" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("skills")}
                  >
                    <FontAwesomeIcon icon={faTools} size={18} />
                    <span>Skills</span>
                  </button>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "flashcards" ? styles.activeLink : ""
                    }`}
                    onClick={() => setActiveFeature("flashcards")}
                  >
                    <FontAwesomeIcon icon={faLayerGroup} size={18} />
                    <span>Flashcards</span>
                  </button>
                  <button
                    className={`${styles.navLink} ${
                      activeFeature === "specifications"
                        ? styles.activeLink
                        : ""
                    }`}
                    onClick={() => setActiveFeature("specifications")}
                  >
                    <FontAwesomeIcon icon={faClipboardList} size={18} />
                    <span>Specifications</span>
                  </button>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {/* Dynamic Feature Panel */}
            <section className={styles.dynamicPanel}>
              <div className={styles.sectionHeading}>
                {/* Icon and title will depend on the active feature */}
                {activeFeature === "overview" && (
                  <>
                    <FontAwesomeIcon
                      icon={faMicrochip}
                      className={styles.sectionIcon}
                    />
                    <h2>Dashboard Overview</h2>
                  </>
                )}
                {activeFeature === "mocks" && (
                  <>
                    <FontAwesomeIcon
                      icon={faBook}
                      className={styles.sectionIcon}
                    />
                    <h2>Mock Exams</h2>
                  </>
                )}
                {activeFeature === "competition" && (
                  <>
                    <FontAwesomeIcon
                      icon={faTrophy}
                      className={styles.sectionIcon}
                    />
                    <h2>Competition</h2>
                  </>
                )}
                {activeFeature === "forums" && (
                  <>
                    <FontAwesomeIcon
                      icon={faComments}
                      className={styles.sectionIcon}
                    />
                    <h2>Forums</h2>
                  </>
                )}
                {activeFeature === "past-papers" && (
                  <>
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className={styles.sectionIcon}
                    />
                    <h2>Past Papers</h2>
                  </>
                )}
                {activeFeature === "notes" && (
                  <>
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      className={styles.sectionIcon}
                    />
                    <h2>Revision Notes</h2>
                  </>
                )}
                {activeFeature === "skills" && (
                  <>
                    <FontAwesomeIcon
                      icon={faTools}
                      className={styles.sectionIcon}
                    />
                    <h2>Skills Development</h2>
                  </>
                )}
                {activeFeature === "flashcards" && (
                  <>
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className={styles.sectionIcon}
                    />
                    <h2>Flashcards</h2>
                  </>
                )}
                {activeFeature === "specifications" && (
                  <>
                    <FontAwesomeIcon
                      icon={faClipboardList}
                      className={styles.sectionIcon}
                    />
                    <h2>Specifications</h2>
                  </>
                )}
              </div>

              <div className={styles.sectionContent}>
                <div className={styles.featureDescription}>
                  {/* Content will depend on active feature */}
                  {activeFeature === "overview" && (
                    <>
                      <p>
                        Your personalized dashboard that provides a complete
                        overview of your learning journey. Track your progress,
                        see upcoming exams, and get recommendations for focused
                        revision.
                      </p>
                      <div className={styles.keyFeatures}>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <BarChart2 size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Progress Tracking</h3>
                            <p>
                              View your improvement across all subjects at a
                              glance
                            </p>
                          </div>
                        </div>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <Calendar size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Exam Countdown</h3>
                            <p>Stay organized with upcoming exam dates</p>
                          </div>
                        </div>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <Target size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Focus Areas</h3>
                            <p>Recommended topics based on your performance</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeFeature === "mocks" && (
                    <>
                      <p>
                        Practice with realistic mock exams that mirror the
                        format, timing, and difficulty of actual GCSE and A
                        Level tests. Build confidence and perfect your exam
                        technique.
                      </p>
                      <div className={styles.keyFeatures}>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <Clock size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Timed Sessions</h3>
                            <p>
                              Experience real exam conditions with accurate
                              timing
                            </p>
                          </div>
                        </div>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <CheckCircle size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Instant Feedback</h3>
                            <p>
                              Get marks and detailed explanations immediately
                            </p>
                          </div>
                        </div>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <FileText size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Examiner Tips</h3>
                            <p>
                              Learn what markers look for in top-grade answers
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Add similar blocks for other features */}
                  {activeFeature === "past-papers" && (
                    <>
                      <p>
                        Access a comprehensive library of past papers from all
                        major exam boards. Practice with real questions from
                        previous years to familiarize yourself with the exam
                        format and style.
                      </p>
                      <div className={styles.keyFeatures}>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <BookOpen size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Full Archive</h3>
                            <p>
                              Papers from all exam boards going back several
                              years
                            </p>
                          </div>
                        </div>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <FileText size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Mark Schemes</h3>
                            <p>
                              Official marking guidelines to check your answers
                            </p>
                          </div>
                        </div>
                        <div className={styles.keyFeature}>
                          <div className={styles.featureIcon}>
                            <Monitor size={20} />
                          </div>
                          <div className={styles.featureInfo}>
                            <h3>Interactive Mode</h3>
                            <p>Take papers online with automatic grading</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Add content for other features as needed */}
                </div>
              </div>
            </section>
          </main>
        </div>
      </section>

      <ComparisonSection />

      {/* Testimonials Section - Infinite Scroll */}
      <section ref={testimonialsRef} className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Success Stories</h2>
          <p className={styles.sectionSubtitle}>
            See how our students have achieved exceptional results
          </p>
        </div>

        <div className={styles.testimonialInfiniteContainer}>
          {/* First row - scrolling left to right */}
          <div className={styles.testimonialRow}>
            <div className={styles.testimonialTrack}>
              {/* Double the testimonials for seamless infinite scroll */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={`row1-${testimonial.id}-${index}`}
                  className={styles.testimonialCard}
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
                        <h4 className={styles.authorName}>
                          {testimonial.author}
                        </h4>
                        <p className={styles.authorDetails}>
                          {testimonial.school} • {testimonial.subject}
                        </p>
                      </div>
                    </div>

                    <div className={styles.gradeImprovement}>
                      <div className={styles.gradeLabel}>
                        {testimonial.grade === "Teacher" ||
                        testimonial.grade === "Parent" ||
                        testimonial.grade === "Admin" ? (
                          <span className={styles.teacherBadge}>
                            {testimonial.grade}
                          </span>
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
            </div>
          </div>

          {/* Second row - scrolling right to left */}
          <div className={styles.testimonialRow}>
            <div className={styles.testimonialTrackReverse}>
              {/* Double the testimonials for seamless infinite scroll */}
              {[
                ...testimonials.slice().reverse(),
                ...testimonials.slice().reverse(),
              ].map((testimonial, index) => (
                <div
                  key={`row2-${testimonial.id}-${index}`}
                  className={styles.testimonialCard}
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
                        <h4 className={styles.authorName}>
                          {testimonial.author}
                        </h4>
                        <p className={styles.authorDetails}>
                          {testimonial.school} • {testimonial.subject}
                        </p>
                      </div>
                    </div>

                    <div className={styles.gradeImprovement}>
                      <div className={styles.gradeLabel}>
                        {testimonial.grade === "Teacher" ||
                        testimonial.grade === "Parent" ||
                        testimonial.grade === "Admin" ? (
                          <span className={styles.teacherBadge}>
                            {testimonial.grade}
                          </span>
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
            </div>
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
