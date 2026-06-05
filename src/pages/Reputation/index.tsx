import { Book } from '@components/Book';
import {
  CaptainSidebar,
  LorePanel,
  QuestRewards,
  SectionHeading,
} from '@components/Faction';
import { NewTag } from '@components/BurningDot';
import { Frame } from '@components/Frame';
import { LevelBadge } from '@components/LevelBadge';
import { ScrollArea } from '@components/ScrollArea';
import { FACTION_IDS } from '@game/domain/factions';
import { useGameState } from '@game/hooks/useGameState';
import { gameLibrary } from '@game/library/gameLibrary';
import type { FactionId } from '@game/state/types';
import type { FactionMilestone, FactionQuest } from '@game/library/types';

import { definePage } from '../definePage';

import icon from './assets/icon.png';

function DetailedQuestCard({ quest }: { quest: FactionQuest }) {
  const done = quest.delivered >= quest.required;
  const started = quest.delivered > 0 && !done;
  const isNew = !started && !done;

  return (
    <Frame contentClassName="page-surface flex gap-3 p-3">
      <NewTag show={isNew}>
        <div className="icon-slot size-20 shrink-0">
          <img src={quest.icon} alt={quest.itemName} className="size-full object-contain" />
        </div>
      </NewTag>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h4 className="font-serif text-sm font-bold leading-tight">{quest.itemName}</h4>
        <p className="text-sm leading-snug opacity-75">{quest.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm opacity-70">Required: {quest.required}</span>
          <span className="font-mono text-sm font-bold tabular-nums">
            {quest.delivered} / {quest.required}
          </span>
        </div>
        <div className="mt-auto border-t border-border-subtle pt-1.5">
          <QuestRewards reward={quest.reward} />
        </div>
      </div>
    </Frame>
  );
}

function RewardChip({
  icon,
  name,
  kind,
  dimmed,
}: {
  icon: string;
  name: string;
  kind: string;
  dimmed: boolean;
}) {
  return (
    <div className={'flex min-w-0 flex-1 items-center gap-2 ' + (dimmed ? 'opacity-50' : '')}>
      <div className="icon-slot size-9 shrink-0">
        <img src={icon} alt={name} className="size-full object-contain" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-page-text/60">{kind}</span>
        <span className="truncate text-sm font-bold leading-tight">{name}</span>
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, index }: { milestone: FactionMilestone; index: number }) {
  const { reached } = milestone;

  return (
    <Frame
      {...(reached ? { className: 'selected' } : {})}
      contentClassName="page-surface flex items-center gap-3 p-2.5"
    >
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <LevelBadge
          level={{ value: index + 1, progress: reached ? 1 : 0, target: 1 }}
          size="small"
          className={reached ? '' : 'opacity-disabled'}
        />
        <span className="font-mono text-[10px] font-bold opacity-55">{milestone.reputation}</span>
      </div>

      <div className="flex min-w-0 flex-1 gap-2">
        <RewardChip
          icon={milestone.blueprintReward.icon}
          name={milestone.blueprintReward.name}
          kind="Blueprint"
          dimmed={!reached}
        />
        <RewardChip
          icon={milestone.decorationReward.icon}
          name={milestone.decorationReward.name}
          kind="Decoration"
          dimmed={!reached}
        />
      </div>
    </Frame>
  );
}

function FactionReputationPanel({ factionId }: { factionId: FactionId }) {
  const faction = gameLibrary.factions[factionId];
  const reputation = useGameState((state) => state.player.reputation[factionId]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:gap-4">
        <CaptainSidebar faction={faction} reputation={reputation} />
        <LorePanel title="What we know">
          <p>{faction.lore}</p>
        </LorePanel>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ScrollArea className="min-h-0">
          <SectionHeading>Captain&apos;s errands</SectionHeading>
          {faction.quests.map((q) => (
            <DetailedQuestCard key={q.id} quest={q} />
          ))}
        </ScrollArea>
        <ScrollArea className="min-h-0 border-t border-border-subtle pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2">
          <SectionHeading>Reputation rewards</SectionHeading>
          {faction.milestones.map((m, i) => (
            <MilestoneRow key={m.reputation} milestone={m} index={i} />
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}

function ReputationBook() {
  return (
    <Book
      name="Reputation"
      panels={FACTION_IDS.map((id) => ({
        id,
        label: gameLibrary.factions[id].name,
        icon: gameLibrary.factions[id].crest,
        content: <FactionReputationPanel factionId={id} />,
      }))}
    />
  );
}

export const reputationPage = definePage({
  id: "reputation",
  path: "/reputation",
  title: "Reputation",
  icon,
  children: <ReputationBook />,
});
