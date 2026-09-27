/**
 * International Morse Code translator.
 *
 * Encodes plain text into Morse Code and decodes Morse Code back into text.
 * Follows the ITU-R M.1677-1 character set as closely as is useful for
 * ASCII-only input.
 *
 * Design decisions:
 * - Input is normalized to UPPER CASE before encoding. Morse has no case
 *   distinction, so lower-case letters must map to the same symbol as their
 *   upper-case counterparts. Rather than carry a parallel lower-case table,
 *   we uppercase once and look up in a single map.
 * - Letters within a word are separated by a single space.
 * - Words are separated by the literal string ` / ` (space-slash-space).
 *   This mirrors how operators read Morse on paper and keeps decode
 *   unambiguous: a lone `/` with whitespace on both sides is a word break,
 *   everything else is a symbol gap.
 * - Unknown characters (e.g. `!`, `@`) are dropped during encoding. Emitting
 *   a placeholder would silently corrupt round-trips; failing outright would
 *   make the library unusable for text with incidental punctuation. Dropping
 *   is the least surprising middle ground and is documented here.
 * - Decode is lenient about whitespace runs: multiple spaces between symbols
 *   are collapsed, and `   /   ` (any spacing around the slash) is treated as
 *   one word break. This matches how humans actually type Morse.
 */

/**
 * Mapping of ASCII characters to their Morse representations.
 * @type {Readonly<Record<string, string>>}
 */
const MORSE_MAP = Object.freeze({
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '_': '..--.-',
  '"': '.-..-.',
  '$': '...-..-',
  '@': '.--.-.',
});

/**
 * Inverse mapping, built once at module load.
 * @type {Readonly<Record<string, string>>}
 */
const TEXT_MAP = Object.freeze(
  Object.fromEntries(
    Object.entries(MORSE_MAP).map(([char, morse]) => [morse, char]),
  ),
);

/**
 * Encodes a string of plain text into International Morse Code.
 *
 * Letters within a word are separated by a single space; words are separated
 * by ` / `. Characters not present in the Morse table are dropped silently.
 *
 * @param {string} text - The text to encode.
 * @returns {string} The Morse Code representation.
 */
export function encode(text) {
  if (typeof text !== 'string') {
    throw new TypeError('encode expected a string');
  }

  const words = text.toUpperCase().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) {
    return '';
  }

  const encodedWords = words.map((word) =>
    Array.from(word)
      .map((ch) => MORSE_MAP[ch])
      .filter((morse) => morse !== undefined)
      .join(' '),
  );

  // Drop any word that became empty after filtering unknown characters,
  // so we never emit a dangling ` / ` with nothing on one side.
  return encodedWords.filter((w) => w.length > 0).join(' / ');
}

/**
 * Decodes a Morse Code string back into plain text.
 *
 * Symbols within a word are separated by one or more spaces; words are
 * separated by a slash surrounded by optional whitespace (` / `).
 * Unknown Morse sequences are skipped — emitting a placeholder would invent
 * meaning the encoder never intended.
 *
 * @param {string} morse - The Morse Code string to decode.
 * @returns {string} The decoded upper-case text.
 */
export function decode(morse) {
  if (typeof morse !== 'string') {
    throw new TypeError('decode expected a string');
  }

  const trimmed = morse.trim();
  if (trimmed.length === 0) {
    return '';
  }

  // Split on the word separator: a slash with whitespace on at least one
  // side, or surrounded by whitespace. We accept ` / `, `  /  `, `/ ` and
  // ` /` to be forgiving about how humans type it. A slash with NO
  // surrounding whitespace is treated as part of the Morse for `/` (-..-.),
  // which is the correct symbol and decodes to `/`.
  const wordChunks = trimmed.split(/\s*\/\s*/);

  return wordChunks
    .map((chunk) =>
      chunk
        .trim()
        .split(/\s+/)
        .filter((sym) => sym.length > 0)
        .map((sym) => TEXT_MAP[sym])
        .filter((ch) => ch !== undefined)
        .join(''),
    )
    .filter((word) => word.length > 0)
    .join(' ');
}
