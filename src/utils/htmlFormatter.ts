import * as prettier from 'prettier';

/**
 * Format HTML using Prettier - similar to LiveCanvas's formatting
 */
export async function formatHtml(html: string): Promise<string> {
  try {
    const formatted = await prettier.format(html, {
      parser: 'html',
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      htmlWhitespaceSensitivity: 'css',
      bracketSameLine: false,
      singleAttributePerLine: false,
    });
    return formatted;
  } catch (error) {
    console.warn('HTML formatting failed:', error);
    return html; // Return original if formatting fails
  }
}

/**
 * Check if Prettier formatting is available
 */
export function isFormatterAvailable(): boolean {
  try {
    return typeof prettier.format === 'function';
  } catch {
    return false;
  }
}

/**
 * Basic fallback formatter for HTML (used if Prettier fails)
 */
export function basicFormatHtml(html: string): string {
  return html
    .replace(/></g, '>\n<') // Add line breaks between tags
    .split('\n')
    .map((line, index, lines) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // Calculate indentation based on tag depth
      const prevLine = lines[index - 1]?.trim() || '';
      const isClosingTag = trimmed.startsWith('</');
      const isOpeningTag = trimmed.startsWith('<') && !trimmed.startsWith('</');
      const isSelfClosing = trimmed.endsWith('/>');
      
      let depth = 0;
      
      // Calculate depth based on previous lines
      for (let i = 0; i < index; i++) {
        const l = lines[i].trim();
        if (l.startsWith('<') && !l.startsWith('</') && !l.endsWith('/>')) {
          depth++; // Opening tag
        } else if (l.startsWith('</')) {
          depth--; // Closing tag
        }
      }
      
      if (isClosingTag) depth--;
      
      const indent = '  '.repeat(Math.max(0, depth));
      return indent + trimmed;
    })
    .filter(line => line.length > 0)
    .join('\n');
}