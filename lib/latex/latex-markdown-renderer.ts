import { parseLatex, ParsedToken } from "./latex-parser"

type MarkdownTokenType =
  | "text"
  | "heading"
  | "bold"
  | "italic"
  | "list-item"
  | "ordered-list-item"
  | "link"
  | "code"
  | "paragraph"
  | "line-break"

interface MarkdownToken {
  type: MarkdownTokenType
  content: string
  level?: number // For headings
  url?: string // For links
}

// Main function to render LaTeX and Markdown
export function renderLatexMarkdown(content: string): string {
  // First, tokenize the content into markdown tokens
  const markdownTokens = tokenizeMarkdown(content)

  // Then render the tokens to HTML
  return renderMarkdownTokens(markdownTokens)
}

// Tokenize the content into markdown tokens
function tokenizeMarkdown(content: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = []
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
    tokens.push({
      type: "paragraph",
      content: line,
    })
  }

  return tokens
}

// Render markdown tokens to HTML
function renderMarkdownTokens(tokens: MarkdownToken[]): string {
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
  // Process math expressions first using the LaTeX parser
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
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')

  return text
}

// Process math expressions using the LaTeX parser
function processMathExpressions(text: string): string {
  const allTokens = parseLatex(text); // Get all tokens (text and math) for the line

  // If parseLatex returns nothing or an empty list (e.g. for empty input string),
  // return text to avoid issues, though parseLatex should ideally handle empty string gracefully.
  if (!allTokens || allTokens.length === 0) {
    return text;
  }

  let processedLine = "";
  for (const token of allTokens) {
    if (token.type === "math") {
      processedLine += renderLatexToken(token); // Append rendered HTML for math
    } else {
      // For non-math tokens (e.g., type "text"), append their original content.
      // This relies on `parseLatex` providing `content` that is the original text segment.
      processedLine += token.content;
    }
  }
  return processedLine;
}

// Component renderers for different LaTeX elements
const latexComponents = {
  fraction: (numerator: string, denominator: string): string => `
    <span class="latex-frac">
      <span class="latex-frac-num">${numerator}</span>
      <span class="latex-frac-line"></span>
      <span class="latex-frac-denom">${denominator}</span>
    </span>
  `,

  sqrt: (content: string, index?: string): string => 
    index ? `
      <span class="latex-root">
        <sup class="latex-root-index">${index}</sup>
        <span class="latex-sqrt-symbol">√</span>
        <span class="latex-sqrt-content">${content}</span>
      </span>
    ` : `
      <span class="latex-sqrt">
        <span class="latex-sqrt-symbol">√</span>
        <span class="latex-sqrt-content">${content}</span>
      </span>
    `,

  operator: (symbol: string, lowerLimit?: string, upperLimit?: string): string => `
    <span class="latex-operator">
      ${upperLimit ? `<span class="latex-upper-limit">${upperLimit}</span>` : ""}
      <span class="latex-operator-symbol">${symbol}</span>
      ${lowerLimit ? `<span class="latex-lower-limit">${lowerLimit}</span>` : ""}
    </span>
  `,

  limit: (content: string): string => `
    <span class="latex-limit">
      lim
      <span class="latex-lower-limit">${content}</span>
    </span>
  `,

  symbol: (symbol: string): string => `
    <span class="latex-symbol">${latexSymbols[symbol] || symbol}</span>
  `,
  
  superscript: (content: string): string => `
    <span class="latex-superscript"><sup>${content}</sup></span>
  `,
  
  subscript: (content: string): string => `
    <span class="latex-subscript"><sub>${content}</sub></span>
  `,
}

// Render a LaTeX token to HTML using the component system
function renderLatexToken(token: ParsedToken): string {
  // Handle null or undefined tokens
  if (!token) return ""
  
  // Handle tokens without children - return content directly
  if (!token.children || token.children.length === 0) {
    return token.content || ""
  }

  switch (token.type) {
    case "math":
      const mathContent = token.children.find(child => child.type === "math-content")
      if (!mathContent) return token.content
      
      const isDisplay = token.content.startsWith("$$")
      const wrapper = isDisplay ? "div" : "span"
      const className = isDisplay ? "math-display" : "math-inline"
      
      return `<${wrapper} class="${className}">${renderLatexToken(mathContent)}</${wrapper}>`

    case "math-content":
      return token.children.map(child => renderLatexToken(child)).join("")

    case "command":
      const commandName = token.children.find(child => child.type === "command-name")?.content
      const args = token.children.filter(child => child.type === "command-args")
      const optArgs = token.children.filter(child => child.type === "command-optional")

      switch (commandName) {
        case "frac":
          if (args.length < 2) return token.content
          // Process argument tokens recursively
          return latexComponents.fraction(
            renderLatexToken(args[0]),
            renderLatexToken(args[1])
          )

        case "sqrt":
          if (args.length < 1) return token.content
          return latexComponents.sqrt(
            renderLatexToken(args[0]),
            optArgs[0] ? renderLatexToken(optArgs[0]) : undefined
          )

        case "sum":
        case "prod":
        case "int":
          const symbol = latexSymbols[commandName] || commandName
          return latexComponents.operator(
            symbol,
            args[0] ? renderLatexToken(args[0]) : undefined,
            args[1] ? renderLatexToken(args[1]) : undefined
          )

        case "lim":
          if (args.length < 1) return token.content
          return latexComponents.limit(renderLatexToken(args[0]))
          
        case "^":
          if (args.length < 1) return token.content
          return latexComponents.superscript(renderLatexToken(args[0]))
          
        case "_":
          if (args.length < 1) return token.content
          return latexComponents.subscript(renderLatexToken(args[0]))

        default:
          // Check if it's a known symbol
          if (commandName && commandName in latexSymbols) {
            return latexComponents.symbol(commandName)
          }
          // Fall back to original content if unknown command
          return token.content
      }

    case "command-args":
    case "command-optional":
      // When processing an argument that might contain nested commands
      // recursively render all its children
      return token.children.map(child => renderLatexToken(child)).join("")

    case "text":
      return token.content

    default:
      // For other token types, recursively process their children
      if (token.children && token.children.length > 0) {
        return token.children.map(child => renderLatexToken(child)).join("")
      }
      return token.content
  }
}

// LaTeX symbol mappings (keep existing symbols)
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
