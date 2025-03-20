// app/dashboard/skills/page.js
"use client";
import { useState, useEffect } from "react";
import styles from "./skills.module.css";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faLightbulb,
  faChevronRight,
  faStar,
  faTrophy,
  faCheck,
  faLock,
  faChartLine,
  faCodeBranch,
  faAward,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Skills() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubject, setActiveSubject] = useState("all");
  const [activeSkillSet, setActiveSkillSet] = useState(null);

  // Simulate loading skills data
  useEffect(() => {
    const timer = setTimeout(() => {
      const skillsData = [
        {
          id: 1,
          title: "Mathematics",
          description: "Core mathematical skills and concepts",
          progress: 78,
          totalSkills: 48,
          completedSkills: 37,
          skillSets: [
            {
              id: 101,
              title: "Algebra",
              skills: [
                {
                  id: 1001,
                  name: "Linear Equations",
                  mastery: "A*",
                  isUnlocked: true,
                },
                {
                  id: 1002,
                  name: "Quadratic Equations",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 1003,
                  name: "Simultaneous Equations",
                  mastery: "B",
                  isUnlocked: true,
                },
                {
                  id: 1004,
                  name: "Inequalities",
                  mastery: "C",
                  isUnlocked: true,
                },
                {
                  id: 1005,
                  name: "Algebraic Fractions",
                  mastery: "D",
                  isUnlocked: true,
                },
              ],
            },
            {
              id: 102,
              title: "Calculus",
              skills: [
                {
                  id: 1006,
                  name: "Differentiation",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 1007,
                  name: "Integration",
                  mastery: "B",
                  isUnlocked: true,
                },
                {
                  id: 1008,
                  name: "Applications of Derivatives",
                  mastery: "C",
                  isUnlocked: true,
                },
                {
                  id: 1009,
                  name: "Definite Integrals",
                  mastery: "U",
                  isUnlocked: false,
                },
                {
                  id: 1010,
                  name: "Differential Equations",
                  mastery: "U",
                  isUnlocked: false,
                },
              ],
            },
          ],
        },
        {
          id: 2,
          title: "Physics",
          description: "Essential physics concepts and problem-solving",
          progress: 62,
          totalSkills: 36,
          completedSkills: 22,
          skillSets: [
            {
              id: 201,
              title: "Mechanics",
              skills: [
                {
                  id: 2001,
                  name: "Newton's Laws",
                  mastery: "A*",
                  isUnlocked: true,
                },
                {
                  id: 2002,
                  name: "Projectile Motion",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 2003,
                  name: "Conservation of Energy",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 2004,
                  name: "Circular Motion",
                  mastery: "C",
                  isUnlocked: true,
                },
                {
                  id: 2005,
                  name: "Oscillations",
                  mastery: "U",
                  isUnlocked: false,
                },
              ],
            },
            {
              id: 202,
              title: "Electricity",
              skills: [
                {
                  id: 2006,
                  name: "Electric Fields",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 2007,
                  name: "Circuits",
                  mastery: "B",
                  isUnlocked: true,
                },
                {
                  id: 2008,
                  name: "Capacitance",
                  mastery: "U",
                  isUnlocked: false,
                },
                {
                  id: 2009,
                  name: "Electromagnetism",
                  mastery: "U",
                  isUnlocked: false,
                },
              ],
            },
          ],
        },
        {
          id: 3,
          title: "Chemistry",
          description: "Chemical principles and practical techniques",
          progress: 45,
          totalSkills: 42,
          completedSkills: 19,
          skillSets: [
            {
              id: 301,
              title: "Inorganic Chemistry",
              skills: [
                {
                  id: 3001,
                  name: "Periodic Table",
                  mastery: "A*",
                  isUnlocked: true,
                },
                {
                  id: 3002,
                  name: "Chemical Bonding",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 3003,
                  name: "Redox Reactions",
                  mastery: "B",
                  isUnlocked: true,
                },
                {
                  id: 3004,
                  name: "Group Properties",
                  mastery: "D",
                  isUnlocked: true,
                },
              ],
            },
            {
              id: 302,
              title: "Organic Chemistry",
              skills: [
                {
                    id: 3005,
                    path: "chemical_nomenclature",
                    name: "Chemical Nomenclature",
                    mastery: "A",
                    isUnlocked: true,
                },
                {
                  id: 3005,
                  name: "Functional Groups",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 3006,
                  name: "Reaction Mechanisms",
                  mastery: "C",
                  isUnlocked: true,
                },
                {
                  id: 3007,
                  name: "Synthesis Routes",
                  mastery: "U",
                  isUnlocked: false,
                },
                {
                  id: 3008,
                  name: "Spectroscopy",
                  mastery: "U",
                  isUnlocked: false,
                },
              ],
            },
          ],
        },
        {
          id: 4,
          title: "Biology",
          description: "Biological systems and scientific methods",
          progress: 35,
          totalSkills: 38,
          completedSkills: 13,
          skillSets: [
            {
              id: 401,
              title: "Cell Biology",
              skills: [
                {
                  id: 4001,
                  name: "Cell Structure",
                  mastery: "A*",
                  isUnlocked: true,
                },
                {
                  id: 4002,
                  name: "Cell Division",
                  mastery: "A",
                  isUnlocked: true,
                },
                {
                  id: 4003,
                  name: "Cellular Respiration",
                  mastery: "B",
                  isUnlocked: true,
                },
                {
                  id: 4004,
                  name: "Photosynthesis",
                  mastery: "C",
                  isUnlocked: true,
                },
              ],
            },
            {
              id: 402,
              title: "Genetics",
              skills: [
                {
                  id: 4005,
                  name: "Mendelian Inheritance",
                  mastery: "C",
                  isUnlocked: true,
                },
                {
                  id: 4006,
                  name: "DNA Structure",
                  mastery: "U",
                  isUnlocked: false,
                },
                {
                  id: 4007,
                  name: "Gene Expression",
                  mastery: "U",
                  isUnlocked: false,
                },
                {
                  id: 4008,
                  name: "Genetic Engineering",
                  mastery: "U",
                  isUnlocked: false,
                },
              ],
            },
          ],
        },
      ];

      setSkills(skillsData);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter skills based on search term and active subject
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubject =
      activeSubject === "all" || skill.title === activeSubject;

    return matchesSearch && matchesSubject;
  });

  // Get unique subjects for filter
  const subjects = ["all", ...skills.map((skill) => skill.title)];

  // Handle skill set selection
  const handleSkillSetSelect = (skill, skillSet) => {
    if (activeSkillSet && activeSkillSet.id === skillSet.id) {
      setActiveSkillSet(null);
    } else {
      setActiveSkillSet(skillSet);
    }
  };

  // Navigate to skill page
  const navigateToSkill = (skillName) => {
    // Convert the skill name to a URL-friendly format
    const formattedSkillName = skillName.toLowerCase().replace(/\s+/g, "_");
    router.push(`/dashboard/skills/${formattedSkillName}`);
  };

  // Get color for grade
  const getGradeColor = (grade) => {
    switch (grade) {
      case "A*":
        return styles.gradeAstar;
      case "A":
        return styles.gradeA;
      case "B":
        return styles.gradeB;
      case "C":
        return styles.gradeC;
      case "D":
        return styles.gradeD;
      case "E":
        return styles.gradeE;
      case "U":
        return styles.gradeU;
      default:
        return styles.gradeU;
    }
  };

  // Get icon for grade
  const getGradeIcon = (grade) => {
    if (grade === "A*" || grade === "A") return faTrophy;
    if (grade === "B") return faAward;
    if (grade === "C" || grade === "D") return faBolt;
    if (grade === "E" || grade === "U") return faCodeBranch;
    return faCodeBranch;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Skills Mastery</h1>
        <p className={styles.subtitle}>
          Track your progress and master key concepts across subjects
        </p>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search skills..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.subjectFilter}>
          <div className={styles.filterLabel}>
            <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
            <span>Subject:</span>
          </div>
          <select
            className={styles.filterSelect}
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
          >
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>
                {subject === "all" ? "All Subjects" : subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner text="Loading your skills..." />
        ) : (
          <div className={styles.skillsGrid}>
            {filteredSkills.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <FontAwesomeIcon icon={faLightbulb} />
                </div>
                <h3>No skills found</h3>
                <p>Try adjusting your search criteria.</p>
              </div>
            ) : (
              filteredSkills.map((skill) => (
                <div key={skill.id} className={styles.skillSubject}>
                  <div className={styles.skillHeader}>
                    <div className={styles.skillInfo}>
                      <h3 className={styles.skillTitle}>{skill.title}</h3>
                      <p className={styles.skillDescription}>
                        {skill.description}
                      </p>
                    </div>

                    <div className={styles.skillProgress}>
                      <div className={styles.progressStats}>
                        <span className={styles.progressPercent}>
                          {skill.progress}%
                        </span>
                        <span className={styles.progressDetails}>
                          {skill.completedSkills}/{skill.totalSkills} skills
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.skillSets}>
                    {skill.skillSets.map((skillSet) => (
                      <div
                        key={skillSet.id}
                        className={styles.skillSetContainer}
                      >
                        <div
                          className={`${styles.skillSetHeader} ${
                            activeSkillSet && activeSkillSet.id === skillSet.id
                              ? styles.skillSetActive
                              : ""
                          }`}
                          onClick={() => handleSkillSetSelect(skill, skillSet)}
                        >
                          <h4 className={styles.skillSetTitle}>
                            <FontAwesomeIcon
                              icon={faCodeBranch}
                              className={styles.skillSetIcon}
                            />
                            {skillSet.title}
                          </h4>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className={`${styles.chevronIcon} ${
                              activeSkillSet &&
                              activeSkillSet.id === skillSet.id
                                ? styles.chevronActive
                                : ""
                            }`}
                          />
                        </div>

                        {activeSkillSet &&
                          activeSkillSet.id === skillSet.id && (
                            <div className={styles.skillList}>
                              {skillSet.skills.map((item) => (
                                <div
                                  key={item.id}
                                  className={`${styles.skillItem} ${
                                    !item.isUnlocked ? styles.skillLocked : ""
                                  }`}
                                >
                                  <div className={styles.skillItemInfo}>
                                    {item.isUnlocked ? (
                                      <>
                                        <div className={styles.skillName}>
                                          {item.name}
                                        </div>
                                        <div className={styles.skillMastery}>
                                          <div
                                            className={`${
                                              styles.gradeLabel
                                            } ${getGradeColor(item.mastery)}`}
                                          >
                                            <FontAwesomeIcon
                                              icon={getGradeIcon(item.mastery)}
                                              className={styles.gradeIcon}
                                            />
                                            {item.mastery}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className={styles.skillName}>
                                          <FontAwesomeIcon
                                            icon={faLock}
                                            className={styles.lockIcon}
                                          />
                                          {item.name}
                                        </div>
                                        <div className={styles.skillMastery}>
                                          <div
                                            className={`${styles.gradeLabel} ${styles.gradeU}`}
                                          >
                                            U
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  <div className={styles.skillItemActions}>
                                    {item.isUnlocked ? (
                                      item.mastery === "A*" ? (
                                        <div className={styles.masteryComplete}>
                                          <FontAwesomeIcon icon={faCheck} />
                                          <span>Mastered</span>
                                        </div>
                                      ) : (
                                        <button
                                          className={styles.practiceButton}
                                          onClick={() =>
                                            navigateToSkill(item.path)
                                          }
                                        >
                                          <span>Practice</span>
                                        </button>
                                      )
                                    ) : (
                                      <button className={styles.unlockButton}>
                                        <span>Unlock</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
