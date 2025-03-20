import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import styles from "./PredictedGrades.module.css";

const PredictedGrades = ({ subjects = [], title = "Predicted Grades" }) => {
  const [expandedSubject, setExpandedSubject] = useState(null);

  // Demo subjects if none provided
  const demoSubjects = [
    {
      id: 1,
      name: "Mathematics",
      grade: "A*",
      details:
        "Strong performance in all calculus and algebra topics. Areas for improvement: statistics and probability distributions. Recent assessments show consistent high performance in all areas, with particular strength in calculus applications."
    },
    {
      id: 2,
      name: "Physics",
      grade: "A",
      details:
        "Excellent understanding of mechanics and waves. Focus more on electromagnetic concepts and quantum physics principles. Lab work has been exemplary, with detailed analysis and conclusions."
    },
    {
      id: 3,
      name: "Chemistry",
      grade: "B",
      details:
        "Good grasp of organic chemistry. Needs work on physical chemistry calculations and atomic theory. Recent lab reports show improvement in experimental techniques but require more theoretical background."
    },
    {
      id: 4,
      name: "English Literature",
      grade: "A",
      details:
        "Insightful critical analysis with well-structured arguments. Expand range of quotations and contextual references. Recent essays demonstrate strong understanding of themes and motifs in complex texts."
    }
  ];

  const subjectsToRender = subjects.length > 0 ? subjects : demoSubjects;

  const toggleExpand = (subjectId) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subjectId);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  const expandedVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      
      <LayoutGroup>
        <motion.div className={styles.gridContainer} layout>
          {!expandedSubject && (
            <AnimatePresence>
              {subjectsToRender.map((subject) => (
                <motion.div
                  key={subject.id}
                  layoutId={`card-${subject.id}`}
                  className={styles.gradeCard}
                  onClick={() => toggleExpand(subject.id)}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className={styles.cardContent}>
                    <motion.span 
                      layoutId={`grade-${subject.id}`} 
                      className={styles.grade}
                    >
                      {subject.grade}
                    </motion.span>
                    <motion.span 
                      layoutId={`subject-${subject.id}`} 
                      className={styles.subjectName}
                    >
                      {subject.name}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          <AnimatePresence>
            {expandedSubject && (
              <motion.div
                layoutId={`card-${expandedSubject}`}
                className={styles.expandedCard}
                variants={expandedVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {subjectsToRender
                  .filter((subject) => subject.id === expandedSubject)
                  .map((subject) => (
                    <React.Fragment key={subject.id}>
                      <div className={styles.expandedHeader}>
                        <div className={styles.expandedTitle}>
                          <motion.span 
                            layoutId={`grade-${subject.id}`} 
                            className={styles.expandedGrade}
                          >
                            {subject.grade}
                          </motion.span>
                          <motion.h3 
                            layoutId={`subject-${subject.id}`} 
                            className={styles.expandedSubjectName}
                          >
                            {subject.name}
                          </motion.h3>
                        </div>
                        <motion.button
                          className={styles.closeButton}
                          onClick={() => setExpandedSubject(null)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ×
                        </motion.button>
                      </div>
                      <motion.div 
                        className={styles.detailsContent}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className={styles.details}>{subject.details}</p>
                        <div className={styles.actionButtons}>
                          <motion.button 
                            className={styles.actionButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View Study Materials
                          </motion.button>
                          <motion.button 
                            className={styles.actionButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Track Progress
                          </motion.button>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

export default PredictedGrades;