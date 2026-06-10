/**
 * Single source of truth for all Korean UI strings.
 * Keys are typed via `keyof typeof ko` — removing or renaming a key is a compile error
 * in every consumer. Add new keys here before using them in components.
 */
export const ko = {
  'title.game': 'Bug Hunters: 코드 생존 RPG',
  'title.start': '시작',
  'title.continue': '이어하기',
  'title.restart': '처음부터 다시',
  'title.restart.confirm.title': '정말 처음부터 시작하시겠습니까?',
  'title.restart.confirm.body': '저장된 모든 진행 상황이 삭제됩니다.',
  'title.restart.confirm.yes': '네, 삭제합니다',
  'title.restart.confirm.no': '취소',

  'map.title': '월드 맵',
  'map.node.town': 'Tutorial Town',
  'map.node.caverns': 'Loop Caverns',
  'map.node.boss': 'Boss Lair',
  'map.node.locked': '잠김',
  'map.node.cleared': '완료',
  'map.enter.caverns': 'Loop Caverns 입장',

  'combat.choose': '선택하세요',
  'combat.dmgDealt': '공격: {dmg} 데미지',
  'combat.dmgTaken': '피해: {dmg} 데미지',
  'combat.next': '다음',
  'combat.monster.hp': '몬스터 HP',
  'combat.player.hp': '플레이어 HP',
  'combat.result.optimal': '완벽한 선택!',
  'combat.result.acceptable': '나쁘지 않지만 더 나은 방법이 있습니다.',
  'combat.result.wrong': '틀렸습니다!',

  'level.up': '레벨 업!',
  'level.label': '레벨',
  'xp.label': '경험치',
  'hp.label': '체력',

  'victory.title': '던전 클리어!',
  'victory.subtitle': 'Infinite-Loop Wraith를 물리쳤습니다!',
  'victory.clearTime': '클리어 시간: {time}',
  'victory.correctAnswers': '정답: {count}개',
  'victory.wrongAnswers': '오답: {count}개',
  'victory.playAgain': '다시 도전',

  'defeat.title': '패배...',
  'defeat.subtitle': '쓰러졌습니다.',
  'defeat.encounter': '전투: {name}',
  'defeat.correctAnswer': '정답:',
  'defeat.retry': '재도전',

  'save.disabled': '진행 상황이 저장되지 않습니다',
  'save.versionMismatch': '저장 데이터가 오래되어 초기화되었습니다.',
  'save.corrupt': '저장 데이터가 손상되어 초기화되었습니다.',

  'tutorial.title': '전투 방법',
  'tutorial.body':
    '알고리즘 선택지를 골라 버그 몬스터를 공격하세요.\n' +
    '최적의 선택(Big-O 기준)일수록 더 많은 피해를 줍니다.\n' +
    '정답을 선택하면 설명 패널이 표시됩니다.\n' +
    'HP가 0이 되면 재도전할 수 있습니다.',
  'tutorial.dismiss': '확인',

  'notice.dismiss': '닫기',

  'encounter.turn': '차례 {turn}',
  'encounter.code': '코드',
} as const;

export type StringId = keyof typeof ko;
