import React from 'react';

interface LatexFractionProps {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  displayStyle?: boolean;
  nestingLevel?: number; // Track fraction nesting level for scaling
}

/**
 * A React component for rendering LaTeX-style fractions
 * 
 * Implements MathJax-like structure and styling for high-quality fraction display
 * with special handling for nested fractions through automatic scaling
 */
const LatexFraction: React.FC<LatexFractionProps> = ({ 
  numerator, 
  denominator, 
  displayStyle = false,
  nestingLevel = 0
}) => {
  // Calculate scaling factor based on nesting level
  // First level (nestingLevel=0) keeps 100% size
  // Each nesting level reduces font size proportionally
  const scaleFactor = Math.max(0.85 - (nestingLevel * 0.1), 0.5);
  
  // Set a class that will be used to detect nesting in CSS
  const nestingClass = `fraction-nesting-${nestingLevel}`;

  return (
    <div className="relative font-bold " style={{ fontSize: `${scaleFactor * 100}%` }}>
      <div className="relative px-[0.3em] text-center leading-[1.1] min-h-0">{numerator}</div>
      <div className="w-full h-[1px] bg-current my-[0.05em]"></div>
      <div className="relative px-[0.3em] text-center leading-[1.1] min-h-0">{denominator}</div>
    </div>
  );
};

export default LatexFraction; 