import { Panel } from '@components/Panel';
import { coinIcon, formatResourceValue } from '@components/ValueBadge';
import { useGameState } from '@game/hooks/useGameState';

export interface CoinBadgeProps {
  className?: string;
}

export function CoinBadge({ className }: CoinBadgeProps = {}) {
  const gold = useGameState((state) => state.player.gold);

  const classes = 'shrink-0' + (className ? ' ' + className : '');

  return (
    <div className={classes}>
      <Panel layout="horizontal" className="header-coin-badge">
        <div
          className="coin-badge-inner"
          aria-label={`Gold: ${gold}`}
        >
          <img src={coinIcon} alt="" decoding="async" />
          <p className="coin-amount">{formatResourceValue(gold)}</p>
        </div>
      </Panel>
    </div>
  );
}
