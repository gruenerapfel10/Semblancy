"use client";
import { useState } from 'react';
import styles from './latex-dev.module.css';
import LatexEditor from '../../components/LaTeX/LatexEditor';

export default function LatexDevPage() {
  const [value, setValue] = useState('');
  const [showRaw, setShowRaw] = useState(true);

  const testCases = [
    {
      name: "Matrix",
      latex: "\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{bmatrix}",
      description: "Basic 2x3 matrix"
    },
    {
      name: "Vector",
      latex: "\\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}",
      description: "Column vector"
    },
    {
      name: "Fraction",
      latex: "\\frac{1}{2}",
      description: "Simple fraction"
    },
    {
      name: "Complex Expression",
      latex: "\\frac{\\sqrt{2}}{\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}}",
      description: "Complex nested expression"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>LaTeX Editor Development</h1>
        <div className={styles.controls}>
          <label>
            <input
              type="checkbox"
              checked={showRaw}
              onChange={(e) => setShowRaw(e.target.checked)}
            />
            Show Raw LaTeX
          </label>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.editorSection}>
          <h2>Editor</h2>
          <LatexEditor
            value={value}
            onChange={setValue}
            placeholder="\\text{Start typing LaTeX...}"
          />
        </div>

        <div className={styles.testSection}>
          <h2>Test Cases</h2>
          <div className={styles.testCases}>
            {testCases.map((test, index) => (
              <div key={index} className={styles.testCase}>
                <h3>{test.name}</h3>
                <p>{test.description}</p>
                <button
                  onClick={() => setValue(test.latex)}
                  className={styles.testButton}
                >
                  Load Test
                </button>
                {showRaw && (
                  <pre className={styles.rawLatex}>
                    {test.latex}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.debugSection}>
          <h2>Debug Information</h2>
          <div className={styles.debugInfo}>
            <h3>Current Value</h3>
            {showRaw && (
              <pre className={styles.rawLatex}>
                {value || '\\text{No content}'}
              </pre>
            )}
            <h3>Length: {value.length}</h3>
            <h3>Contains Matrix: {value.includes('\\begin{bmatrix}') ? 'Yes' : 'No'}</h3>
            <h3>Contains Fraction: {value.includes('\\frac') ? 'Yes' : 'No'}</h3>
          </div>
        </div>
      </div>
    </div>
  );
} 