import React from 'react';

interface LatexScriptProps {
  base: React.ReactNode;
  superscript?: React.ReactNode;
  subscript?: React.ReactNode;
  displayStyle?: boolean;
}

/**
 * A React component for rendering LaTeX-style superscripts and subscripts
 * 
 * Can render superscript, subscript, or both together
 * displayStyle prop controls whether to use display math style (larger) or inline style
 */
const LatexScript: React.FC<LatexScriptProps> = ({ 
  base, 
  superscript, 
  subscript, 
  displayStyle = false 
}) => {
  return (
    <div className={`inline-flex items-center relative ${displayStyle ? 'text-[1.1em]' : ''}`}>
      <div className="inline-block">
        {base}
      </div>
      
      {superscript && (
        <div className={`inline-block align-super text-${displayStyle ? '[0.7em]' : '[0.6em]'} relative -top-[0.5em] leading-[1em] ml-[0.05em]`}>
          {superscript}
        </div>
      )}
      
      {subscript && (
        <div className={`inline-block align-sub text-${displayStyle ? '[0.7em]' : '[0.6em]'} relative -bottom-[0.3em] leading-[1em] ml-[0.05em]`}>
          {subscript}
        </div>
      )}
    </div>
  );
};

export default LatexScript; 