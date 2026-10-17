function normalizeAcbColorName(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();
}

/**
 * Resolve an ACB color conservatively:
 * 1. Prefer an unambiguous exact name match.
 * 2. Also accept a Pantone code alone (e.g. "012 C", "012C" or
 *    "PANTONE 012 C") when it identifies exactly one color in the loaded book.
 *
 * General partial-name matching stays disabled to avoid linking the wrong ink.
 */
export function matchExactAcbColor(book, query) {
  const normalizedQuery = normalizeAcbColorName(query);
  if (!normalizedQuery || !Array.isArray(book?.colors)) return null;

  const exactMatches = book.colors.filter((color) => {
    const names = [color?.name, color?.rawName]
      .map(normalizeAcbColorName)
      .filter(Boolean);
    return names.includes(normalizedQuery);
  });
  if (exactMatches.length === 1) return exactMatches[0];
  if (exactMatches.length > 1) return null;

  const pantoneCode = normalizedQuery.match(/^(?:pantone\s*)?(\d{3,4})\s*-?\s*c$/i);
  if (!pantoneCode) return null;

  const code = pantoneCode[1].replace(/^0+(?=\d)/, '');
  const codeMatches = book.colors.filter((color) => {
    const names = [color?.name, color?.rawName]
      .map(normalizeAcbColorName)
      .filter(Boolean);
    return names.some((name) => {
      const match = name.match(/(?:^|\s)(\d{3,4})\s*-?\s*c$/i);
      return match && match[1].replace(/^0+(?=\d)/, '') === code;
    });
  });

  return codeMatches.length === 1 ? codeMatches[0] : null;
}
