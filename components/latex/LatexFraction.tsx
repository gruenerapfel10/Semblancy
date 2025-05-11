import React from 'react';

interface LatexFractionProps {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  displayStyle?: boolean;
}

/**
 * A React component for rendering LaTeX-style fractions
 * 
 * The component uses Tailwind CSS to style fractions in a way that mimics LaTeX output
 * displayStyle prop controls whether to use display math style (larger) or inline style
 */
const LatexFraction: React.FC<LatexFractionProps> = ({ 
  numerator, 
  denominator, 
  displayStyle = false 
}) => {
  return (
    <div className={`inline-block align-middle text-center mx-[0.1em] ${displayStyle ? 'latex-displaystyle' : ''}`}>
      <div className={`block text-center ${displayStyle ? 'pb-[0.1em] text-[0.85em]' : ''}`}>
        {numerator}
      </div>
      <div className="block h-[0.08em] bg-current min-w-[0.5em] my-[0.15em]" />
      <div className={`block text-center ${displayStyle ? 'pt-[0.1em] text-[0.85em]' : ''}`}>
        {denominator}
      </div>
    </div>
  );
};

export default LatexFraction; 