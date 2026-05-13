/**
 * Normaliza texto para comparar palabras ofensivas (minúsculas, sin acentos).
 * Lista ampliable: añade términos en forma normalizada (sin acentos).
 */
const stripAccents = (value) =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

/** Palabras o fragmentos que no queremos en nombres o descripciones públicas. */
const BANNED_TOKENS = [
  'puta',
  'puto',
  'put4',
  'mierda',
  'joder',
  'cabron',
  'pendejo',
  'pendeja',
  'coño',
  'cojones',
  'hostia',
  'gilipollas',
  'imbecil',
  'mamada',
  'chingar',
  'verga',
  'culero',
  'pinche',
  'hijoputa',
  'hdp',
  'maricon',
  'zorra'
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const bannedPattern = new RegExp(
  `\\b(?:${BANNED_TOKENS.map(escapeRegExp).join('|')})\\b`,
  'iu'
);

/**
 * @param {string | null | undefined} text
 * @returns {boolean}
 */
export function containsBlockedLanguage(text) {
  if (!text || typeof text !== 'string') return false;
  const normalized = stripAccents(text.trim());
  if (!normalized) return false;
  const collapsed = normalized.replace(/[_\s]+/g, ' ');
  return bannedPattern.test(collapsed);
}

export const MODERATION_MESSAGE =
  'El texto contiene palabras no permitidas en la plataforma. Ajusta el nombre o la descripción.';
