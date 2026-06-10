import { ENCOUNTERS } from './encounters';
import { MONSTER_MAP } from './monsters';
import { LOOP_CAVERNS } from './dungeon';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validates all shipped content for invariants required by spec and edge-case rules. */
export function validateContent(): ValidationResult {
  const errors: string[] = [];

  for (const enc of ENCOUNTERS) {
    const optimalCount = enc.answers.filter((a) => a.correctness === 'optimal').length;
    if (optimalCount !== 1) {
      errors.push(
        `Encounter "${enc.id}" has ${optimalCount} optimal answer(s); expected exactly 1.`,
      );
    }

    if (enc.answers.length < 3 || enc.answers.length > 4) {
      errors.push(`Encounter "${enc.id}" has ${enc.answers.length} answer(s); expected 3 or 4.`);
    }

    if (!enc.problem.trim()) {
      errors.push(`Encounter "${enc.id}" has an empty problem statement.`);
    }

    // Check Korean content — at least one Hangul character in the problem
    if (!/[가-힣]/.test(enc.problem)) {
      errors.push(`Encounter "${enc.id}" problem has no Korean (Hangul) text.`);
    }

    for (const ans of enc.answers) {
      if (!ans.text.trim() || !ans.explanation.trim()) {
        errors.push(`Answer "${ans.id}" in encounter "${enc.id}" has empty text or explanation.`);
      }
    }

    if (!MONSTER_MAP[enc.monsterId]) {
      errors.push(`Encounter "${enc.id}" references unknown monster id "${enc.monsterId}".`);
    }
  }

  // Dungeon must reference only known encounters
  const encIds = new Set(ENCOUNTERS.map((e) => e.id));
  for (const eid of LOOP_CAVERNS.encounterIds) {
    if (!encIds.has(eid)) {
      errors.push(`Dungeon "${LOOP_CAVERNS.id}" references unknown encounter id "${eid}".`);
    }
  }

  if (LOOP_CAVERNS.encounterIds.length !== 5) {
    errors.push(
      `Dungeon "${LOOP_CAVERNS.id}" has ${LOOP_CAVERNS.encounterIds.length} encounters; expected 5.`,
    );
  }

  return { valid: errors.length === 0, errors };
}

// Run at module load in dev to surface content bugs early.
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  const result = validateContent();
  if (!result.valid) {
    result.errors.forEach((e) => console.warn('[validateContent]', e));
  }
}
