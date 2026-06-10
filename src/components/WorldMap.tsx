import type { GameState, Action, MapNodeId } from '../game/types';
import { t } from '../locale/strings';

interface WorldMapProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

interface NodeConfig {
  id: MapNodeId;
  labelKey: 'map.node.town' | 'map.node.caverns' | 'map.node.boss';
  glyph: string;
}

const NODES: NodeConfig[] = [
  { id: 'tutorialTown', labelKey: 'map.node.town', glyph: '🏘️' },
  { id: 'loopCaverns', labelKey: 'map.node.caverns', glyph: '🕳️' },
  { id: 'bossLair', labelKey: 'map.node.boss', glyph: '💀' },
];

export function WorldMap({ state, dispatch }: WorldMapProps) {
  const { unlocked, cleared, currentNode } = state.mapState;

  const handleNode = (nodeId: MapNodeId) => {
    if (!unlocked.includes(nodeId)) return;

    if (nodeId === 'loopCaverns') {
      dispatch({ type: 'SELECT_MAP_NODE', nodeId });
      dispatch({ type: 'ENTER_DUNGEON' });
    } else {
      dispatch({ type: 'SELECT_MAP_NODE', nodeId });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 'var(--space-8)',
        gap: 'var(--space-8)',
      }}
    >
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{t('map.title')}</h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {NODES.map((node, idx) => {
          const isUnlocked = unlocked.includes(node.id);
          const isCleared = cleared.includes(node.id);
          const isCurrent = currentNode === node.id;

          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => handleNode(node.id)}
                disabled={!isUnlocked}
                aria-disabled={!isUnlocked}
                aria-current={isCurrent ? 'location' : undefined}
                aria-label={`${t(node.labelKey)}${isCleared ? ' (완료)' : !isUnlocked ? ' (잠김)' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  minWidth: '120px',
                  minHeight: 'var(--touch-min)',
                  padding: 'var(--space-5)',
                  background: isCurrent
                    ? 'var(--color-accent)'
                    : isCleared
                      ? 'var(--color-success-bg)'
                      : isUnlocked
                        ? 'var(--color-surface-elevated)'
                        : 'var(--color-surface)',
                  border: isCleared
                    ? '2px solid var(--color-success)'
                    : isCurrent
                      ? '2px solid var(--color-accent)'
                      : '2px solid transparent',
                  borderRadius: 'var(--radius-lg)',
                  color: isUnlocked ? 'var(--color-text)' : 'var(--color-text-muted)',
                  opacity: isUnlocked ? 1 : 0.5,
                  filter: isUnlocked ? 'none' : 'grayscale(1)',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <span style={{ fontSize: '2.5rem' }} role="img" aria-hidden="true">
                  {node.glyph}
                </span>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>
                  {t(node.labelKey)}
                </span>
                {isCleared && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
                    {t('map.node.cleared')}
                  </span>
                )}
                {!isUnlocked && (
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{t('map.node.locked')}</span>
                )}
              </button>

              {idx < NODES.length - 1 && (
                <div
                  aria-hidden="true"
                  style={{
                    width: '40px',
                    height: '2px',
                    background: 'var(--color-text-muted)',
                    margin: '0 var(--space-2)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
