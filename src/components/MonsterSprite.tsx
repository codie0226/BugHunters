import type { Monster } from '../game/types';
import { t } from '../locale/strings';

interface MonsterSpriteProps {
  monster: Monster;
}

export function MonsterSprite({ monster }: MonsterSpriteProps) {
  return (
    <div style={{ textAlign: 'center' }} aria-label={t('monster.label').replace('{name}', monster.name)}>
      <div
        style={{
          fontSize: monster.isBoss ? '5rem' : '4rem',
          lineHeight: 1,
          marginBottom: 'var(--space-2)',
          filter: monster.isBoss ? 'drop-shadow(0 0 12px var(--color-boss))' : undefined,
        }}
        role="img"
        aria-hidden="true"
      >
        {monster.glyph}
      </div>
      <div
        style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 700,
          color: monster.isBoss ? 'var(--color-boss)' : 'var(--color-text)',
        }}
      >
        {monster.name}
      </div>
    </div>
  );
}
