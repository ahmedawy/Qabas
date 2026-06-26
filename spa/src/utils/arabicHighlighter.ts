/**
 * Normalizes an Arabic string for comparison:
 * 1. Removes all Tashkeel/diacritics.
 * 2. Unifies all shapes of Alif/Hamza to a simple Alif.
 * 3. Unifies Ta Marbouta with Ha.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics
    .replace(/[أإآ]/g, 'ا') // unify Alif hamzas
    .replace(/ة/g, 'ه'); // unify Ta Marbouta / Ha
}

export interface TextSegment {
  text: string;
  isHighlighted: boolean;
}

/**
 * Splits original text into segments indicating whether they match the normalized search query.
 * Correctly maps normalized string indices back to the original text containing diacritics.
 */
export function highlightArabicText(originalText: string, query: string): TextSegment[] {
  if (!originalText) return [];
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [{ text: originalText, isHighlighted: false }];
  }

  const normText = normalizeArabic(originalText);
  const normQuery = normalizeArabic(trimmedQuery);

  if (!normText.includes(normQuery)) {
    return [{ text: originalText, isHighlighted: false }];
  }

  // Map each character in normalized text back to its index in the original text
  const indexMap: number[] = [];
  let origIdx = 0;

  for (let i = 0; i < normText.length; i++) {
    while (origIdx < originalText.length) {
      const char = originalText[origIdx];
      // If the character is a diacritic, skip it in original text
      if (/[\u064B-\u065F\u0670]/.test(char)) {
        origIdx++;
      } else {
        break;
      }
    }
    indexMap.push(origIdx);
    origIdx++;
  }
  // Append end boundary
  indexMap.push(originalText.length);

  const segments: TextSegment[] = [];
  let lastNormIndex = 0;

  let matchIdx = normText.indexOf(normQuery, lastNormIndex);
  while (matchIdx !== -1) {
    // Add text segment before match
    if (matchIdx > lastNormIndex) {
      const startOrig = indexMap[lastNormIndex];
      const endOrig = indexMap[matchIdx];
      segments.push({
        text: originalText.substring(startOrig, endOrig),
        isHighlighted: false,
      });
    }

    // Add matched text segment
    const startOrig = indexMap[matchIdx];
    const endOrig = indexMap[matchIdx + normQuery.length];
    segments.push({
      text: originalText.substring(startOrig, endOrig),
      isHighlighted: true,
    });

    lastNormIndex = matchIdx + normQuery.length;
    matchIdx = normText.indexOf(normQuery, lastNormIndex);
  }

  // Add trailing text segment
  if (lastNormIndex < normText.length) {
    const startOrig = indexMap[lastNormIndex];
    segments.push({
      text: originalText.substring(startOrig),
      isHighlighted: false,
    });
  }

  return segments;
}
