import type { Encounter } from '../game/types';

/**
 * 5 encounters in dungeon order:
 *   1. Null Slime (intro — null check)
 *   2. Off-by-One Imp (loop boundaries)
 *   3. Null Slime variant (null coalescing)
 *   4. Off-by-One Imp mini-boss (binary search bounds)
 *   5. Infinite-Loop Wraith final boss (termination condition)
 */
export const ENCOUNTERS: readonly Encounter[] = [
  {
    id: 'enc-1',
    monsterId: 'null-slime',
    problem: '배열에서 첫 번째 짝수를 반환하는 함수입니다. 짝수가 없으면 어떻게 처리해야 할까요?',
    codeSnippet: `function findFirstEven(arr: number[]): number {
  for (const n of arr) {
    if (n % 2 === 0) return n;
  }
  // 여기서 뭘 반환해야 할까?
}`,
    answers: [
      {
        id: 'enc-1-a1',
        text: 'null 또는 undefined를 반환하고 호출자가 null 체크하게 한다',
        correctness: 'optimal',
        complexity: 'O(n)',
        explanation:
          'null을 반환하면 호출자가 명시적으로 처리할 수 있어 런타임 오류를 방지합니다. ' +
          'TypeScript에서는 반환 타입을 number | null로 선언해 컴파일러가 체크를 강제할 수 있습니다.',
      },
      {
        id: 'enc-1-a2',
        text: '-1을 반환한다 (오류 표시 관례)',
        correctness: 'acceptable',
        complexity: 'O(n)',
        explanation:
          '-1은 일부 언어의 관례이지만, 타입 시스템이 없으면 호출자가 -1의 의미를 알기 어렵습니다. ' +
          'null/undefined가 더 명확한 "값 없음"을 표현합니다.',
      },
      {
        id: 'enc-1-a3',
        text: '아무것도 반환하지 않는다 (undefined 암묵적 반환)',
        correctness: 'wrong',
        complexity: 'O(n)',
        explanation:
          '암묵적 undefined 반환은 타입 오류이며, 호출자가 반환값을 숫자로 기대하면 NaN이나 런타임 오류가 발생합니다.',
      },
      {
        id: 'enc-1-a4',
        text: '예외를 던진다 (throw new Error)',
        correctness: 'acceptable',
        complexity: 'O(n)',
        explanation:
          '예외는 "예상하지 못한" 상황에 적합하지만, 짝수가 없는 것은 정상적인 입력입니다. ' +
          '예외보다 null 반환이 더 적절합니다.',
      },
    ],
  },
  {
    id: 'enc-2',
    monsterId: 'off-by-one-imp',
    problem: '배열 모든 원소를 순회할 때 올바른 루프 조건은 무엇인가요?',
    codeSnippet: `const arr = [10, 20, 30, 40, 50];
for (let i = ?; i ? arr.length; i++) {
  console.log(arr[i]);
}`,
    answers: [
      {
        id: 'enc-2-a1',
        text: 'i = 0, i < arr.length (0부터 length 미만)',
        correctness: 'optimal',
        complexity: 'O(n)',
        explanation:
          '배열 인덱스는 0부터 시작하고 length - 1에서 끝납니다. ' +
          'i < arr.length는 마지막 원소까지 정확히 처리하며 경계 오류가 없습니다.',
      },
      {
        id: 'enc-2-a2',
        text: 'i = 1, i <= arr.length (1부터 length 이하)',
        correctness: 'wrong',
        complexity: 'O(n)',
        explanation:
          'i = 1이면 arr[0]을 건너뛰고, i <= arr.length이면 arr[length]는 undefined입니다. ' +
          '두 가지 경계 오류가 동시에 발생합니다.',
      },
      {
        id: 'enc-2-a3',
        text: 'i = 0, i <= arr.length - 1 (0부터 length-1 이하)',
        correctness: 'acceptable',
        complexity: 'O(n)',
        explanation:
          '수학적으로 맞지만, i < arr.length가 더 관용적이고 읽기 쉽습니다. ' +
          'length - 1 계산은 불필요한 연산을 추가합니다.',
      },
      {
        id: 'enc-2-a4',
        text: 'i = 0, i < arr.length - 1 (마지막 원소 제외)',
        correctness: 'wrong',
        complexity: 'O(n)',
        explanation:
          'i < arr.length - 1이면 마지막 원소(arr[4])를 처리하지 않습니다. ' +
          '5개짜리 배열에서 4번만 반복하는 전형적인 경계 오류입니다.',
      },
    ],
  },
  {
    id: 'enc-3',
    monsterId: 'null-slime',
    problem: '객체에서 중첩 속성을 안전하게 읽는 최선의 방법은?',
    codeSnippet: `interface User {
  profile?: {
    address?: {
      city?: string;
    };
  };
}
const user: User = {};
// user.profile.address.city를 어떻게 읽을까?`,
    answers: [
      {
        id: 'enc-3-a1',
        text: '옵셔널 체이닝: user?.profile?.address?.city',
        correctness: 'optimal',
        complexity: 'O(1)',
        explanation:
          '옵셔널 체이닝(?.)은 중간 값이 null/undefined이면 즉시 undefined를 반환합니다. ' +
          '코드가 간결하고 TypeScript가 타입을 string | undefined로 추론합니다.',
      },
      {
        id: 'enc-3-a2',
        text: 'if 체인: if (user && user.profile && user.profile.address) ...',
        correctness: 'acceptable',
        complexity: 'O(1)',
        explanation:
          '논리적으로 맞지만 코드가 장황합니다. 옵셔널 체이닝이 같은 안전성을 훨씬 간결하게 제공합니다.',
      },
      {
        id: 'enc-3-a3',
        text: 'try-catch로 감싸서 오류 발생 시 undefined 반환',
        correctness: 'wrong',
        complexity: 'O(1)',
        explanation:
          '예외 처리는 프로퍼티 접근에 적합하지 않습니다. null 참조 오류를 예외로 처리하면 흐름 제어에 예외를 남용하는 것입니다.',
      },
    ],
  },
  {
    id: 'enc-4',
    monsterId: 'off-by-one-imp',
    problem: '정렬된 배열에서 이진 탐색을 구현할 때 중간 인덱스를 계산하는 올바른 방식은?',
    codeSnippet: `function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = ?;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    answers: [
      {
        id: 'enc-4-a1',
        text: '오버플로우 방지: mid = lo + Math.floor((hi - lo) / 2)',
        correctness: 'optimal',
        complexity: 'O(log n)',
        explanation:
          'hi - lo를 먼저 계산하면 lo + hi의 정수 오버플로우를 방지합니다. ' +
          'JavaScript에서는 안전 정수 범위가 크지만, 이 관용구는 모든 언어에서 올바른 습관입니다.',
      },
      {
        id: 'enc-4-a2',
        text: '일반적 방법: mid = Math.floor((lo + hi) / 2)',
        correctness: 'acceptable',
        complexity: 'O(log n)',
        explanation:
          'JavaScript에서는 Number.MAX_SAFE_INTEGER 이하이므로 실제로 오버플로우가 없지만, ' +
          'C/Java에서는 lo + hi가 int 최댓값을 초과할 수 있어 안전하지 않습니다.',
      },
      {
        id: 'enc-4-a3',
        text: 'mid = (lo + hi) >> 1  (비트 시프트)',
        correctness: 'acceptable',
        complexity: 'O(log n)',
        explanation:
          '비트 시프트는 정수 나누기보다 빠르지만 가독성이 낮습니다. ' +
          'JavaScript의 >> 연산자는 32비트 정수로 처리하므로 큰 배열에서 오버플로우 가능성이 있습니다.',
      },
      {
        id: 'enc-4-a4',
        text: 'mid = lo + (hi - lo)  (단순 덧셈)',
        correctness: 'wrong',
        complexity: 'O(log n)',
        explanation:
          '나누기가 없어 mid = hi가 됩니다. 이렇면 이진 탐색이 절반씩 좁혀지지 않아 무한 루프에 빠집니다.',
      },
    ],
  },
  {
    id: 'enc-5',
    monsterId: 'infinite-loop-wraith',
    problem: '아래 함수는 무한 루프에 빠집니다. 올바른 종료 조건은 무엇인가요?',
    codeSnippet: `function countdown(n: number): void {
  while (?) {
    console.log(n);
    n--;
  }
  console.log("발사!");
}`,
    answers: [
      {
        id: 'enc-5-a1',
        text: 'n > 0 (양수인 동안 반복)',
        correctness: 'optimal',
        complexity: 'O(n)',
        explanation:
          'n > 0은 n이 0에 도달하면 루프를 종료합니다. 매 반복마다 n--를 하므로 반드시 종료되며, ' +
          '종료 조건이 명확합니다. 무한 루프의 핵심 해결책은 "언제 멈출지"를 명시하는 것입니다.',
      },
      {
        id: 'enc-5-a2',
        text: 'true (무한 루프 + 내부 break 조건)',
        correctness: 'wrong',
        complexity: 'O(n)',
        explanation:
          'while(true)는 별도의 break가 없으면 영원히 실행됩니다. ' +
          '종료 조건을 while에 명시하는 것이 코드 의도를 훨씬 명확하게 합니다.',
      },
      {
        id: 'enc-5-a3',
        text: 'n !== 0 (0이 아닌 동안 반복)',
        correctness: 'acceptable',
        complexity: 'O(n)',
        explanation:
          'n이 양의 정수면 동작하지만, n이 음수로 시작하면 영원히 0을 지나치지 못합니다. ' +
          'n > 0이 더 안전하고 의도가 명확합니다.',
      },
      {
        id: 'enc-5-a4',
        text: 'n >= 0 (0 포함하여 반복)',
        correctness: 'acceptable',
        complexity: 'O(n)',
        explanation:
          '0도 출력하고 싶다면 맞지만, 카운트다운은 보통 1부터 시작합니다. ' +
          '요구사항에 따라 맞을 수도 있지만, n > 0이 더 일반적인 카운트다운 패턴입니다.',
      },
    ],
  },
] satisfies Encounter[];

export const ENCOUNTER_MAP: Readonly<Record<string, Encounter>> = Object.fromEntries(
  ENCOUNTERS.map((e) => [e.id, e]),
);
