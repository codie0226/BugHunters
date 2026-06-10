import { describe, it, expect } from 'vitest';
import { validate, SAVE_VERSION } from '../game/saveSchema';
import { VALID_SAVE } from './fixtures/save.fixture';

describe('validate', () => {
  it('accepts a well-formed payload', () => {
    expect(validate(VALID_SAVE)).toBe(true);
  });

  it('rejects null', () => {
    expect(validate(null)).toBe(false);
  });

  it('rejects missing version', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { version: _v, ...rest } = VALID_SAVE;
    expect(validate(rest)).toBe(false);
  });

  it('rejects wrong version', () => {
    expect(validate({ ...VALID_SAVE, version: SAVE_VERSION + 1 })).toBe(false);
  });

  it('rejects missing player', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { player: _p, ...rest } = VALID_SAVE;
    expect(validate(rest)).toBe(false);
  });

  it('rejects malformed player (missing maxHp)', () => {
    const payload = { ...VALID_SAVE, player: { level: 1, xp: 0, hp: 50 } };
    expect(validate(payload)).toBe(false);
  });

  it('rejects malformed mapState', () => {
    const payload = { ...VALID_SAVE, mapState: { unlocked: 'bad' } };
    expect(validate(payload)).toBe(false);
  });

  it('accepts null dungeonState', () => {
    expect(validate({ ...VALID_SAVE, dungeonState: null })).toBe(true);
  });

  it('rejects missing tutorialDismissed', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tutorialDismissed: _t, ...rest } = VALID_SAVE;
    expect(validate(rest)).toBe(false);
  });
});
