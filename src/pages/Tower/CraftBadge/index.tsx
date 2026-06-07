import type { CSSProperties } from 'react';

import { LevelBadge } from '@components/LevelBadge';
import { Panel } from '@components/Panel';
import { Portrait } from '@components/Portrait';
import { ProgressBar } from '@components/ProgressBar';
import { INITIAL_SKILL_BY_PROFESSION } from '@game/domain/professions';
import { useGameState } from '@game/hooks/useGameState';
import { gameLibrary } from '@game/library/gameLibrary';
import { libraryProfessions } from '@game/library/professions';
import { getSkillDurationMs } from '@game/library/skillDisplay';
import { useNavigation } from '@navigation/useNavigation';
import type { ProfessionId } from '@game/state/types';

import './index.css';

const panelClass = 'w-full [--frame-scale:0.2]';
const labelClass =
  'm-0 truncate text-center font-serif text-xs font-bold leading-none text-button-text';

export interface CraftBadgeProps {
  professionId: ProfessionId;
  y: number;
  x?: number;
}

function badgeCoords(y: number, x?: number): CSSProperties {
  return { '--badge-y': y, ...(x !== undefined ? { '--badge-x': x } : {}) } as CSSProperties;
}

export function CraftBadge({ professionId, x, y }: CraftBadgeProps) {
  const { navigate } = useNavigation();
  const professionMeta = libraryProfessions[professionId];
  const isGathering = professionMeta.type === 'gathering';
  const profession = useGameState((state) => state.professions[professionId]);
  const currentTask = profession.currentTask;
  const currentSkill =
    currentTask !== null ? gameLibrary.skills[currentTask.skillId] : undefined;
  const currentItem =
    currentTask !== null ? gameLibrary.items[currentTask.skillId] : undefined;
  const isProducing =
    currentTask !== null &&
    currentSkill !== undefined &&
    currentSkill.professionId === professionId;
  const durationMs = currentSkill ? getSkillDurationMs(currentSkill) : 0;
  const defaultSkill = gameLibrary.skills[INITIAL_SKILL_BY_PROFESSION[professionId]];
  const portraitSkill = isProducing ? currentSkill : defaultSkill;
  const portraitIcon = portraitSkill?.icon;
  const portraitAlt = portraitSkill
    ? (gameLibrary.items[portraitSkill.id]?.name ?? portraitSkill.id)
    : professionMeta.workshop.title;
  const activityTitle = isProducing
    ? (currentItem?.name ?? currentTask.skillId)
    : null;
  const pageId = professionMeta.type === 'craft' ? 'craft' : 'gathering';

  return (
    <button
      type="button"
      className={
        'craft-badge pointer-events-auto absolute grid w-36 cursor-pointer grid-rows-[auto_0.75rem_auto] border-0 bg-transparent p-0 ' +
        (isGathering ? 'craft-badge--gathering' : 'craft-badge--craft')
      }
      style={badgeCoords(y, x)}
      aria-label={professionMeta.workshop.title}
      onClick={() => navigate(pageId, professionId)}
    >
      <Panel layout="horizontal" className={panelClass}>
        <h3 className={`${labelClass} flex min-h-7 items-center justify-center px-2`}>
          {professionMeta.workshop.title}
        </h3>
      </Panel>

      <div className={isGathering ? 'flex items-center justify-end' : 'flex items-center justify-start'}>
        <LevelBadge
          level={profession.level}
          size="small"
          className={isGathering ? 'translate-x-1/2' : '-translate-x-1/2'}
        />
      </div>

      <Panel layout="horizontal" className={panelClass}>
        {isProducing && currentSkill && activityTitle && currentTask ? (
          <div className="flex min-h-11 flex-col items-center justify-center gap-1 px-2">
            <div className="flex w-full items-center justify-center gap-1">
              {currentSkill.icon ? (
                <img
                  className="size-6 shrink-0 object-contain"
                  src={currentSkill.icon}
                  alt=""
                  decoding="async"
                />
              ) : null}
              <span className={labelClass}>{activityTitle}</span>
            </div>
            <ProgressBar
              mode="timed"
              startedAt={currentTask.startedAt}
              totalMs={durationMs}
              size="small"
              className="w-full"
            />
          </div>
        ) : (
          <h4 className={`${labelClass} flex min-h-11 items-center justify-center px-2`}>Idle</h4>
        )}
      </Panel>

      {isGathering ? (
        <div className="pointer-events-none absolute top-1/2 left-0 z-30 size-20 -translate-x-1/2 -translate-y-1/2">
          <Portrait
            {...(portraitIcon ? { iconSrc: portraitIcon, iconAlt: portraitAlt } : {})}
            className="size-full"
          />
        </div>
      ) : null}
    </button>
  );
}
