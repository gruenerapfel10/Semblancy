type TokenType =
  | "text"
  | "heading"
  | "bold"
  | "italic"
  | "list-item"
  | "ordered-list-item"
  | "link"
  | "code"
  | "math-inline"
  | "math-display"
  | "paragraph"
  | "line-break"

interface Token {
  type: TokenType
  content: string
  level?: number // For headings
  url?: string // For links
}

// Main function to render LaTeX and Markdown
export function renderLatexMarkdown(content: string): string {
  // First, tokenize the content
  const tokens = tokenize(content)

  // Then render the tokens to HTML
  return renderTokens(tokens)
}

// Tokenize the content into a structured format
function tokenize(content: string): Token[] {
  const tokens: Token[] = []
  const lines = content.split("\n")

  let inOrderedList = false
  let inUnorderedList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty lines
    if (line.trim() === "") {
      if (i < lines.length - 1 && lines[i + 1].trim() !== "") {
        tokens.push({ type: "paragraph", content: "" })
      }
      continue
    }

    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      tokens.push({
        type: "heading",
        content: headingMatch[2],
        level: headingMatch[1].length,
      })
      continue
    }

    // Check for unordered list items
    const unorderedListMatch = line.match(/^(\s*)-\s+(.+)$/)
    if (unorderedListMatch) {
      if (!inUnorderedList) {
        inUnorderedList = true
        inOrderedList = false
      }
      tokens.push({
        type: "list-item",
        content: unorderedListMatch[2],
      })
      continue
    } else {
      inUnorderedList = false
    }

    // Check for ordered list items
    const orderedListMatch = line.match(/^(\s*)\d+\.\s+(.+)$/)
    if (orderedListMatch) {
      if (!inOrderedList) {
        inOrderedList = true
        inUnorderedList = false
      }
      tokens.push({
        type: "ordered-list-item",
        content: orderedListMatch[2],
      })
      continue
    } else {
      inOrderedList = false
    }

    // If we reach here, it's a regular paragraph
    // Process inline formatting and math within the paragraph
    tokens.push({
      type: "paragraph",
      content: line,
    })
  }

  return tokens
}

// Render tokens to HTML
function renderTokens(tokens: Token[]): string {
  let html = ""
  let inUnorderedList = false
  let inOrderedList = false

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    switch (token.type) {
      case "heading":
        html += `<h${token.level}>${processInlineFormatting(token.content)}</h${token.level}>`
        break

      case "list-item":
        if (!inUnorderedList) {
          html += "<ul>"
          inUnorderedList = true
        }
        html += `<li>${processInlineFormatting(token.content)}</li>`

        // Check if this is the last list item
        if (i === tokens.length - 1 || tokens[i + 1].type !== "list-item") {
          html += "</ul>"
          inUnorderedList = false
        }
        break

      case "ordered-list-item":
        if (!inOrderedList) {
          html += "<ol>"
          inOrderedList = true
        }
        html += `<li>${processInlineFormatting(token.content)}</li>`

        // Check if this is the last list item
        if (i === tokens.length - 1 || tokens[i + 1].type !== "ordered-list-item") {
          html += "</ol>"
          inOrderedList = false
        }
        break

      case "paragraph":
        if (token.content === "") {
          html += "<br>"
        } else {
          html += `<p>${processInlineFormatting(token.content)}</p>`
        }
        break

      default:
        html += processInlineFormatting(token.content)
    }
  }

  return html
}

// Process inline formatting (bold, italic, code, links, and math)
function processInlineFormatting(text: string): string {
  // Process math expressions first
  text = processMathExpressions(text)

  // Process bold text
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  text = text.replace(/__(.+?)__/g, "<strong>$1</strong>")

  // Process italic text
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>")
  text = text.replace(/_(.+?)_/g, "<em>$1</em>")

  // Process inline code
  text = text.replace(/`(.+?)`/g, "<code>$1</code>")

  // Process links
  text = text.replace(/\[(.+?)\]$$(.+?)$$/g, '<a href="$2">$1</a>')

  return text
}

// Process math expressions (both inline and display)
function processMathExpressions(text: string): string {
  // Process display math ($$...$$)
  text = text.replace(/\$\$(.*?)\$\$/g, (match, p1) => {
    return `<div class="math-display">${renderLatexExpression(p1)}</div>`
  })

  // Process inline math ($...$)
  text = text.replace(/\$([^$]+?)\$/g, (match, p1) => {
    return `<span class="math-inline">${renderLatexExpression(p1)}</span>`
  })

  return text
}

// LaTeX symbol mappings
const latexSymbols: Record<string, string> = {
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
}

// Interface for LaTeX command renderers
interface LatexCommandRenderer {
  canRender(command: string): boolean
  render(command: string, args: string[], options?: string): string
}

// Fraction renderer
const fractionRenderer: LatexCommandRenderer = {
  canRender(command: string): boolean {
    return command === "frac"
  },
  render(command: string, args: string[]): string {
    if (args.length < 2) return `\\${command}{${args.join("}{")}}` // Return as-is if not enough args

    const numerator = renderLatexExpression(args[0])
    const denominator = renderLatexExpression(args[1])

    return `<span class="latex-frac">
      <span class="latex-frac-num">${numerator}</span>
      <span class="latex-frac-line"></span>
      <span class="latex-frac-denom">${denominator}</span>
    </span>`
  },
}

// Square root renderer
const sqrtRenderer: LatexCommandRenderer = {
  canRender(command: string): boolean {
    return command === "sqrt"
  },
  render(command: string, args: string[], options?: string): string {
    if (args.length < 1) return `\\${command}{${args.join("}{")}}` // Return as-is if not enough args

    const content = renderLatexExpression(args[0])

    if (options) {
      // This is an nth root
      const rootIndex = renderLatexExpression(options)
      return `<span class="latex-root">
        <sup class="latex-root-index">${rootIndex}</sup>
        <span class="latex-sqrt-symbol">√</span>
        <span class="latex-sqrt-content">${content}</span>
      </span>`
    } else {
      // This is a square root
      return `<span class="latex-sqrt">
        <span class="latex-sqrt-symbol">√</span>
        <span class="latex-sqrt-content">${content}</span>
      </span>`
    }
  },
}

// Sum, product, integral renderer
const operatorRenderer: LatexCommandRenderer = {
  canRender(command: string): boolean {
    return ["sum", "prod", "int"].includes(command)
  },
  render(command: string, args: string[]): string {
    const symbolMap: Record<string, string> = {
      sum: "∑",
      prod: "∏",
      int: "∫",
    }

    const symbol = symbolMap[command] || command

    // Check if we have limits
    if (args.length >= 2) {
      const lowerLimit = renderLatexExpression(args[0])
      const upperLimit = args.length > 1 ? renderLatexExpression(args[1]) : ""

      return `<span class="latex-operator">
        ${upperLimit ? `<span class="latex-upper-limit">${upperLimit}</span>` : ""}
        <span class="latex-operator-symbol">${symbol}</span>
        <span class="latex-lower-limit">${lowerLimit}</span>
      </span>`
    } else if (args.length === 1) {
      // Only lower limit
      const lowerLimit = renderLatexExpression(args[0])

      return `<span class="latex-operator">
        <span class="latex-operator-symbol">${symbol}</span>
        <span class="latex-lower-limit">${lowerLimit}</span>
      </span>`
    } else {
      // No limits
      return `<span class="latex-operator">
        <span class="latex-operator-symbol">${symbol}</span>
      </span>`
    }
  },
}

// Limit renderer
const limitRenderer: LatexCommandRenderer = {
  canRender(command: string): boolean {
    return command === "lim"
  },
  render(command: string, args: string[]): string {
    if (args.length < 1) return "lim" // Return as-is if no args

    const limit = renderLatexExpression(args[0])

    return `<span class="latex-limit">
      lim
      <span class="latex-lower-limit">${limit}</span>
    </span>`
  },
}

// Symbol renderer
const symbolRenderer: LatexCommandRenderer = {
  canRender(command: string): boolean {
    return command in latexSymbols
  },
  render(command: string): string {
    return `<span class="latex-symbol">${latexSymbols[command]}</span>`
  },
}

// Collection of all renderers
const commandRenderers: LatexCommandRenderer[] = [
  fractionRenderer,
  sqrtRenderer,
  operatorRenderer,
  limitRenderer,
  symbolRenderer,
]

// Render a LaTeX expression to HTML
function renderLatexExpression(expr: string): string {
  if (!expr) return "" // Handle empty expressions

  let html = '<span class="latex-expression">'

  // Process LaTeX commands
  let i = 0
  while (i < expr.length) {
    if (expr[i] === "\\") {
      // This is a LaTeX command
      i++
      let command = ""

      // Extract the command name
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        command += expr[i]
        i++
      }

      // Extract optional argument if present
      let optionalArg = ""
      if (i < expr.length && expr[i] === "[") {
        const { content, newIndex } = extractBracketContent(expr, i)
        optionalArg = content
        i = newIndex
      }

      // Extract arguments
      const args: string[] = []
      while (i < expr.length && expr[i] === "{") {
        const { content, newIndex } = extractBraceContent(expr, i)
        args.push(content)
        i = newIndex
      }

      // Find a renderer for this command
      let rendered = false
      for (const renderer of commandRenderers) {
        if (renderer.canRender(command)) {
          html += renderer.render(command, args, optionalArg)
          rendered = true
          break
        }
      }

      // If no renderer found, just output the command as-is
      if (!rendered) {
        html += `\\${command}`
        for (const arg of args) {
          html += `{${arg}}`
        }
      }
    } else if (expr[i] === "^") {
      // Superscript
      i++
      let superscript = ""

      if (i < expr.length && expr[i] === "{") {
        const { content, newIndex } = extractBraceContent(expr, i)
        superscript = content
        i = newIndex
      } else if (i < expr.length) {
        // Handle single character superscripts
        superscript = expr[i]
        i++
      } else {
        // Handle case where ^ is at the end of the string
        html += "^"
        break
      }

      html += `<sup class="latex-superscript">${renderLatexExpression(superscript)}</sup>`
    } else if (expr[i] === "_") {
      // Subscript
      i++
      let subscript = ""

      if (i < expr.length && expr[i] === "{") {
        const { content, newIndex } = extractBraceContent(expr, i)
        subscript = content
        i = newIndex
      } else if (i < expr.length) {
        // Handle single character subscripts
        subscript = expr[i]
        i++
      } else {
        // Handle case where _ is at the end of the string
        html += "_"
        break
      }

      html += `<sub class="latex-subscript">${renderLatexExpression(subscript)}</sub>`
    } else {
      // Regular character
      html += expr[i]
      i++
    }
  }

  html += "</span>"
  return html
}

// Helper function to extract content inside braces
function extractBraceContent(text: string, startIndex: number): { content: string; newIndex: number } {
  if (text[startIndex] !== "{") {
    return { content: "", newIndex: startIndex }
  }

  let braceLevel = 1
  let content = ""
  let i = startIndex + 1

  while (i < text.length && braceLevel > 0) {
    if (text[i] === "{") {
      braceLevel++
    } else if (text[i] === "}") {
      braceLevel--
    }

    if (braceLevel > 0) {
      content += text[i]
    }

    i++
  }

  return { content, newIndex: i }
}

// Helper function to extract content inside brackets
function extractBracketContent(text: string, startIndex: number): { content: string; newIndex: number } {
  if (text[startIndex] !== "[") {
    return { content: "", newIndex: startIndex }
  }

  let bracketLevel = 1
  let content = ""
  let i = startIndex + 1

  while (i < text.length && bracketLevel > 0) {
    if (text[i] === "[") {
      bracketLevel++
    } else if (text[i] === "]") {
      bracketLevel--
    }

    if (bracketLevel > 0) {
      content += text[i]
    }

    i++
  }

  return { content, newIndex: i }
}
