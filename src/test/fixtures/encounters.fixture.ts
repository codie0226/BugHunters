import type { Encounter, Monster } from '../../game/types';

export const MOCK_MONSTER: Monster = {
  id: 'test-monster',
  name: '테스트 몬스터',
  maxHp: 30,
  dmg: 8,
  xpReward: 20,
  glyph: '🧪',
};

export const MOCK_ENCOUNTER: Encounter = {
  id: 'test-enc',
  monsterId: 'test-monster',
  problem: '테스트 문제입니다.',
  codeSnippet: 'const x = 1;',
  answers: [
    {
      id: 'a1',
      text: '최적 답변 (해시맵 사용)',
      correctness: 'optimal',
      complexity: 'O(1)',
      explanation: '해시맵은 O(1) 조회를 제공합니다.',
    },
    {
      id: 'a2',
      text: '선형 탐색',
      correctness: 'acceptable',
      complexity: 'O(n)',
      explanation: '선형 탐색은 O(n)이지만 동작합니다.',
    },
    {
      id: 'a3',
      text: '잘못된 답변',
      correctness: 'wrong',
      complexity: 'O(n²)',
      explanation: '이 방법은 너무 비효율적입니다.',
    },
  ],
};
