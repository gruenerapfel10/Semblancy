"use client";
import { useState, useEffect } from 'react';
import styles from './vectors-matrices.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowRight, faQuestionCircle, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { MathJax, MathJaxContext } from "better-react-mathjax";
import LatexEditor from '../../../../../components/LaTeX/LatexEditor';

// Function to generate a random matrix
const generateMatrix = (rows, cols, maxVal = 10) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * (2 * maxVal + 1)) - maxVal)
  );
};

// Function to generate a random vector
const generateVector = (size, maxVal = 10) => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (2 * maxVal + 1)) - maxVal);
};

// Convert matrix to LaTeX string
const matrixToLatex = (matrix) => {
  const rows = matrix.map(row => row.join(' & ')).join(' \\\\ ');
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
};

// Convert vector to LaTeX string
const vectorToLatex = (vector) => {
  const elements = vector.join(' \\\\ ');
  return `\\begin{bmatrix} ${elements} \\end{bmatrix}`;
};

export default function VectorsMatricesGame() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // LaTeX help examples
  const latexExamples = [
    {
      type: "Matrix",
      description: "Use \\begin{bmatrix} ... \\end{bmatrix} with & for columns and \\\\ for rows",
      example: "\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{bmatrix}",
      result: "\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{bmatrix}"
    },
    {
      type: "Vector",
      description: "Use \\begin{bmatrix} ... \\end{bmatrix} with \\\\ between elements",
      example: "\\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}",
      result: "\\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}"
    }
  ];

  const questionTypes = [
    'matrix_identification',
    'vector_identification',
    'matrix_dimensions',
    'vector_dimensions'
  ];

  const generateQuestion = () => {
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let question = { type };

    switch (type) {
      case 'matrix_identification':
        const matrix = generateMatrix(2, 3);
        question.matrix = matrix;
        question.prompt = "Given the following matrix, write it in LaTeX format:";
        question.answer = matrixToLatex(matrix);
        break;

      case 'vector_identification':
        const vector = generateVector(3);
        question.vector = vector;
        question.prompt = "Given the following vector, write it in LaTeX format:";
        question.answer = vectorToLatex(vector);
        break;

      case 'matrix_dimensions':
        const dimMatrix = generateMatrix(2, 4);
        question.matrix = dimMatrix;
        question.prompt = "What are the dimensions of this matrix? Answer in the format 'rows×columns'";
        question.answer = `${dimMatrix.length}×${dimMatrix[0].length}`;
        break;

      case 'vector_dimensions':
        const dimVector = generateVector(4);
        question.vector = dimVector;
        question.prompt = "What is the dimension of this vector?";
        question.answer = `${dimVector.length}`;
        break;
    }

    setCurrentQuestion(question);
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    const isCorrect = userAnswer.trim() === currentQuestion.answer.trim();
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? "Correct! Well done!" : `Incorrect. The correct answer is: ${currentQuestion.answer}`
    });
    if (isCorrect) setScore(score + 1);
    setTotalQuestions(totalQuestions + 1);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  return (
    <MathJaxContext>
      <div className={styles.pageContainer}>
        <div className={styles.editorContainer}>
          <LatexEditor 
            value={userAnswer}
            onChange={setUserAnswer}
            placeholder="\\text{Start typing your answer...}"
          />
        </div>

        <div className={styles.gameContainer}>
          <div className={styles.header}>
            <div className={styles.scoreBoard}>
              <span>Score: {score}/{totalQuestions}</span>
            </div>
            <button 
              className={styles.helpButton}
              onClick={() => setShowHelp(!showHelp)}
            >
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span>LaTeX Help</span>
            </button>
          </div>

          {showHelp && (
            <div className={styles.helpPanel}>
              <h3>
                <FontAwesomeIcon icon={faLightbulb} />
                How to Write LaTeX
              </h3>
              <div className={styles.examples}>
                {latexExamples.map((ex, index) => (
                  <div key={index} className={styles.example}>
                    <h4>{ex.type}</h4>
                    <p>{ex.description}</p>
                    <div className={styles.codeExample}>
                      <code>{ex.example}</code>
                    </div>
                    <div className={styles.resultExample}>
                      <span>Renders as:</span>
                      <MathJax>{`\\[${ex.result}\\]`}</MathJax>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.helpTips}>
                <h4>Tips:</h4>
                <ul>
                  <li>Use <code>&</code> to separate columns in matrices</li>
                  <li>Use <code>\\\\</code> to create new rows</li>
                  <li>Spaces between numbers are optional</li>
                  <li>Make sure to match opening and closing brackets</li>
                </ul>
              </div>
            </div>
          )}

          {currentQuestion && (
            <div className={styles.questionContainer}>
              <h2>{currentQuestion.prompt}</h2>
              
              <div className={styles.matrixDisplay}>
                <MathJax>
                  {`\\[${currentQuestion.matrix ? matrixToLatex(currentQuestion.matrix) : 
                         currentQuestion.vector ? vectorToLatex(currentQuestion.vector) : ''}\\]`}
                </MathJax>
              </div>

              <div className={styles.inputContainer}>
                <button 
                  onClick={checkAnswer}
                  className={styles.submitButton}
                >
                  Check Answer
                </button>
              </div>

              {feedback && (
                <div className={`${styles.feedback} ${feedback.correct ? styles.correct : styles.incorrect}`}>
                  <FontAwesomeIcon icon={feedback.correct ? faCheck : faTimes} />
                  <p>{feedback.message}</p>
                </div>
              )}

              <button 
                onClick={generateQuestion}
                className={styles.nextButton}
              >
                Next Question <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
} 