import React from 'react';
import { parseLatex, ParsedToken } from "./latex-parser";
import { LatexFormula } from '../../components/latex';

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

// Process math expressions using the LaTeX parser and React components
function processMathExpressions(text: string): string {
  // Parse the entire text to get math environments
  const tokens = parseLatex(text)
  
  // Replace each math environment with its rendered HTML
  let result = text
  let offset = 0

  for (const token of tokens) {
    if (token.type === "math") {
      // Use the LatexFormula component to render the math
      const isDisplay = token.content.startsWith("$$");
      
      // Create a placeholder for client-side rendering
      // We'll use a data attribute to store the formula for client-side processing
      const placeholder = `<span class="latex-formula" data-formula="${token.content.replace(/"/g, '&quot;')}" data-display="${isDisplay}"></span>`;
      
      // Replace in the text
      const beforeMath = result.substring(0, token.start + offset);
      const afterMath = result.substring(token.end + offset);
      result = beforeMath + placeholder + afterMath;
      offset += placeholder.length - (token.end - token.start);
    }
  }

  return result;
} 