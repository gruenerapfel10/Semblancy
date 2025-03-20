"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";
import { useSearch } from "@/app/context/SearchContext";
import { SearchIndicator } from "@/components/SearchTrigger";
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
} from "lucide-react";

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

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate in elements on page load
  useEffect(() => {
    setIsVisible(true);

    // Observer for scroll animations
    // Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Fix: Add the correct class name from your CSS
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(`.${styles.animateOnScroll}`);
    elements.forEach((el) => observer.observe(el));

    // Animated counter for statistics
    const targetStats = { students: 25000, questions: 50000, subjects: 15 };
    const duration = 2000; // 2 seconds
    const frameRate = 60; // frames per second
    const frames = duration / (1000 / frameRate);
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / frames;

      if (frame <= frames) {
        setCountStats({
          students: Math.floor(targetStats.students * progress),
          questions: Math.floor(targetStats.questions * progress),
          subjects: Math.floor(targetStats.subjects * progress),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000 / frameRate);

    return () => {
      clearInterval(interval);
      elements.forEach((el) => observer.unobserve(el));
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
      <div className={styles.backgroundElements}>
        <div
          className={`${styles.sphere} ${styles.sphere1}`}
          style={{
            transform: `translate3d(${scrollY * 0.05}px, ${
              -scrollY * 0.03
            }px, 0)`,
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere2}`}
          style={{
            transform: `translate3d(${-scrollY * 0.07}px, ${
              scrollY * 0.04
            }px, 0)`,
          }}
        ></div>
        <div
          className={`${styles.sphere} ${styles.sphere3}`}
          style={{
            transform: `translate3d(${scrollY * 0.09}px, ${
              scrollY * 0.02
            }px, 0)`,
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
            Master Your <span className={styles.highlight}>GCSEs</span> with
            Advanced AI <span className={styles.highlight}>Simulation</span>
          </h1>

          <p className={styles.heroSubtitle}>
            The ultimate platform for GCSE success, using AI-powered analytics
            and personalized study plans to maximize your grades and build
            confidence.
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
          <div className={styles.glassCard}>
            <div className={styles.glassCardHeader}>
              <div className={styles.subjectLabel}>Your Subjects</div>
              <div className={styles.viewAllLink}>View all</div>
            </div>

            <div className={styles.gradesGrid}>
              {subjects.slice(0, 6).map((subject, index) => (
                <div
                  key={index}
                  className={styles.gradeCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.subjectName}>{subject.name}</div>
                  <div
                    className={`${styles.gradeLabel} ${
                      styles[`grade${subject.grade.replace("*", "Star")}`]
                    }`}
                  >
                    {subject.grade}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.progressRing}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  className={styles.progressBackground}
                  cx="60"
                  cy="60"
                  r="54"
                  strokeDasharray="339.29"
                  strokeDashoffset="0"
                />
                <circle
                  className={styles.progressValue}
                  cx="60"
                  cy="60"
                  r="54"
                  strokeDasharray="339.29"
                  strokeDashoffset="84.82" // 339.29 * 0.25 = 84.82 (75% completion)
                />
              </svg>
              <div className={styles.progressContent}>
                <div className={styles.progressPercentage}>
                  75<span>%</span>
                </div>
                <div className={styles.progressLabel}>
                  Overall
                  <br />
                  Progress
                </div>
              </div>
            </div>
          </div>

          <div className={styles.floatingChart}>
            <div className={styles.chartHeader}>Weekly Progress</div>
            <div className={styles.chartBars}>
              <div className={styles.chartBar} style={{ height: "45%" }}>
                <span className={styles.tooltip}>Mon</span>
              </div>
              <div className={styles.chartBar} style={{ height: "65%" }}>
                <span className={styles.tooltip}>Tue</span>
              </div>
              <div className={styles.chartBar} style={{ height: "55%" }}>
                <span className={styles.tooltip}>Wed</span>
              </div>
              <div className={styles.chartBar} style={{ height: "80%" }}>
                <span className={styles.tooltip}>Thu</span>
              </div>
              <div className={styles.chartBar} style={{ height: "70%" }}>
                <span className={styles.tooltip}>Fri</span>
              </div>
              <div className={styles.chartBar} style={{ height: "40%" }}>
                <span className={styles.tooltip}>Sat</span>
              </div>
              <div className={styles.chartBar} style={{ height: "30%" }}>
                <span className={styles.tooltip}>Sun</span>
              </div>
            </div>
          </div>

          <div className={styles.floatingBadge}>
            <Award className={styles.badgeIcon} />
            <div className={styles.badgeText}>Top 5% in Mathematics</div>
          </div>
        </div>
      </section>

      <section
        ref={statsRef}
        className={`${styles.statsSection} ${styles.animateOnScroll}`}
      >
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
      <section
        className={`${styles.howItWorksSection} ${styles.animateOnScroll}`}
      >
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
      <section
        ref={featuresRef}
        className={`${styles.featuresSection} ${styles.animateOnScroll}`}
      >
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
      <section
        ref={testimonialsRef}
        className={`${styles.testimonialsSection} ${styles.animateOnScroll}`}
      >
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
      <section
        ref={ctaRef}
        className={`${styles.ctaSection} ${styles.animateOnScroll}`}
      >
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
