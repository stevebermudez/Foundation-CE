/**
 * Format Lesson Content - Converts plain text to nicely formatted HTML
 * 
 * This utility intelligently formats plain text lesson content into structured HTML
 * with proper headings, paragraphs, lists, and emphasis.
 */

/**
 * Formats plain text content into structured HTML
 */
export function formatTextToHTML(text: string): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  // If content already has HTML tags, return as-is (don't double-format)
  if (text.includes('<') && text.includes('>')) {
    // Check if it's already well-formatted HTML
    if (text.match(/<[hH][1-6]|<[pP]|<[uU][lL]|<[oO][lL]|<[dD][iI][vV]/)) {
      return text;
    }
  }

  let formatted = text.trim();
  
  // Split into lines for processing
  const lines = formatted.split('\n').map(line => line.trim());
  const output: string[] = [];
  
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let currentParagraph: string[] = [];
  
  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const paraText = currentParagraph.join(' ').trim();
      if (paraText.length > 0) {
        // Check if paragraph contains bold patterns
        const bolded = formatBoldText(paraText);
        output.push(`<p>${bolded}</p>`);
      }
      currentParagraph = [];
    }
  }
  
  function flushList() {
    if (listItems.length > 0 && listType) {
      const listTag = listType === 'ul' ? '<ul>' : '<ol>';
      const listCloseTag = listType === 'ul' ? '</ul>' : '</ol>';
      const listHTML = listItems.map(item => {
        const bolded = formatBoldText(item);
        return `  <li>${bolded}</li>`;
      }).join('\n');
      output.push(listTag);
      output.push(listHTML);
      output.push(listCloseTag);
      listItems = [];
      inList = false;
      listType = null;
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    
    // Skip empty lines
    if (line.length === 0) {
      if (inList) {
        flushList();
      } else {
        flushParagraph();
      }
      continue;
    }
    
    // Detect headings - lines that are:
    // 1. All caps and short (likely headings)
    // 2. End with colon and are short-medium length
    // 3. Start with common heading patterns
    const isAllCaps = line === line.toUpperCase() && line.length < 100 && /[A-Z]/.test(line);
    const endsWithColon = line.endsWith(':') && line.length < 150;
    const isHeadingPattern = /^(Part [IVX]+|Chapter \d+|Section \d+|Unit \d+|Lesson \d+)/i.test(line);
    
    if ((isAllCaps || endsWithColon || isHeadingPattern) && line.length < 200) {
      flushList();
      flushParagraph();
      
      // Determine heading level
      let level = 2; // Default to h2
      if (line.startsWith('Part ') || line.startsWith('Chapter ')) {
        level = 2;
      } else if (line.match(/^[A-Z][^:]*:$/) && line.length < 80) {
        level = 3;
      } else if (isAllCaps && line.length < 50) {
        level = 2;
      }
      
      const headingText = formatBoldText(line.replace(/:$/, ''));
      output.push(`<h${level}>${headingText}</h${level}>`);
      continue;
    }
    
    // Detect lists - lines starting with bullets, numbers, or dashes
    const bulletMatch = line.match(/^[•\-\*]\s+(.+)$/);
    const numberMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
    const letterMatch = line.match(/^([a-z])[\.\)]\s+(.+)$/i);
    
    if (bulletMatch) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      listItems.push(bulletMatch[1]);
      continue;
    }
    
    if (numberMatch || letterMatch) {
      flushParagraph();
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      const content = numberMatch ? numberMatch[2] : letterMatch![2];
      listItems.push(content);
      continue;
    }
    
    // Regular paragraph content
    if (inList) {
      flushList();
    }
    
    // Check if this line should start a new paragraph
    // (if it's a complete sentence ending with period, or if next line is empty)
    const isCompleteSentence = /[.!?]$/.test(line);
    const nextIsEmpty = nextLine.length === 0;
    
    if (isCompleteSentence || nextIsEmpty) {
      currentParagraph.push(line);
      flushParagraph();
    } else {
      currentParagraph.push(line);
    }
  }
  
  // Flush any remaining content
  flushList();
  flushParagraph();
  
  return output.join('\n');
}

/**
 * Formats bold text patterns in a string
 * Detects patterns like **text**, *text*, or ALL CAPS words/phrases
 */
function formatBoldText(text: string): string {
  let formatted = text;
  
  // Convert markdown-style bold **text** to <strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert markdown-style italic *text* to <em> (but not if it's part of **text**)
  formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Detect ALL CAPS phrases (3+ words) and make them bold
  formatted = formatted.replace(/\b([A-Z]{2,}(?:\s+[A-Z]{2,}){2,})\b/g, '<strong>$1</strong>');
  
  // Detect patterns like "Type: Description" and bold the type
  formatted = formatted.replace(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\s*/gm, '<strong>$1:</strong> ');
  
  return formatted;
}

/**
 * Enhanced formatting that also handles special patterns
 */
export function formatTextToHTMLEnhanced(text: string): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  // If already HTML, return as-is
  if (text.includes('<h') || text.includes('<p>') || text.includes('<ul>')) {
    return text;
  }

  let formatted = text.trim();
  
  // Clean up common issues from plain text extraction
  formatted = formatted
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')  // Multiple blank lines to double
    .replace(/[ \t]+/g, ' ')  // Multiple spaces to single
    .trim();
  
  // Split into blocks (separated by double newlines)
  const blocks = formatted.split(/\n\n+/);
  const output: string[] = [];
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) continue;
    
    // Check if entire block is a heading
    const firstLine = lines[0];
    const isHeading = (
      (firstLine === firstLine.toUpperCase() && firstLine.length < 100 && /[A-Z]/.test(firstLine)) ||
      (firstLine.endsWith(':') && firstLine.length < 150) ||
      /^(Part [IVX]+|Chapter \d+|Section \d+|Unit \d+|Lesson \d+)/i.test(firstLine)
    );
    
    if (isHeading && lines.length === 1) {
      const level = firstLine.length < 50 ? 2 : 3;
      const headingText = formatBoldText(firstLine.replace(/:$/, ''));
      output.push(`<h${level}>${headingText}</h${level}>`);
      continue;
    }
    
    // Check if block is a list
    const allListItems = lines.every(line => 
      /^[•\-\*]\s+/.test(line) || 
      /^\d+[\.\)]\s+/.test(line) ||
      /^[a-z][\.\)]\s+/i.test(line)
    );
    
    if (allListItems && lines.length > 1) {
      const firstItem = lines[0];
      const isOrdered = /^\d+[\.\)]\s+/.test(firstItem) || /^[a-z][\.\)]\s+/i.test(firstItem);
      const listTag = isOrdered ? '<ol>' : '<ul>';
      const closeTag = isOrdered ? '</ol>' : '</ul>';
      
      output.push(listTag);
      for (const line of lines) {
        const match = line.match(/^[•\-\*\d]+[\.\)]?\s+(.+)$/i);
        if (match) {
          const content = formatBoldText(match[1]);
          output.push(`  <li>${content}</li>`);
        }
      }
      output.push(closeTag);
      continue;
    }
    
    // Regular paragraph(s)
    for (const line of lines) {
      // Check if line is a subheading (ends with colon, short)
      if (line.endsWith(':') && line.length < 100 && !line.includes('.')) {
        const headingText = formatBoldText(line.replace(/:$/, ''));
        output.push(`<h3>${headingText}</h3>`);
      } else {
        const paraText = formatBoldText(line);
        output.push(`<p>${paraText}</p>`);
      }
    }
  }
  
  return output.join('\n');
}

