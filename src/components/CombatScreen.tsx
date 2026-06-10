import { useCallback } from 'react';
import type { GameState, Action, Answer } from '../game/types';
import { currentEncounter, currentMonster, isFirstEncounter } from '../game/selectors';
import { t } from '../locale/strings';
import { HpBar } from './HpBar';
import { MonsterSprite } from './MonsterSprite';
import { AnswerChoice } from './AnswerChoice';
import { ExplanationPanel } from './ExplanationPanel';
import { StatusBar } from './StatusBar';
import { TutorialOverlay } from './TutorialOverlay';
import { useKeyboardNav } from '../hooks/useKeyboardNav';

interface CombatScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

export function CombatScreen({ state, dispatch }: CombatScreenProps) {
  const enc = currentEncounter(state);
  const monster = currentMonster(state);
  const dungeonState = state.dungeonState;
  const turn = state.lastTurn;
  const submitted = turn !== null;

  // Hook must be called before any conditional return (rules of hooks)
  const handleSelectByIndex = useCallback(
    (idx: number) => {
      if (submitted || !enc) return;
      const ans = (enc.answers as Answer[])[idx];
      if (ans) dispatch({ type: 'SUBMIT_ANSWER', answer: ans });
    },
    [submitted, enc, dispatch],
  );

  const containerRef = useKeyboardNav(enc?.answers.length ?? 0, handleSelectByIndex, submitted);

  if (!enc || !monster || !dungeonState) return null;

  const showTutorial = !state.tutorialDismissed && isFirstEncounter(state) && !submitted;

  const handleSelect = (answer: Answer) => {
    if (submitted) return;
    dispatch({ type: 'SUBMIT_ANSWER', answer });
  };

  const handleContinue = () => {
    dispatch({ type: 'ADVANCE_AFTER_TURN' });
  };

  const handleDismissTutorial = () => {
    dispatch({ type: 'DISMISS_TUTORIAL' });
  };

  const answers = enc.answers as Answer[];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        padding: 'var(--space-4)',
        gap: 'var(--space-4)',
        maxWidth: '700px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {showTutorial && <TutorialOverlay onDismiss={handleDismissTutorial} />}

      <StatusBar player={state.player} />

      {/* Monster area */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <MonsterSprite monster={monster} />
        <HpBar
          current={dungeonState.monsterHp}
          max={monster.maxHp}
          variant="monster"
          label={t('combat.monster.hp')}
        />
      </div>

      {/* Problem area */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <p style={{ fontSize: 'var(--font-size-md)', lineHeight: 1.7 }}>{enc.problem}</p>
        {enc.codeSnippet && (
          <pre>
            <code>{enc.codeSnippet}</code>
          </pre>
        )}
      </div>

      {/* Answer choices — keyboard nav container */}
      {!submitted && (
        <div
          ref={containerRef}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          aria-label={t('combat.choose')}
        >
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
            }}
          >
            {t('combat.choose')}
          </p>
          {answers.map((ans, idx) => (
            <AnswerChoice
              key={ans.id}
              answer={ans}
              index={idx}
              submitted={false}
              selectedCorrectness={null}
              onSelect={handleSelect}
              disabled={false}
            />
          ))}
        </div>
      )}

      {/* Post-submit: show all answers with correctness + explanation */}
      {submitted && turn && (
        <>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
            aria-label={t('combat.reviewLabel')}
          >
            {answers.map((ans, idx) => (
              <AnswerChoice
                key={ans.id}
                answer={ans}
                index={idx}
                submitted={true}
                selectedCorrectness={ans.correctness}
                onSelect={() => {}}
                disabled={true}
              />
            ))}
          </div>
          <ExplanationPanel turn={turn} onContinue={handleContinue} />
        </>
      )}
    </div>
  );
}
