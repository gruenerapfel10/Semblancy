import React from 'react';
import { parseLatex, ParsedToken } from '../../lib/latex/latex-parser';
import LatexFraction from './LatexFraction';
import LatexSqrt from './LatexSqrt';
import LatexScript from './LatexScript';
import LatexOperator from './LatexOperator';
import LatexSymbol from './LatexSymbol';

interface LatexFormulaProps {
  formula: string;
  displayMode?: boolean;
}

/**
 * Main component for rendering LaTeX formulas
 * 
 * This component parses the LaTeX formula and renders the appropriate React components
 * It supports both inline and display modes with tailwind styling
 */
const LatexFormula: React.FC<LatexFormulaProps> = ({ 
  formula, 
  displayMode = false 
}) => {
  // Parse the formula
  const tokens = parseLatex(formula);
  
  // Find math content
  const mathTokens = tokens.filter(token => token.type === 'math');
  
  if (mathTokens.length === 0) {
    // No math found, render as text
    return <span>{formula}</span>;
  }
  
  // Process the first math token
  const mathToken = mathTokens[0];
  const mathContent = mathToken.children?.find(child => child.type === 'math-content');
  
  if (!mathContent) {
    return <span>{formula}</span>;
  }
  
  // Determine if it's display math based on the delimiters
  const isDisplayMath = mathToken.content.startsWith('$$') || displayMode;
  
  return (
    <div className={isDisplayMath ? 
      'block text-center my-4 font-serif text-[1.2em]' : 
      'inline-block align-middle font-serif'
    }>
      {renderLatexToken(mathContent, isDisplayMath)}
    </div>
  );
};

/**
 * Recursively render a LaTeX token into React components
 */
function renderLatexToken(token: ParsedToken, displayStyle: boolean): React.ReactNode {
  // Handle null tokens
  if (!token) return null;
  
  // Handle tokens without children
  if (!token.children || token.children.length === 0) {
    return token.content || null;
  }
  
  switch (token.type) {
    case 'math-content':
      return token.children.map((child, index) => 
        <React.Fragment key={index}>
          {renderLatexToken(child, displayStyle)}
        </React.Fragment>
      );
      
    case 'command':
      const commandName = token.children.find(child => child.type === 'command-name')?.content;
      const args = token.children.filter(child => child.type === 'command-args');
      const optArgs = token.children.filter(child => child.type === 'command-optional');
      
      switch (commandName) {
        case 'frac':
          if (args.length < 2) return token.content;
          return (
            <LatexFraction
              numerator={renderLatexToken(args[0], displayStyle)}
              denominator={renderLatexToken(args[1], displayStyle)}
              displayStyle={displayStyle}
            />
          );
          
        case 'sqrt':
          if (args.length < 1) return token.content;
          return (
            <LatexSqrt
              content={renderLatexToken(args[0], displayStyle)}
              index={optArgs[0] ? renderLatexToken(optArgs[0], displayStyle) : undefined}
              displayStyle={displayStyle}
            />
          );
          
        case '^':
          if (args.length < 1) return token.content;
          // Find the base - this is tricky as it might be the previous sibling
          // For simplicity, we'll just use text for now but this should be improved
          return (
            <LatexScript
              base="x" // Placeholder - in a real implementation, find the base
              superscript={renderLatexToken(args[0], displayStyle)}
              displayStyle={displayStyle}
            />
          );
          
        case '_':
          if (args.length < 1) return token.content;
          return (
            <LatexScript
              base="x" // Placeholder - in a real implementation, find the base
              subscript={renderLatexToken(args[0], displayStyle)}
              displayStyle={displayStyle}
            />
          );
          
        default:
          // Check if it's an operator
          if (commandName && ['sum', 'prod', 'int', 'lim'].includes(commandName)) {
            return (
              <LatexOperator
                symbol={commandName}
                upperLimit={args[1] ? renderLatexToken(args[1], displayStyle) : undefined}
                lowerLimit={args[0] ? renderLatexToken(args[0], displayStyle) : undefined}
                displayStyle={displayStyle}
              />
            );
          }
          
          // Check if it's a known symbol
          if (commandName) {
            return <LatexSymbol name={commandName} />;
          }
          
          // Fallback for other commands
          return token.content;
      }
      
    case 'command-args':
    case 'command-optional':
      return token.children.map((child, index) => 
        <React.Fragment key={index}>
          {renderLatexToken(child, displayStyle)}
        </React.Fragment>
      );
      
    case 'text':
      return token.content;
      
    default:
      if (token.children && token.children.length > 0) {
        return token.children.map((child, index) => 
          <React.Fragment key={index}>
            {renderLatexToken(child, displayStyle)}
          </React.Fragment>
        );
      }
      return token.content;
  }
}

export default LatexFormula; 