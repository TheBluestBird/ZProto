import { ValueBadge, coinIcon, reputationIcon } from '@components/ValueBadge';
import type { FactionQuest } from '@game/library/types';

export function QuestRewards({ reward }: { reward: FactionQuest['reward'] }) {
  const hasBlueprint = reward.blueprints > 0;

  return (
    <div className="flex w-full flex-col items-center gap-1 text-xs font-bold leading-snug text-page-text/75">
      <div className="flex items-center justify-center gap-3">
        <ValueBadge icon={coinIcon} value={reward.coins} label="Gold" />
        <ValueBadge icon={reputationIcon} value={reward.reputation} label="Reputation" prefix="+" />
      </div>
      <span className={hasBlueprint ? '' : 'invisible'} aria-hidden={!hasBlueprint}>
        Blueprint ×{hasBlueprint ? reward.blueprints : 1}
      </span>
    </div>
  );
}
