/**
 * Public entry point for the morse-code-translator library.
 *
 * Re-exports the encoder and decoder so consumers can import from a single
 * module path. Keeping the surface tiny here makes future internal
 * restructuring invisible to callers.
 */

import { encode, decode } from './core.js';

export { encode, decode };
