import type { Monster } from '../game/types';

export const MONSTERS: readonly Monster[] = [
  {
    id: 'null-slime',
    name: '널 슬라임',
    maxHp: 30,
    dmg: 6,
    xpReward: 15,
    glyph: '🟢',
  },
  {
    id: 'off-by-one-imp',
    name: '경계 오류 임프',
    maxHp: 45,
    dmg: 8,
    xpReward: 25,
    glyph: '👹',
  },
  {
    id: 'infinite-loop-wraith',
    name: '무한루프 유령',
    maxHp: 80,
    dmg: 12,
    xpReward: 60,
    glyph: '👻',
    isBoss: true,
  },
] satisfies Monster[];

export const MONSTER_MAP: Readonly<Record<string, Monster>> = Object.fromEntries(
  MONSTERS.map((m) => [m.id, m]),
);
