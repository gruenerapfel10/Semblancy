import React from "react";
import styles from "./MathContentModal.module.css";

const MathContentModal = ({ planetId, data, filters }) => {
  // Extract exam board tags into a readable format
  const RenderPoints = () => {
    const levels = data.levels;
    const relevantLevel = levels.filter(
      (level) =>
        level.exam_board == filters.exam_board && level.level == filters.level
    );

    console.log(levels, relevantLevel);

    return relevantLevel.map((level) => {
      return level.points.map((point, index) => {
        console.log(point);

        return (
          <div
            key={`${filters.examBoard}-${filters.level}-${planetId}-${index}`}
            className={styles.examBoard}
          >
            {point}
          </div>
        );
      });
    });
  };

  return (
    <div className={styles.contentModal}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Math Learning Objective</h3>
      </div>

      <div className={styles.modalContent}>
        <RenderPoints />
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.resourceButton}>Study Resources</button>
        <button className={styles.practiceButton}>Practice Questions</button>
      </div>
    </div>
  );
};

export default MathContentModal;
