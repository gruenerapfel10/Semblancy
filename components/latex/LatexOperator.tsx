import React from 'react';

interface LatexOperatorProps {
  symbol: string;
  upperLimit?: React.ReactNode;
  lowerLimit?: React.ReactNode;
  displayStyle?: boolean;
}

/**
 * A React component for rendering LaTeX-style operators
 * 
 * Renders math operators like sum, product, integral with optional limits
 * displayStyle prop controls whether to use display math style (larger) or inline style
 */
const LatexOperator: React.FC<LatexOperatorProps> = ({ 
  symbol, 
  upperLimit, 
  lowerLimit, 
  displayStyle = false 
}) => {
  // Map some common operator names to their symbols
  const symbolMap: Record<string, string> = {
    sum: '∑',
    prod: '∏',
    int: '∫',
    lim: 'lim',
    // Add more as needed
  };

  // Get the symbol to display
  const displaySymbol = symbolMap[symbol] || symbol;

  // In display style, limits appear above and below
  // In inline style, limits appear as subscripts and superscripts
  if (displayStyle) {
    return (
      <div className="inline-block text-center align-middle mx-[0.22em]">
        {upperLimit && (
          <div className="block text-center text-[0.7em] leading-[1em]">
            {upperLimit}
          </div>
        )}
        <div className="block text-center leading-[1] text-[1.3em]">
          {displaySymbol}
        </div>
        {lowerLimit && (
          <div className="block text-center text-[0.7em] leading-[1em]">
            {lowerLimit}
          </div>
        )}
      </div>
    );
  } else {
    // Inline style: display limits as subscripts and superscripts
    return (
      <div className="inline-flex items-center mx-[0.22em]">
        <div className="inline-block">
          <span>{displaySymbol}</span>
          {upperLimit && (
            <sup className="text-[0.7em] relative -top-[0.5em]">
              {upperLimit}
            </sup>
          )}
          {lowerLimit && (
            <sub className="text-[0.7em] relative -bottom-[0.3em]">
              {lowerLimit}
            </sub>
          )}
        </div>
      </div>
    );
  }
};

export default LatexOperator; 