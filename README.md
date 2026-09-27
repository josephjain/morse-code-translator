# morse-code-translator

A small, dependency-free TypeScript-free JavaScript (ESM) library that encodes plain text into International Morse Code and decodes it back.

## Usage

```js
import { encode, decode } from 'morse-code-translator';

encode('HELLO WORLD'); // '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'
decode('... --- ...'); // 'SOS'
```

## Exports

- `encode(text: string): string` — text to Morse. Letters within a word are space-separated; words are separated by ` / `. Unknown characters are dropped.
- `decode(morse: string): string` — Morse to upper-case text. ` / ` (with flexible whitespace) is a word break; everything else is a symbol gap. Unknown Morse sequences are skipped.

## Why this exists

There are plenty of Morse translators on npm, but most pull in dependencies for string manipulation that a few lines of regex handle cleanly. This library is for projects that need a predictable, auditable translator with no transitive supply chain — useful for education tools, offline-first apps, and CTF helpers.

The trade-off: only the ITU-R M.1677-1 ASCII subset is supported. Lower-case input is normalized to upper case because Morse has no case distinction. Characters outside the table (e.g. `~`) are silently dropped during encoding rather than emitting a placeholder, so round-trips never invent characters.

## The awkward edge

The slash character does double duty: ` / ` is the word separator, but `-..-.` is the Morse symbol for a literal `/`. Decode treats a slash surrounded by whitespace as a word break and a slash with no surrounding whitespace as part of a symbol. So `.- -..-. -...` decodes to `A/B`, while `.- / -...` decodes to `A B`. Keep this in mind when hand-writing Morse input.
