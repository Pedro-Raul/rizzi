/**
 * Moderación de texto para nombres y descripciones públicas.
 * - Acentos y mayúsculas
 * - Leetspeak común (4→a, 0→o, @→a, etc.)
 * - Letras repetidas (puuuta → puta)
 * - Separadores: p.u.t.a → token fusionado
 * - Palabras compuestas frecuentes en frases (límite de palabra)
 *
 * Nota: el contenido ya guardado en la base sigue visible hasta que se edite o borre.
 * Para bloqueo total haría falta validación en base (trigger/Edge Function).
 */

const stripAccents = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

const LEET_MAP = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '€': 'e',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '|': 'l',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
  '9': 'g',
  '6': 'g'
};

const applyLeet = (s) =>
  [...String(s)].map((ch) => LEET_MAP[ch] ?? ch.toLowerCase()).join('');

const collapseRepeats = (s) => s.replace(/(.)\1{1,}/gu, '$1');

/** Palabras / insultos habituales (forma base, sin acento). Se amplían con variantes. */
const BANNED_WORDS = [
  'puta',
  'puto',
  'putas',
  'putos',
  'putero',
  'mierda',
  'mierdas',
  'joder',
  'cabron',
  'cabrona',
  'cabrones',
  'cabronazo',
  'pendejo',
  'pendeja',
  'pendejos',
  'pendejas',
  'coño',
  'cojones',
  'hostia',
  'hostias',
  'gilipollas',
  'imbecil',
  'imbeciles',
  'mamada',
  'mamadas',
  'chingar',
  'chingada',
  'chingadera',
  'chingados',
  'verga',
  'vergas',
  'culero',
  'culeros',
  'pinche',
  'pinches',
  'hijoputa',
  'hijaputa',
  'hijaputas',
  'hijueputa',
  'hdp',
  'maricon',
  'marica',
  'maricas',
  'maricones',
  'zorra',
  'zorras',
  'zorro',
  'carajo',
  'carajos',
  'perra',
  'perras',
  'bastardo',
  'bastardos',
  'bastarda',
  'idiota',
  'idiotas',
  'estupido',
  'estupidos',
  'estupida',
  'estupidas',
  'maldito',
  'maldita',
  'malditos',
  'malditas',
  'pinga',
  'pingas',
  'cagada',
  'cagadas',
  'fuck',
  'fucking',
  'shit',
  'bitch',
  'asshole',
  'motherfucker',
  'putamadre',
  'putamierda',
  'mamona',
  'mamon',
  'malparido',
  'malparidos',
  'malparida',
  'malparidas',
  'pajero',
  'pajeros',
  'pelotudo',
  'pelotudos',
  'tarado',
  'tarados',
  'mierdoso',
  'huevon',
  'huevones',
  'guevon',
  'mugrosa',
  'mugroso',
  'conchadetumadre',
  'ctm',
  'lpm',
  'vetealamierda',
  'vetealacarajo',
  'mamaguevo',
  'mamabicho',
  'mamahuevo',
  'remierda',
  'mamerto',
  'mamertos',
  'putead',
  'putear',
  'putearon',
  'putazo',
  'putazos',
  'culiar',
  'nazi',
  'nazis',
  'hitler',
  'pendejada',
  'pendejadas',
  'cojido',
  'cojida',
  'mamarracho',
  'mamarrachos',
  'desgraciado',
  'desgraciada',
  'desgraciados',
  'hijueputas',
  'putica',
  'puticas',
  'puticlub',
  'prostibulo',
  'escoria',
  'escorias',
  'gonorrea',
  'gonorreas',
  'careverga',
  'carechimba',
  'caremonda',
  'hijueperra',
  'hijueperras',
  'triplehijueputa',
  'triplehijueputas',
  'malnacido',
  'malnacida',
  'malnacidos',
  'malnacidas',
  'pirobo',
  'piroba',
  'pirobos',
  'pirobas'
];

const BANNED_SET = new Set(BANNED_WORDS.map((w) => stripAccents(w)));

/** Frases (normalizadas) que no deben aparecer aunque las palabras sueltas no estén en la lista. */
const BANNED_PHRASES = [
  'puta madre',
  'puta madres',
  'hijo de puta',
  'hija de puta',
  'hijos de puta',
  'hijas de puta',
  'concha de tu madre',
  'la concha de',
  'vete a la mierda',
  'vete a la verga',
  'vete al carajo',
  'me importa un carajo',
  'me importa una mierda',
  'anda a cagar',
  'vete a cagar'
];

const normalizedPhrases = BANNED_PHRASES.map((p) =>
  stripAccents(p)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sortedBanned = [...BANNED_SET].sort((a, b) => b.length - a.length);

const bannedPhrasePattern = new RegExp(`\\b(?:${sortedBanned.map(escapeRegExp).join('|')})\\b`, 'iu');

/** Une p-u-t-a en un solo token "puta". */
function mergeSingleLetterChunks(parts) {
  const out = [];
  let i = 0;
  while (i < parts.length) {
    if (parts[i].length === 1) {
      let acc = parts[i];
      let j = i + 1;
      while (j < parts.length && parts[j].length === 1) {
        acc += parts[j];
        j += 1;
      }
      if (j > i + 1) {
        out.push(acc);
        i = j;
      } else {
        out.push(parts[i]);
        i += 1;
      }
    } else {
      out.push(parts[i]);
      i += 1;
    }
  }
  return out;
}

function tokensFromText(value) {
  const base = stripAccents(value).toLowerCase();
  const rawParts = base.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return mergeSingleLetterChunks(rawParts);
}

function normalizeTokenForMatch(token) {
  return collapseRepeats(applyLeet(stripAccents(token).toLowerCase()));
}

function tokenMatchesBan(token) {
  const t = normalizeTokenForMatch(token);
  if (!t) return false;
  if (BANNED_SET.has(t)) return true;
  if (t.length > 4 && t.endsWith('es') && BANNED_SET.has(t.slice(0, -2))) return true;
  if (t.length > 3 && t.endsWith('s') && BANNED_SET.has(t.slice(0, -1))) return true;
  return false;
}

/**
 * @param {string | null | undefined} text
 * @returns {boolean}
 */
export function containsBlockedLanguage(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  const phraseSpace = stripAccents(trimmed)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (phraseSpace && bannedPhrasePattern.test(phraseSpace)) {
    return true;
  }

  for (const phrase of normalizedPhrases) {
    if (phrase && phraseSpace.includes(phrase)) {
      return true;
    }
  }

  for (const tok of tokensFromText(trimmed)) {
    if (tokenMatchesBan(tok)) return true;
  }

  return false;
}

export function containsBlockedLanguageInFields(fields) {
  return fields.some((field) => containsBlockedLanguage(field));
}

export function createModerationError() {
  return { message: MODERATION_MESSAGE };
}

export const MODERATION_MESSAGE =
  'El texto contiene palabras no permitidas en la plataforma. Ajusta el nombre, la descripción o la dirección.';
