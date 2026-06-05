import { Panel } from '@components/Panel';
import { useFactionVisit } from '@game/hooks/useFactionVisit';
import { gameLibrary } from '@game/library/gameLibrary';
import { useNavigation } from '@navigation/useNavigation';

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface VisitStatusProps {
  className?: string;
}

export function VisitStatus({ className }: VisitStatusProps = {}) {
  const visit = useFactionVisit();
  const { navigate } = useNavigation();
  const faction = gameLibrary.factions[visit.factionId];
  const isDocked = visit.phase === 'docked';
  const countdown = formatCountdown(visit.secondsLeft);

  const copyClasses =
    'header-visit-copy' + (isDocked ? ' header-visit-copy--docked' : ' header-visit-copy--incoming');

  const rootClasses =
    'header-visit pointer-events-auto' + (className ? ' ' + className : '');

  return (
    <div className={rootClasses}>
      <Panel layout="horizontal" className="header-panel max-w-full shrink-0">
        <button
          type="button"
          onClick={() => navigate('zeppelins', visit.factionId)}
          className="header-visit-button"
        >
          <img src={faction.crest} alt="" />
          <span className={copyClasses}>
            {isDocked ? (
              <>
                <h3>Arrived: {faction.name}!</h3>
                <h4>Docked: {countdown}</h4>
              </>
            ) : (
              <>
                <h3>Zeppelin</h3>
                <h4>
                  arrives in{' '}
                  <time className="inline-block w-[4ch] text-right tabular-nums">
                    {countdown}
                  </time>
                </h4>
              </>
            )}
          </span>
        </button>
      </Panel>
    </div>
  );
}
