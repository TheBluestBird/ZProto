import { useEffect, useRef, useState } from 'react';

import { Button } from '@components/Button';
import { Panel } from '@components/Panel';
import { setDebugTimeOfDay, timeOfDayPhases } from '@game/ambient/timeOfDay';
import { useFactionVisit } from '@game/hooks/useFactionVisit';
import { LearnSkill } from '@game/events/LearnSkill';
import { useGameDispatch } from '@game/hooks/useGameDispatch';
import { useTimeOfDay } from '@game/hooks/useTimeOfDay';
import { PROFESSION_IDS } from '@game/domain/professions';
import { gameLibrary } from '@game/library/gameLibrary';

export interface DebugPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Ignore backdrop taps right after open (mobile double-tap would close immediately). */
const BACKDROP_GRACE_MS = 400;

const skillGroups = PROFESSION_IDS.map((professionId) => ({
  professionId,
  title: gameLibrary.professions[professionId].title,
  skills: Object.values(gameLibrary.skills)
    .filter((skill) => skill.professionId === professionId)
    .map((skill) => ({
      id: skill.id,
      label: gameLibrary.items[skill.id]?.name ?? skill.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label)),
})).filter((group) => group.skills.length > 0);

const defaultSkillId = skillGroups[0]?.skills[0]?.id ?? '';

export function DebugPanel({ open, onClose }: DebugPanelProps) {
  const dispatch = useGameDispatch();
  const currentPhase = useTimeOfDay();
  const { hurryArrival } = useFactionVisit();
  const [selectedSkillId, setSelectedSkillId] = useState(defaultSkillId);
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (open) {
      openedAtRef.current = Date.now();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function handleBackdropClose() {
    if (Date.now() - openedAtRef.current < BACKDROP_GRACE_MS) {
      return;
    }
    onClose();
  }

  function handleGrantSkill() {
    if (selectedSkillId === '') return;
    dispatch(new LearnSkill(selectedSkillId));
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close debug panel"
        className="fixed inset-0 z-20 bg-black/30"
        onClick={handleBackdropClose}
      />
      <aside
        aria-label="Debug panel"
        className="page-surface pointer-events-auto fixed inset-y-0 left-0 z-30 flex w-72 max-w-[85vw] flex-col gap-5 overflow-y-auto p-3 shadow-lg"
      >
        <header className="flex items-center justify-between gap-2">
          <h2 className="m-0 text-lg font-bold">Debug</h2>
          <button
            type="button"
            aria-label="Close"
            className="control-surface cursor-pointer px-2 py-1 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <section className="flex flex-col gap-2">
          <h3 className="m-0 text-sm font-semibold">Time of day</h3>
          <Panel layout="horizontal" className="[--frame-scale:0.28]">
            {timeOfDayPhases.map(({ id, label }) => (
              <Button
                key={id}
                layout="horizontal"
                active={currentPhase === id}
                className="px-2 py-1 text-xs"
                onClick={() => {
                  setDebugTimeOfDay(id);
                }}
              >
                {label}
              </Button>
            ))}
          </Panel>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="m-0 text-sm font-semibold">Zeppelin</h3>
          <Panel layout="vertical" className="[--frame-scale:0.3]">
            <Button
              layout="horizontal"
              className="w-full text-sm"
              onClick={() => {
                hurryArrival();
              }}
            >
              Arrive in 5 seconds
            </Button>
          </Panel>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="m-0 text-sm font-semibold">Grant skill</h3>
          <div className="flex min-w-0 items-stretch gap-2">
            <select
              className="control-surface min-w-0 flex-1 px-2 py-1.5 text-sm"
              value={selectedSkillId}
              onChange={(event) => {
                setSelectedSkillId(event.target.value);
              }}
            >
              {skillGroups.map((group) => (
                <optgroup key={group.professionId} label={group.title}>
                  {group.skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              className="control-surface shrink-0 cursor-pointer px-3 py-1.5 text-sm"
              disabled={selectedSkillId === ''}
              onClick={handleGrantSkill}
            >
              Grant
            </button>
          </div>
        </section>
      </aside>
    </>
  );
}
