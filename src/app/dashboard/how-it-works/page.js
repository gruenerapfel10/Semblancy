"use client";

import React, { useState } from "react";
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
  
  // Toggle FAQ item
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };
  
  // Section content data
  const sections = {
    overview: {
      icon: <Home size={24} />,
      title: "Overview Dashboard",
      description: "The Overview Dashboard is your central hub for tracking progress across all your GCSE subjects. Here you'll find your personalized study plan, upcoming exams, recent activity, and performance metrics.",
      keyFeatures: [
        {
          icon: <Zap size={20} />,
          title: "AI-Generated Study Plan",
          description: "Daily and weekly study recommendations based on your performance data and upcoming exams"
        },
        {
          icon: <BarChart2 size={20} />,
          title: "Performance Analytics",
          description: "Visual representations of your strengths and areas for improvement across all subjects"
        },
        {
          icon: <Clock size={20} />,
          title: "Exam Countdown",
          description: "Automatic countdowns to your upcoming exams with preparation reminders"
        }
      ],
      visualCaption: "The Overview Dashboard gives you a complete snapshot of your GCSE preparation journey",
      technicalDescription: "The Overview Dashboard uses our proprietary algorithm to analyze your performance data across all practice questions, mock exams, and revision activities. Our AI identifies patterns in your learning and adapts recommendations in real-time as you continue to use the platform.",
      technicalPoints: [
        "Personalized grade predictions based on current performance",
        "Topic-by-topic breakdown of strengths and weaknesses",
        "Time management suggestions based on your study habits",
        "Integration with all other platform features for seamless navigation"
      ]
    },
    mocks: {
      icon: <BookOpen size={24} />,
      title: "Mock Exams",
      description: "Our Mock Exams system provides realistic exam simulations that mirror the format, timing, and difficulty of actual GCSE examinations. Prepare for the real thing by testing your knowledge under authentic exam conditions.",
      keyFeatures: [
        {
          icon: <Clock size={20} />,
          title: "Timed Exam Environment",
          description: "Experience realistic exam conditions with accurate timing and pressure"
        },
        {
          icon: <FileText size={20} />,
          title: "Examiner-Standard Marking",
          description: "Get your work marked according to official exam board criteria with detailed feedback"
        },
        {
          icon: <BarChart2 size={20} />,
          title: "Performance Analysis",
          description: "Receive detailed breakdowns of your performance by question type and topic"
        }
      ],
      visualCaption: "Our Mock Exams closely replicate the experience of sitting a real GCSE exam",
      technicalDescription: "The Mock Exam system is built on our database of over 50,000 GCSE-standard questions, categorized by difficulty, topic, and question type. Our AI-powered marking system has been trained on thousands of real student answers to provide accurate grading and feedback.",
      technicalPoints: [
        "Full papers matching current exam board specifications (AQA, Edexcel, OCR)",
        "Automatic saving of your progress if you lose connection",
        "Mixed-topic papers to test breadth of knowledge",
        "Topic-specific mini-mocks for targeted practice"
      ]
    },
    competition: {
      icon: <Award size={24} />,
      title: "Competition",
      description: "Make revision fun and engaging with our Competition feature. Challenge friends, classmates, or students from around the country in subject-specific quizzes and tests to add a motivating competitive element to your studies.",
      keyFeatures: [
        {
          icon: <Users size={20} />,
          title: "Head-to-Head Challenges",
          description: "Compete directly against friends or join random matchups in your subject areas"
        },
        {
          icon: <Award size={20} />,
          title: "Leaderboards",
          description: "Track your ranking against other students locally, nationally, or globally"
        },
        {
          icon: <Zap size={20} />,
          title: "Daily Challenges",
          description: "New challenges every day to test different areas of the curriculum"
        }
      ],
      visualCaption: "The Competition feature makes revision more engaging through friendly competition",
      technicalDescription: "Our Competition system uses a sophisticated matchmaking algorithm to pair you with students of similar ability levels. All challenges draw from our extensive question bank, with difficulty automatically adjusted based on participants' skill levels.",
      technicalPoints: [
        "Real-time multiplayer quizzes with live scoring",
        "Private competition rooms for study groups or classes",
        "Skill-based matchmaking for fair competition",
        "Achievement badges and rewards for consistent participation"
      ]
    },
    forums: {
      icon: <Users size={24} />,
      title: "Forums",
      description: "Our Forums provide a supportive community where you can ask questions, share study resources, and connect with fellow GCSE students. Get help with difficult topics or collaborate on revision strategies in subject-specific discussion boards.",
      keyFeatures: [
        {
          icon: <HelpCircle size={20} />,
          title: "Q&A Sections",
          description: "Ask questions and get answers from peers and qualified teachers"
        },
        {
          icon: <FileText size={20} />,
          title: "Resource Sharing",
          description: "Exchange notes, flashcards, and revision materials with other students"
        },
        {
          icon: <Users size={20} />,
          title: "Study Groups",
          description: "Form private or public study groups for collaborative learning"
        }
      ],
      visualCaption: "The Forums connect you with a community of students and educators for collaborative learning",
      technicalDescription: "Our Forums feature rich text editing, mathematical equation support, image embedding, and code formatting to facilitate discussions about any GCSE subject. All forums are moderated to ensure a safe, supportive environment.",
      technicalPoints: [
        "Subject-specific boards with topic categorization",
        "Formula rendering for mathematics and sciences",
        "Teacher-verified answers highlighted for accuracy",
        "Reputation system to recognize helpful community members"
      ]
    },
    examFinder: {
      icon: <Map size={24} />,
      title: "Exam Centre Finder",
      description: "Our Exam Centre Finder helps you locate your nearest exam venues, particularly useful for private candidates or those sitting exams at unfamiliar locations. Find detailed information about each centre including facilities, accessibility features, and contact details.",
      keyFeatures: [
        {
          icon: <Map size={20} />,
          title: "Interactive Map",
          description: "Search for exam centres with our location-based mapping tool"
        },
        {
          icon: <FileText size={20} />,
          title: "Detailed Centre Information",
          description: "Access comprehensive details about facilities, requirements, and contacts"
        },
        {
          icon: <Clock size={20} />,
          title: "Travel Planning",
          description: "Calculate journey times and plan your route to ensure on-time arrival"
        }
      ],
      visualCaption: "The Exam Centre Finder helps you locate and get information about your exam venues",
      technicalDescription: "Our Exam Centre Finder uses geolocation data from exam boards combined with transportation APIs to help you find and plan journeys to your exam centre. The database is updated regularly throughout the academic year.",
      technicalPoints: [
        "Comprehensive database of official GCSE exam centres across the UK",
        "Filtering by exam board, subject, and accessibility requirements",
        "Integration with mapping services for directions",
        "Centre reviews and tips from previous candidates"
      ]
    },
    pastPapers: {
      icon: <FileText size={24} />,
      title: "Past Papers",
      description: "Our comprehensive Past Papers section gives you access to actual GCSE exam papers from previous years, complete with mark schemes and examiner reports. Practice with authentic materials to familiarize yourself with the format and style of questions you'll face in your exams.",
      keyFeatures: [
        {
          icon: <FileText size={20} />,
          title: "Authentic Exam Papers",
          description: "Access official past papers from all major exam boards (AQA, Edexcel, OCR, WJEC)"
        },
        {
          icon: <BookOpen size={20} />,
          title: "Mark Schemes",
          description: "Review official marking guidelines to understand how examiners award points"
        },
        {
          icon: <BarChart2 size={20} />,
          title: "Performance Tracking",
          description: "Track your scores and improvement across multiple practice papers"
        }
      ],
      visualCaption: "The Past Papers section provides official exam materials with marking assistance",
      technicalDescription: "Our Past Papers database includes over 1,000 official GCSE papers spanning the last 10 years across all subjects and exam boards. Papers are fully searchable by year, topic, difficulty, and question type.",
      technicalPoints: [
        "Searchable question bank for topic-specific practice",
        "Interactive marking system that follows official mark schemes",
        "Examiner commentary explaining common mistakes",
        "Grade boundary information to help gauge performance"
      ]
    },
    notes: {
      icon: <Bookmark size={24} />,
      title: "Notes",
      description: "Our Notes system allows you to create, organize, and access your study notes across all GCSE subjects. With rich text formatting, image insertion, and equation support, you can create comprehensive revision materials tailored to your learning style.",
      keyFeatures: [
        {
          icon: <FileText size={20} />,
          title: "Rich Text Editor",
          description: "Create beautifully formatted notes with images, equations, and highlighting"
        },
        {
          icon: <Grid size={20} />,
          title: "Organization System",
          description: "Structure notes by subject, topic, and subtopic for easy retrieval"
        },
        {
          icon: <Users size={20} />,
          title: "Collaborative Features",
          description: "Share and collaborate on notes with classmates or study groups"
        }
      ],
      visualCaption: "The Notes system helps you create, organize, and revise with digital study materials",
      technicalDescription: "Our Notes system features cloud synchronization, version history, and integration with other platform features like flashcards and past papers. Notes are automatically linked to relevant curriculum topics for easy reference during targeted revision.",
      technicalPoints: [
        "Full LaTeX support for mathematical equations",
        "Automatic saving and version history",
        "Export options (PDF, Word, HTML)",
        "Voice recording integration for audio notes"
      ]
    },
    skills: {
      icon: <BarChart2 size={24} />,
      title: "Skills Tracking",
      description: "Our Skills Tracking feature provides detailed insights into your mastery of specific GCSE skills and assessment objectives. Monitor your progress across different skill categories and identify areas that need additional focus in your revision plan.",
      keyFeatures: [
        {
          icon: <BarChart2 size={20} />,
          title: "Skill Breakdown",
          description: "View your performance across specific skills required by exam boards"
        },
        {
          icon: <Zap size={20} />,
          title: "Progress Indicators",
          description: "Track improvement over time with visual progress indicators"
        },
        {
          icon: <BookOpen size={20} />,
          title: "Targeted Practice",
          description: "Get recommended questions and resources based on your skill levels"
        }
      ],
      visualCaption: "The Skills Tracking feature shows your progress across assessment objectives and competencies",
      technicalDescription: "Our Skills Tracking system is aligned with official assessment objectives from all major exam boards. The platform analyzes your performance across all activities to provide a comprehensive view of your skill mastery.",
      technicalPoints: [
        "Assessment objective mapping to curriculum requirements",
        "Comparative analysis against target grades",
        "Detailed skill taxonomies for each subject",
        "Personalized recommendations for skill improvement"
      ]
    },
    flashcards: {
      icon: <Grid size={24} />,
      title: "Flashcards",
      description: "Our intelligent Flashcards system helps you memorize key facts, definitions, and concepts using proven spaced repetition techniques. Create your own flashcards or use our pre-made decks covering the entire GCSE curriculum for efficient and effective revision.",
      keyFeatures: [
        {
          icon: <Grid size={20} />,
          title: "Digital Flashcards",
          description: "Create multimedia flashcards with images, equations, and formatting"
        },
        {
          icon: <Clock size={20} />,
          title: "Spaced Repetition",
          description: "Optimize learning with scientifically-proven spaced repetition algorithms"
        },
        {
          icon: <Users size={20} />,
          title: "Shared Decks",
          description: "Access thousands of pre-made flashcard decks or share your own"
        }
      ],
      visualCaption: "The Flashcards system employs spaced repetition for effective memorization",
      technicalDescription: "Our Flashcards feature uses the SM-2 spaced repetition algorithm, which adjusts review intervals based on your self-reported recall difficulty. This optimizes the learning process by showing cards at the optimal moment before forgetting occurs.",
      technicalPoints: [
        "Adaptive scheduling based on recall performance",
        "Multiple question formats (basic, cloze deletion, image occlusion)",
        "Mobile-friendly interface for studying on the go",
        "Import/export functionality for external flashcard systems"
      ]
    },
    specifications: {
      icon: <FileCode size={24} />,
      title: "Specifications",
      description: "Our Specifications section provides access to the official exam board specifications for all GCSE subjects. Understand exactly what you need to know for your exams with detailed content breakdowns, assessment objectives, and grade descriptors.",
      keyFeatures: [
        {
          icon: <FileCode size={20} />,
          title: "Exam Board Documentation",
          description: "Access official specifications from all major exam boards in one place"
        },
        {
          icon: <List size={20} />,
          title: "Interactive Checklists",
          description: "Track your coverage of specification points as you revise"
        },
        {
          icon: <BookOpen size={20} />,
          title: "Linked Resources",
          description: "Find revision materials directly linked to specific specification points"
        }
      ],
      visualCaption: "The Specifications section helps you understand exactly what you need to learn for your exams",
      technicalDescription: "Our Specifications feature includes the complete syllabus content for all major GCSE exam boards, parsed and presented in an interactive format that integrates with our other learning tools.",
      technicalPoints: [
        "Specification comparison tools for students changing exam boards",
        "Progress tracking against specification coverage",
        "Downloadable PDFs of official documents",
        "Notification system for specification updates"
      ]
    }
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
    
      {/* Enhanced background elements */}
      <div className={styles.backgroundElements}>
        <div className={`${styles.sphere} ${styles.sphere1}`}></div>
        <div className={`${styles.sphere} ${styles.sphere2}`}></div>
        <div className={`${styles.sphere} ${styles.sphere3}`}></div>
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
              {Object.entries(sections).map(([key, section]) => (
                <button 
                  key={key}
                  className={`${styles.navLink} ${activeSection === key ? styles.activeLink : ''}`}
                  onClick={() => setActiveSection(key)}
                >
                  {React.cloneElement(section.icon, { size: 18 })}
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>
        
        {/* Main Content - Dynamic panel */}
        <main className={styles.mainContent}>
          {/* Dynamic Feature Panel */}
          <section className={styles.dynamicPanel}>
            <div className={styles.sectionHeading}>
              {React.cloneElement(sections[activeSection].icon, { className: styles.sectionIcon })}
              <h2>{sections[activeSection].title}</h2>
            </div>
            
            <div className={styles.sectionContent}>
              <div className={styles.featureDescription}>
                <p>{sections[activeSection].description}</p>
                
                <div className={styles.keyFeatures}>
                  {sections[activeSection].keyFeatures.map((feature, index) => (
                    <div key={index} className={styles.keyFeature}>
                      <div className={styles.featureIcon}>
                        {feature.icon}
                      </div>
                      <div className={styles.featureInfo}>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.featureVisual}>
                <div className={styles.visualPlaceholder}>
                  <div className={styles.visualLabel}>
                    <Play size={24} />
                    <span>{sections[activeSection].title} Demo</span>
                  </div>
                  {/* Here you would place the actual GIF or video */}
                </div>
                
                <div className={styles.visualCaption}>
                  {sections[activeSection].visualCaption}
                </div>
              </div>
              
              <div className={styles.technicalDetails}>
                <h3>Technical Details</h3>
                <p>{sections[activeSection].technicalDescription}</p>
                <ul className={styles.technicalList}>
                  {sections[activeSection].technicalPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          
          {/* FAQ Section - Always visible */}
          <section className={styles.faqSection}>
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
          <section className={styles.ctaSection}>
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