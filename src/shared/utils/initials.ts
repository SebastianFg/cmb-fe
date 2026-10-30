const TITLE_PREFIX = /^(Dra?\.|Lic\.)\s*/;

/** "Dra. P. Aguirre" → "PA". Hasta dos letras, sin el título profesional. */
export const initialsOf = (name: string): string =>
  name
    .replace(TITLE_PREFIX, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
