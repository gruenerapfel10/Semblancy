import React from 'react';
import styles from './MathContentModal.module.css';

const MathContentModal = ({ planetId, data }) => {
  // Extract exam board tags into a readable format
  const getExamBoardDisplay = () => {
    if (!data.tags || !Array.isArray(data.tags)) return null;
    
    const boardInfo = data.tags.reduce((acc, tag) => {
      if (tag.examBoard && tag.level && tag.uri) {
        const key = tag.examBoard;
        if (!acc[key]) {
          acc[key] = { levels: new Set(), uris: new Set() };
        }
        
        tag.level.forEach(level => acc[key].levels.add(level));
        tag.uri.forEach(uri => acc[key].uris.add(uri));
      }
      return acc;
    }, {});
    
    return Object.entries(boardInfo).map(([board, info]) => (
      <div key={board} className={styles.examBoard}>
        <h4>{board}</h4>
        <div className={styles.levelContainer}>
          {Array.from(info.levels).map(level => (
            <span key={level} className={styles.levelTag}>{level}</span>
          ))}
        </div>
        <div className={styles.uriList}>
          {Array.from(info.uris).map(uri => (
            <span key={uri} className={styles.uriTag}>{uri}</span>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.contentModal}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Math Learning Objective</h3>
      </div>
      
      <div className={styles.modalContent}>
        <div className={styles.mainPoint}>
          <h4>Learning Objective</h4>
          <p>{data.point}</p>
        </div>
        
        {data.extra && (
          <div className={styles.extraInfo}>
            <h4>Additional Information</h4>
            <p>{data.extra}</p>
          </div>
        )}
        
        <div className={styles.examBoardInfo}>
          <h4>Exam Specifications</h4>
          <div className={styles.boardsContainer}>
            {getExamBoardDisplay()}
          </div>
        </div>
      </div>
      
      <div className={styles.modalFooter}>
        <button className={styles.resourceButton}>
          Study Resources
        </button>
        <button className={styles.practiceButton}>
          Practice Questions
        </button>
      </div>
    </div>
  );
};

export default MathContentModal;