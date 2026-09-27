import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { encode, decode } from '../src/index.js';

describe('encode', () => {
  it('encodes a simple word', () => {
    assert.equal(encode('SOS'), '... --- ...');
  });

  it('encodes a sentence with word separators', () => {
    assert.equal(encode('HELLO WORLD'), '.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
  });

  it('normalizes lower-case input to upper case', () => {
    assert.equal(encode('hello'), '.... . .-.. .-.. ---');
  });

  it('encodes digits', () => {
    assert.equal(encode('42'),('....- ..---'));
  });

  it('encodes supported punctuation', () => {
    assert.equal(encode('HI.'), '.... .. .-.-.-');
  });

  it('drops characters not in the Morse table', () => {
    // `~` has no ITU Morse symbol in our table; it is dropped, and the
    // surrounding letters remain separated by a single space.
    assert.equal(encode('A~B'), '.- -...');
  });

  it('returns an empty string for blank input', () => {
    assert.equal(encode('   '), '');
    assert.equal(encode(''), '');
  });

  it('does not emit a dangling word separator when a whole word is unknown', () => {
    // Every character here is unknown, so the output is empty rather than
    // something like ` / `.
    assert.equal(encode('~~~ ~~~'), '');
  });

  it('throws on non-string input', () => {
    assert.throws(() => encode(42), TypeError);
  });
});

describe('decode', () => {
  it('decodes a simple word', () => {
    assert.equal(decode('... --- ...'), 'SOS');
  });

  it('decodes a sentence with word separators', () => {
    assert.equal(decode('.... . .-.. .-.. --- / .-- --- .-. .-.. -..'), 'HELLO WORLD');
  });

  it('decodes digits', () => {
    assert.equal(decode('....- ..---'), '42');
  });

  it('decodes supported punctuation', () => {
    assert.equal(decode('.... .. .-.-.-'), 'HI.');
  });

  it('decodes the Morse for a literal slash', () => {
    // `-..-.` is the symbol for `/`. With no spaces around the slash
    // separator we treat it as a symbol, so this round-trips to `A/B`.
    assert.equal(decode('.- -..-. -...'), 'A/B');
  });

  it('collapses multiple spaces between symbols', () => {
    assert.equal(decode('...    ---    ...'), 'SOS');
  });

  it('tolerates extra whitespace around the word separator', () => {
    assert.equal(decode('... --- ...   /   ... --- ...'), 'SOS SOS');
  });

  it('skips unknown Morse sequences', () => {
    assert.equal(decode('... --- ... ..----..'), 'SOS');
  });

  it('returns an empty string for blank input', () => {
    assert.equal(decode('   '), '');
    assert.equal(decode(''), '');
  });

  it('throws on non-string input', () => {
    assert.throws(() => decode(42), TypeError);
  });
});

describe('round-trip', () => {
  it('round-trips text that uses only the supported character set', () => {
    const original = 'HELLO WORLD 42';
    assert.equal(decode(encode(original)), original);
  });
});
