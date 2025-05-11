import React from 'react';

interface LatexSqrtProps {
  content: React.ReactNode;
  index?: React.ReactNode;
  displayStyle?: boolean;
}

/**
 * A React component for rendering LaTeX-style square roots
 * 
 * The component handles both simple square roots and nth roots with indices
 * displayStyle prop controls whether to use display math style (larger) or inline style
 */
const LatexSqrt: React.FC<LatexSqrtProps> = ({ 
  content, 
  index, 
  displayStyle = false 
}) => {
  if (index) {
    return (
      <div className={`inline-block align-middle relative mx-[0.1em] ${displayStyle ? 'text-[1.1em]' : ''}`}>
        <div className="absolute top-0 left-0 text-[0.7em] -translate-y-[80%]">
          {index}
        </div>
        <div className="inline-block align-top transform scale-x-100 scale-y-120 mr-[0.05em]">√</div>
        <div className="inline-block border-t border-current pt-[0.05em] pr-[0.2em]">
          {content}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`inline-block align-middle mx-[0.1em] ${displayStyle ? 'text-[1.1em]' : ''}`}>
      <div className="inline-block align-top transform scale-x-100 scale-y-120 mr-[0.05em]">√</div>
      <div className="inline-block border-t border-current pt-[0.05em] pr-[0.2em]">
        {content}
      </div>
    </div>
  );
};

export default LatexSqrt; 