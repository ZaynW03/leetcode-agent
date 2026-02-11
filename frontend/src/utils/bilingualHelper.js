/**
 * Try repairing common mojibake where UTF-8 bytes were decoded as Latin-1.
 */
function tryRepairMojibake(text) {
  try {
    const src = String(text)
    const bytes = new Uint8Array(Array.from(src).map((ch) => ch.charCodeAt(0) & 0xff))
    const repaired = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    return repaired || src
  } catch {
    return String(text)
  }
}

function countChineseChars(text) {
  const matched = String(text).match(/[\u4e00-\u9fff]/g)
  return matched ? matched.length : 0
}

function splitByDelimiter(text) {
  const normalized = String(text)
  // Accept variants like: \n\n---\n\n or \n --- \n
  const parts = normalized.split(/\n\s*---\s*\n/)
  if (parts.length >= 2) {
    return [parts[0].trim(), parts.slice(1).join('\n').trim()]
  }
  return null
}

function splitByLanguageLines(text) {
  const lines = String(text)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const zhLines = []
  const enLines = []

  for (const line of lines) {
    const zhCount = countChineseChars(line)
    const latinCount = (line.match(/[A-Za-z]/g) || []).length
    if (zhCount > 0) zhLines.push(line)
    if (latinCount > 0 && zhCount === 0) enLines.push(line)
  }

  if (zhLines.length > 0 && enLines.length > 0) {
    return [zhLines.join('\n'), enLines.join('\n')]
  }
  return null
}

function looksGarbled(text) {
  if (!text) return false
  const s = String(text)
  if (s.includes('\ufffd')) return true
  if (s.includes('锟斤拷')) return true

  const replacementLike = (s.match(/[�]/g) || []).length
  if (replacementLike >= 2) return true

  // If string is expected to be Chinese but has almost no CJK and lots of symbols, treat as garbled.
  const cjk = countChineseChars(s)
  const noisy = (s.match(/[\?�]|[ÃÂÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]/g) || []).length
  if (cjk === 0 && noisy >= 3) return true

  return false
}

/**
 * Clean and normalize text encoding issues.
 */
function normalizeText(text) {
  if (!text) return ''
  const raw = String(text)
  const repaired = tryRepairMojibake(raw)

  // Use repaired version only when it clearly improves Chinese readability.
  if (countChineseChars(repaired) > countChineseChars(raw)) {
    return repaired
  }
  return raw
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
  const parts = splitByDelimiter(normalized) || splitByLanguageLines(normalized)

  if (parts && parts.length === 2) {
    const zhPart = normalizeText(parts[0])
    const enPart = normalizeText(parts[1])

    if (lang === 'zh') {
      // Fallback to English when Chinese side is visibly garbled.
      return looksGarbled(zhPart) ? enPart : zhPart
    }
    return enPart
  }

  return normalized
}

/**
 * Extract only the Chinese or English part from bilingual content.
 */
export function getBilingualText(text, lang = 'zh') {
  return splitBilingualContent(text, lang)
}
