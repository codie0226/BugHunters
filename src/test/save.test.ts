import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadSave, writeSave, clearSave } from '../game/save';
import { SAVE_KEY, SAVE_VERSION } from '../game/saveSchema';
import { VALID_SAVE } from './fixtures/save.fixture';

// jsdom provides localStorage; we clear it between tests
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('loadSave', () => {
  it('returns absent when key not present', () => {
    expect(loadSave().kind).toBe('absent');
  });

  it('round-trip: write then load returns ok with matching payload', () => {
    writeSave(VALID_SAVE);
    const result = loadSave();
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.payload.version).toBe(SAVE_VERSION);
      expect(result.payload.player.level).toBe(VALID_SAVE.player.level);
    }
  });

  it('returns corrupt for malformed JSON', () => {
    localStorage.setItem(SAVE_KEY, '{broken json{{');
    expect(loadSave().kind).toBe('corrupt');
  });

  it('returns versionMismatch for stale version', () => {
    const stale = { ...VALID_SAVE, version: SAVE_VERSION + 99 };
    localStorage.setItem(SAVE_KEY, JSON.stringify(stale));
    expect(loadSave().kind).toBe('versionMismatch');
  });

  it('returns unavailable when localStorage throws on access', () => {
    // Simulate a browser with storage disabled
    const orig = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('Storage disabled');
      },
      configurable: true,
    });

    expect(loadSave().kind).toBe('unavailable');

    // Restore
    if (orig) Object.defineProperty(window, 'localStorage', orig);
  });
});

describe('writeSave', () => {
  it('returns true on success', () => {
    expect(writeSave(VALID_SAVE)).toBe(true);
  });

  it('returns false when storage throws', () => {
    const orig = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('Storage disabled');
      },
      configurable: true,
    });

    expect(writeSave(VALID_SAVE)).toBe(false);

    if (orig) Object.defineProperty(window, 'localStorage', orig);
  });
});

describe('clearSave', () => {
  it('removes the key', () => {
    writeSave(VALID_SAVE);
    clearSave();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not throw when storage unavailable', () => {
    const orig = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('Storage disabled');
      },
      configurable: true,
    });

    expect(() => clearSave()).not.toThrow();

    if (orig) Object.defineProperty(window, 'localStorage', orig);
  });
});
