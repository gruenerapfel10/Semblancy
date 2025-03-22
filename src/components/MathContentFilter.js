import React, { useState } from 'react';
import styles from './MathContentFilter.module.css';

const MathContentFilter = ({ onFilterChange }) => {
  const [examBoard, setExamBoard] = useState('all');
  const [level, setLevel] = useState('all');

  const handleExamBoardChange = (e) => {
    const value = e.target.value;
    setExamBoard(value);
    onFilterChange({ examBoard: value, level });
  };

  const handleLevelChange = (e) => {
    const value = e.target.value;
    setLevel(value);
    onFilterChange({ examBoard: examBoard, level: value });
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGroup}>
        <label htmlFor="exam-board">Exam Board:</label>
        <select 
          id="exam-board" 
          value={examBoard} 
          onChange={handleExamBoardChange}
          className={styles.select}
        >
          <option value="all">All Boards</option>
          <option value="AQA">AQA</option>
          <option value="Edexcel">Edexcel</option>
          <option value="OCR">OCR</option>
        </select>
      </div>
      
      <div className={styles.filterGroup}>
        <label htmlFor="level">Level:</label>
        <select 
          id="level" 
          value={level} 
          onChange={handleLevelChange}
          className={styles.select}
        >
          <option value="all">All Levels</option>
          <option value="AS">AS</option>
          <option value="A2">A2</option>
          <option value="Foundation">Foundation</option>
          <option value="Higher">Higher</option>
        </select>
      </div>
    </div>
  );
};

export default MathContentFilter;