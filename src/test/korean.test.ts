import { describe, it, expect } from 'vitest';
import { ko } from '../locale/ko';
import { ENCOUNTERS } from '../content/encounters';

const HANGUL_RE = /[가-힣]/;
const PLACEHOLDER_RE = /\b(TODO|XXX|FIXME|PLACEHOLDER|STUB)\b/i;

describe('Korean rendering — AC-13', () => {
  it('every locale string contains at least one Hangul character', () => {
    const exceptions = new Set([
      // These are intentional non-Korean strings
      'map.node.town',
      'map.node.caverns',
      'map.node.boss',
    ]);

    for (const [key, val] of Object.entries(ko)) {
      if (exceptions.has(key)) continue;
      if (!HANGUL_RE.test(val)) {
        throw new Error(`Locale key "${key}" has no Hangul: "${val}"`);
      }
    }
  });

  it('every locale string has no placeholder ASCII', () => {
    for (const [key, val] of Object.entries(ko)) {
      expect(PLACEHOLDER_RE.test(val), `Key "${key}" has placeholder text`).toBe(false);
    }
  });

  it('every encounter problem has Hangul', () => {
    for (const enc of ENCOUNTERS) {
      expect(HANGUL_RE.test(enc.problem)).toBe(true);
    }
  });

  it('every answer text has Hangul', () => {
    for (const enc of ENCOUNTERS) {
      for (const ans of enc.answers) {
        if (!HANGUL_RE.test(ans.text)) {
          throw new Error(
            `Answer "${ans.id}" in enc "${enc.id}" text has no Hangul: "${ans.text}"`,
          );
        }
      }
    }
  });

  it('every answer explanation has Hangul', () => {
    for (const enc of ENCOUNTERS) {
      for (const ans of enc.answers) {
        if (!HANGUL_RE.test(ans.explanation)) {
          throw new Error(
            `Answer "${ans.id}" in enc "${enc.id}" explanation has no Hangul: "${ans.explanation}"`,
          );
        }
      }
    }
  });

  it('code snippets are excluded from Hangul check (they stay in code form)', () => {
    // This test just documents the exception — code snippets don't need Korean
    for (const enc of ENCOUNTERS) {
      if (enc.codeSnippet) {
        // codeSnippets should not contain placeholder text
        expect(PLACEHOLDER_RE.test(enc.codeSnippet)).toBe(false);
      }
    }
  });
});
