import React from 'react';

interface LatexSymbolProps {
  name: string;
}

/**
 * A React component for rendering LaTeX symbols
 * 
 * Translates LaTeX symbol names to their Unicode equivalents
 */
const LatexSymbol: React.FC<LatexSymbolProps> = ({ name }) => {
  // Get the symbol from our mapping
  const symbol = latexSymbols[name] || name;
  
  return (
    <span className="inline-block">
      {symbol}
    </span>
  );
};

// LaTeX symbol mappings
export const latexSymbols: Record<string, string> = {
  // Greek letters
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",

  // Capital Greek letters
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",

  // Math operators
  times: "×",
  div: "÷",
  cdot: "·",
  pm: "±",
  mp: "∓",
  leq: "≤",
  geq: "≥",
  neq: "≠",
  approx: "≈",
  equiv: "≡",
  propto: "∝",
  sim: "∼",
  infty: "∞",
  in: "∈",
  notin: "∉",
  subset: "⊂",
  supset: "⊃",
  emptyset: "∅",
  partial: "∂",
  nabla: "∇",
  therefore: "∴",
  forall: "∀",
  exists: "∃",

  // Functions
  sin: "sin",
  cos: "cos",
  tan: "tan",
  ln: "ln",
  log: "log",
  exp: "exp",
  lim: "lim",
  sum: "∑",
  prod: "∏",
  int: "∫",
};

export default LatexSymbol; 