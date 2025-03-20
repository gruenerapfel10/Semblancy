"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./how-it-works.module.css";
import { SearchIndicator } from "@/components/SearchTrigger";
import { 
  Home, 
  BookOpen, 
  Award, 
  Users, 
  Clock, 
  Map, 
  FileText, 
  Bookmark, 
  BarChart2, 
  Grid, 
  FileCode, 
  List, 
  ChevronRight,
  Play,
  Zap,
  HelpCircle,
  Check
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  
  const sectionRefs = {
    overview: useRef(null),
    mocks: useRef(null),
    competition: useRef(null),
    forums: useRef(null),
    examFinder: useRef(null),
    pastPapers: useRef(null),
    notes: useRef(null),
    skills: useRef(null),
    flashcards: useRef(null),
    specifications: useRef(null)
  };
  
  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update active section based on scroll position
      const sectionPositions = Object.entries(sectionRefs).map(([key, ref]) => ({
        id: key,
        top: ref.current?.getBoundingClientRect().top || 0
      }));
      
      const currentSection = sectionPositions
        .filter(section => section.top <= 100)
        .sort((a, b) => b.top - a.top)[0];
      
      if (currentSection && currentSection.id !== activeSection) {
        setActiveSection(currentSection.id);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);
  
  // Animation observer for scroll-based animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.animateIn);
        }
      });
    }, { threshold: 0.2 });
    
    const elements = document.querySelectorAll(`.${styles.animateOnScroll}`);
    elements.forEach(el => observer.observe(el));
    
    return () => elements.forEach(el => observer.unobserve(el));
  }, []);
  
  // Toggle FAQ item
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };
  
  // Scroll to section
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs[sectionId].current.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // FAQ data
  const faqs = [
    {
      question: "How accurate are the mock exams?",
      answer: "Our mock exams are created by experienced GCSE examiners and teachers, closely following the latest exam board specifications. We regularly update our question bank to reflect any changes in curriculum or exam format, ensuring that you're practicing with the most relevant and accurate materials available."
    },
    {
      question: "Can I access GCSE Simulator on mobile devices?",
      answer: "Yes, GCSE Simulator is fully responsive and works on smartphones, tablets, laptops, and desktop computers. You can study on any device with a web browser, and your progress will sync across all your devices when you're logged in to your account."
    },
    {
      question: "How does the AI generate personalized study plans?",
      answer: "Our AI analyzes your performance across all subjects and topics, identifying patterns in your strengths and weaknesses. It considers factors like your target grades, time available to study, upcoming exam dates, and your learning history to create an optimized study schedule that prioritizes areas needing improvement while maintaining knowledge in stronger areas."
    },
    {
      question: "Are the past papers official exam board papers?",
      answer: "Yes, our past papers section includes official exam board papers from AQA, Edexcel, OCR, WJEC, and others. These are complemented by our own custom-created papers that follow the same format and difficulty level to give you even more practice material."
    },
    {
      question: "Can teachers monitor student progress?",
      answer: "Yes, we offer a Teacher Dashboard for educators and schools. Teachers can monitor student progress, assign specific revision tasks, view analytics on class performance, and identify areas where students may need additional support. Contact our education team for more information on school licenses."
    },
    {
      question: "How often is the content updated?",
      answer: "We update our content continuously throughout the academic year. Curriculum changes, new past papers, and feature improvements are rolled out regularly. Major updates are announced in our Changelog section, and we make special efforts to update content immediately following any exam board specification changes."
    }
  ];

  return (
    <div className={styles.container}>
      {/* Floating search indicator */}
      <SearchIndicator />
    
      {/* Background elements */}
      <div className={styles.backgroundElements}>
        <div 
          className={`${styles.sphere} ${styles.sphere1}`} 
          style={{ transform: `translate3d(${scrollY * 0.05}px, ${-scrollY * 0.03}px, 0)` }}
        ></div>
        <div 
          className={`${styles.sphere} ${styles.sphere2}`} 
          style={{ transform: `translate3d(${-scrollY * 0.07}px, ${scrollY * 0.04}px, 0)` }}
        ></div>
        <div 
          className={`${styles.sphere} ${styles.sphere3}`} 
          style={{ transform: `translate3d(${scrollY * 0.09}px, ${scrollY * 0.02}px, 0)` }}
        ></div>
        <div className={styles.grid}></div>
      </div>
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTagline}>
            <span className={styles.pill}>Platform Guide</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            How GCSE Simulator <span className={styles.highlight}>Works</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            A comprehensive guide to all features and tools available in the GCSE Simulator platform to maximize your exam preparation.
          </p>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.visualContainer}>
            <div className={styles.visualCircle}></div>
            <div className={styles.visualGrid}></div>
            <div className={styles.visualDots}></div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <div className={styles.contentLayout}>
        {/* Navigation Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.navigation}>
            <div className={styles.navTitle}>Platform Features</div>
            
            <div className={styles.navLinks}>
              <button 
                className={`${styles.navLink} ${activeSection === 'overview' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('overview')}
              >
                <Home size={18} />
                <span>Overview Dashboard</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'mocks' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('mocks')}
              >
                <BookOpen size={18} />
                <span>Mock Exams</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'competition' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('competition')}
              >
                <Award size={18} />
                <span>Competition</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'forums' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('forums')}
              >
                <Users size={18} />
                <span>Forums</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'examFinder' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('examFinder')}
              >
                <Map size={18} />
                <span>Exam Centre Finder</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'pastPapers' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('pastPapers')}
              >
                <FileText size={18} />
                <span>Past Papers</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'notes' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('notes')}
              >
                <Bookmark size={18} />
                <span>Notes</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'skills' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('skills')}
              >
                <BarChart2 size={18} />
                <span>Skills Tracking</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'flashcards' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('flashcards')}
              >
                <Grid size={18} />
                <span>Flashcards</span>
              </button>
              
              <button 
                className={`${styles.navLink} ${activeSection === 'specifications' ? styles.activeLink : ''}`}
                onClick={() => scrollToSection('specifications')}
              >
                <FileCode size={18} />
                <span>Specifications</span>
              </button>
            </div>
          </nav>
        </aside>
        
        {/* Main Content Sections */}
        <main className={styles.mainContent}>
          {/* Overview Section */}
          <section 
            ref={sectionRefs.overview}
            id="overview" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <Home size={24} className={styles.sectionIcon} />
              <h2>Overview Dashboard</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>The Overview Dashboard is your central hub for tracking progress across all your GCSE subjects. Here you'll find your personalized study plan, upcoming exams, recent activity, and performance metrics.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Zap size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>AI-Generated Study Plan</h3>
                      <p>Daily and weekly study recommendations based on your performance data and upcoming exams</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <BarChart2 size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Performance Analytics</h3>
                      <p>Visual representations of your strengths and areas for improvement across all subjects</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Clock size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Exam Countdown</h3>
                      <p>Automatic countdowns to your upcoming exams with preparation reminders</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Overview Dashboard Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Overview Dashboard gives you a complete snapshot of your GCSE preparation journey
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>The Overview Dashboard uses our proprietary algorithm to analyze your performance data across all practice questions, mock exams, and revision activities. Our AI identifies patterns in your learning and adapts recommendations in real-time as you continue to use the platform.</p>
                <ul className={styles.technicalList}>
                  <li>Personalized grade predictions based on current performance</li>
                  <li>Topic-by-topic breakdown of strengths and weaknesses</li>
                  <li>Time management suggestions based on your study habits</li>
                  <li>Integration with all other platform features for seamless navigation</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Mock Exams Section */}
          <section 
            ref={sectionRefs.mocks}
            id="mocks" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <BookOpen size={24} className={styles.sectionIcon} />
              <h2>Mock Exams</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our Mock Exams system provides realistic exam simulations that mirror the format, timing, and difficulty of actual GCSE examinations. Prepare for the real thing by testing your knowledge under authentic exam conditions.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Clock size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Timed Exam Environment</h3>
                      <p>Experience realistic exam conditions with accurate timing and pressure</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Examiner-Standard Marking</h3>
                      <p>Get your work marked according to official exam board criteria with detailed feedback</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <BarChart2 size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Performance Analysis</h3>
                      <p>Receive detailed breakdowns of your performance by question type and topic</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Mock Exam System Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  Our Mock Exams closely replicate the experience of sitting a real GCSE exam
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>The Mock Exam system is built on our database of over 50,000 GCSE-standard questions, categorized by difficulty, topic, and question type. Our AI-powered marking system has been trained on thousands of real student answers to provide accurate grading and feedback.</p>
                <ul className={styles.technicalList}>
                  <li>Full papers matching current exam board specifications (AQA, Edexcel, OCR)</li>
                  <li>Automatic saving of your progress if you lose connection</li>
                  <li>Mixed-topic papers to test breadth of knowledge</li>
                  <li>Topic-specific mini-mocks for targeted practice</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Competition Section */}
          <section 
            ref={sectionRefs.competition}
            id="competition" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <Award size={24} className={styles.sectionIcon} />
              <h2>Competition</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Make revision fun and engaging with our Competition feature. Challenge friends, classmates, or students from around the country in subject-specific quizzes and tests to add a motivating competitive element to your studies.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Users size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Head-to-Head Challenges</h3>
                      <p>Compete directly against friends or join random matchups in your subject areas</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Award size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Leaderboards</h3>
                      <p>Track your ranking against other students locally, nationally, or globally</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Zap size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Daily Challenges</h3>
                      <p>New challenges every day to test different areas of the curriculum</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Competition Feature Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Competition feature makes revision more engaging through friendly competition
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Competition system uses a sophisticated matchmaking algorithm to pair you with students of similar ability levels. All challenges draw from our extensive question bank, with difficulty automatically adjusted based on participants' skill levels.</p>
                <ul className={styles.technicalList}>
                  <li>Real-time multiplayer quizzes with live scoring</li>
                  <li>Private competition rooms for study groups or classes</li>
                  <li>Skill-based matchmaking for fair competition</li>
                  <li>Achievement badges and rewards for consistent participation</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Forums Section */}
          <section 
            ref={sectionRefs.forums}
            id="forums" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <Users size={24} className={styles.sectionIcon} />
              <h2>Forums</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our Forums provide a supportive community where you can ask questions, share study resources, and connect with fellow GCSE students. Get help with difficult topics or collaborate on revision strategies in subject-specific discussion boards.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <HelpCircle size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Q&A Sections</h3>
                      <p>Ask questions and get answers from peers and qualified teachers</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Resource Sharing</h3>
                      <p>Exchange notes, flashcards, and revision materials with other students</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Users size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Study Groups</h3>
                      <p>Form private or public study groups for collaborative learning</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Forums Interface Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Forums connect you with a community of students and educators for collaborative learning
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Forums feature rich text editing, mathematical equation support, image embedding, and code formatting to facilitate discussions about any GCSE subject. All forums are moderated to ensure a safe, supportive environment.</p>
                <ul className={styles.technicalList}>
                  <li>Subject-specific boards with topic categorization</li>
                  <li>Formula rendering for mathematics and sciences</li>
                  <li>Teacher-verified answers highlighted for accuracy</li>
                  <li>Reputation system to recognize helpful community members</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Exam Centre Finder Section */}
          <section 
            ref={sectionRefs.examFinder}
            id="examFinder" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <Map size={24} className={styles.sectionIcon} />
              <h2>Exam Centre Finder</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our Exam Centre Finder helps you locate your nearest exam venues, particularly useful for private candidates or those sitting exams at unfamiliar locations. Find detailed information about each centre including facilities, accessibility features, and contact details.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Map size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Interactive Map</h3>
                      <p>Search for exam centres with our location-based mapping tool</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Detailed Centre Information</h3>
                      <p>Access comprehensive details about facilities, requirements, and contacts</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Clock size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Travel Planning</h3>
                      <p>Calculate journey times and plan your route to ensure on-time arrival</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Exam Centre Finder Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Exam Centre Finder helps you locate and get information about your exam venues
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Exam Centre Finder uses geolocation data from exam boards combined with transportation APIs to help you find and plan journeys to your exam centre. The database is updated regularly throughout the academic year.</p>
                <ul className={styles.technicalList}>
                  <li>Comprehensive database of official GCSE exam centres across the UK</li>
                  <li>Filtering by exam board, subject, and accessibility requirements</li>
                  <li>Integration with mapping services for directions</li>
                  <li>Centre reviews and tips from previous candidates</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Past Papers Section */}
          <section 
            ref={sectionRefs.pastPapers}
            id="pastPapers" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <FileText size={24} className={styles.sectionIcon} />
              <h2>Past Papers</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our comprehensive Past Papers section gives you access to actual GCSE exam papers from previous years, complete with mark schemes and examiner reports. Practice with authentic materials to familiarize yourself with the format and style of questions you'll face in your exams.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Authentic Exam Papers</h3>
                      <p>Access official past papers from all major exam boards (AQA, Edexcel, OCR, WJEC)</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <BookOpen size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Mark Schemes</h3>
                      <p>Review official marking guidelines to understand how examiners award points</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <BarChart2 size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Performance Tracking</h3>
                      <p>Track your scores and improvement across multiple practice papers</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Past Papers System Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Past Papers section provides official exam materials with marking assistance
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Past Papers database includes over 1,000 official GCSE papers spanning the last 10 years across all subjects and exam boards. Papers are fully searchable by year, topic, difficulty, and question type.</p>
                <ul className={styles.technicalList}>
                  <li>Searchable question bank for topic-specific practice</li>
                  <li>Interactive marking system that follows official mark schemes</li>
                  <li>Examiner commentary explaining common mistakes</li>
                  <li>Grade boundary information to help gauge performance</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Notes Section */}
          <section 
            ref={sectionRefs.notes}
            id="notes" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <Bookmark size={24} className={styles.sectionIcon} />
              <h2>Notes</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our Notes system allows you to create, organize, and access your study notes across all GCSE subjects. With rich text formatting, image insertion, and equation support, you can create comprehensive revision materials tailored to your learning style.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Rich Text Editor</h3>
                      <p>Create beautifully formatted notes with images, equations, and highlighting</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Grid size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Organization System</h3>
                      <p>Structure notes by subject, topic, and subtopic for easy retrieval</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Users size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Collaborative Features</h3>
                      <p>Share and collaborate on notes with classmates or study groups</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Notes System Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Notes system helps you create, organize, and revise with digital study materials
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Notes system features cloud synchronization, version history, and integration with other platform features like flashcards and past papers. Notes are automatically linked to relevant curriculum topics for easy reference during targeted revision.</p>
                <ul className={styles.technicalList}>
                  <li>Full LaTeX support for mathematical equations</li>
                  <li>Automatic saving and version history</li>
                  <li>Export options (PDF, Word, HTML)</li>
                  <li>Voice recording integration for audio notes</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Skills Section */}
          <section 
            ref={sectionRefs.skills}
            id="skills" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <BarChart2 size={24} className={styles.sectionIcon} />
              <h2>Skills Tracking</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our Skills Tracking feature provides detailed insights into your mastery of specific GCSE skills and assessment objectives. Monitor your progress across different skill categories and identify areas that need additional focus in your revision plan.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <BarChart2 size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Skill Breakdown</h3>
                      <p>View your performance across specific skills required by exam boards</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Zap size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Progress Indicators</h3>
                      <p>Track improvement over time with visual progress indicators</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <BookOpen size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Targeted Practice</h3>
                      <p>Get recommended questions and resources based on your skill levels</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Skills Tracking Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Skills Tracking feature shows your progress across assessment objectives and competencies
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Skills Tracking system is aligned with official assessment objectives from all major exam boards. The platform analyzes your performance across all activities to provide a comprehensive view of your skill mastery.</p>
                <ul className={styles.technicalList}>
                  <li>Assessment objective mapping to curriculum requirements</li>
                  <li>Comparative analysis against target grades</li>
                  <li>Detailed skill taxonomies for each subject</li>
                  <li>Personalized recommendations for skill improvement</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Flashcards Section */}
          <section 
            ref={sectionRefs.flashcards}
            id="flashcards" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <Grid size={24} className={styles.sectionIcon} />
              <h2>Flashcards</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our intelligent Flashcards system helps you memorize key facts, definitions, and concepts using proven spaced repetition techniques. Create your own flashcards or use our pre-made decks covering the entire GCSE curriculum for efficient and effective revision.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Grid size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Digital Flashcards</h3>
                      <p>Create multimedia flashcards with images, equations, and formatting</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Clock size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Spaced Repetition</h3>
                      <p>Optimize learning with scientifically-proven spaced repetition algorithms</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <Users size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Shared Decks</h3>
                      <p>Access thousands of pre-made flashcard decks or share your own</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Flashcards System Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Flashcards system employs spaced repetition for effective memorization
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Flashcards feature uses the SM-2 spaced repetition algorithm, which adjusts review intervals based on your self-reported recall difficulty. This optimizes the learning process by showing cards at the optimal moment before forgetting occurs.</p>
                <ul className={styles.technicalList}>
                  <li>Adaptive scheduling based on recall performance</li>
                  <li>Multiple question formats (basic, cloze deletion, image occlusion)</li>
                  <li>Mobile-friendly interface for studying on the go</li>
                  <li>Import/export functionality for external flashcard systems</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Specifications Section */}
          <section 
            ref={sectionRefs.specifications}
            id="specifications" 
            className={`${styles.contentSection} ${styles.animateOnScroll}`}
          >
            <div className={styles.sectionHeading}>
              <FileCode size={24} className={styles.sectionIcon} />
              <h2>Specifications</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>Our Specifications section provides access to the official exam board specifications for all GCSE subjects. Understand exactly what you need to know for your exams with detailed content breakdowns, assessment objectives, and grade descriptors.</p>
                
                <div className={styles.keyFeatures}>
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <FileCode size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Exam Board Documentation</h3>
                      <p>Access official specifications from all major exam boards in one place</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <List size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Interactive Checklists</h3>
                      <p>Track your coverage of specification points as you revise</p>
                    </div>
                  </div>
                  
                  <div className={styles.keyFeature}>
                    <div className={styles.featureIcon}>
                      <BookOpen size={20} />
                    </div>
                    <div className={styles.featureInfo}>
                      <h3>Linked Resources</h3>
                      <p>Find revision materials directly linked to specific specification points</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>Specifications System Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  The Specifications section helps you understand exactly what you need to learn for your exams
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>Our Specifications feature includes the complete syllabus content for all major GCSE exam boards, parsed and presented in an interactive format that integrates with our other learning tools.</p>
                <ul className={styles.technicalList}>
                  <li>Specification comparison tools for students changing exam boards</li>
                  <li>Progress tracking against specification coverage</li>
                  <li>Downloadable PDFs of official documents</li>
                  <li>Notification system for specification updates</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className={`${styles.faqSection} ${styles.animateOnScroll}`}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            
            <div className={styles.faqContainer}>
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`${styles.faqItem} ${activeFaq === index ? styles.activeFaq : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className={styles.faqQuestion}>
                    <h3>{faq.question}</h3>
                    <span className={styles.faqToggle}>
                      {activeFaq === index ? '−' : '+'}
                    </span>
                  </div>
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Call to Action Section */}
          <section className={`${styles.ctaSection} ${styles.animateOnScroll}`}>
            <div className={styles.ctaContent}>
              <h2>Ready to ace your GCSE exams?</h2>
              <p>Start using GCSE Simulator today and experience the difference our platform can make to your revision.</p>
              <div className={styles.ctaButtons}>
                <Link href="/signup" className={styles.primaryButton}>
                  Start Free Trial
                </Link>
                <Link href="/contact" className={styles.secondaryButton}>
                  Contact Support
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}