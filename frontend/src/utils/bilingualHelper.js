/**
 * Clean and normalize text encoding issues
 */
function normalizeText(text) {
  if (!text) return ''
  // Ensure proper UTF-8 handling
  return String(text)
}

/**
 * Split bilingual content (Format: "中文 \n\n---\n\n English")
 * @param {string} content - The original content with both languages
 * @param {string} lang - 'zh' for Chinese or 'en' for English
 * @returns {string} - The content in the selected language
 */
export function splitBilingualContent(content, lang = 'zh') {
  if (!content) return ''
  
  const normalized = normalizeText(content)
  const parts = normalized.split('\n\n---\n\n')
  
  if (parts.length === 2) {
    return normalizeText(lang === 'zh' ? parts[0] : parts[1])
  }
  
  // If not bilingual, return as is
  return normalized
}

/**
 * Extract only the Chinese or English part from bilingual content
 */
export function getBilingualText(text, lang = 'zh') {
  return splitBilingualContent(text, lang)
}
