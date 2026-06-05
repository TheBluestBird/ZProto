import { Panel } from '@components/Panel';
import {
  advanceTimeOfDay,
  nextPhase,
  phaseLabel,
  useTimeOfDay,
} from '@pages/Tower/TowerScene/timeOfDay';

export function TimeOfDayToggle() {
  const phase = useTimeOfDay();
  const upcoming = nextPhase(phase);

  return (
    <div className="pointer-events-auto">
      <Panel layout="horizontal" className="shrink-0 [--frame-scale:0.45]">
        <button
          type="button"
          onClick={() => advanceTimeOfDay()}
          title={`Time of day: ${phaseLabel(phase)} — tap for ${phaseLabel(upcoming)}`}
          className="m-0 flex shrink-0 cursor-pointer appearance-none items-center gap-2 border-0 bg-transparent px-4 py-2 text-left text-button-text"
        >
          <span className="font-bold leading-tight">{phaseLabel(phase)}</span>
        </button>
      </Panel>
    </div>
  );
}
