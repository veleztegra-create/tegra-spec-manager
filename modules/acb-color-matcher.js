function normalizeAcbColorName(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .trim()
    .replace(/\\s+/g, ' ')
    .toLocaleLowerCase();
}

/**
 * Returns a color only when its ACB name is an unambiguous exact match.
 * Partial matches and duplicate names intentionally return null.
 */
export function matchExactAcbColor(book, query) {
  const normalizedQuery = normalizeAcbColorName(query);
  if (!normalizedQuery || !Array.isArray(book?.colors)) return null;

  const matches = book.colors.filter((color) => {
    const names = [color?.name, color?.rawName]
      .map(normalizeAcbColorName)
      .filter(Boolean);
    return names.includes(normalizedQuery);
  });

  return matches.length === 1 ? matches[0] : null;
}
