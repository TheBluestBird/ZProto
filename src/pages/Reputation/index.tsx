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
import {
  factions,
  factionOrder,
  type Faction,
  type FactionMilestone,
  type FactionQuest,
} from '@game/factions';

import { definePage } from '../definePage';

import background from './assets/background.png';
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

function factionPanel(faction: Faction) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-col sm:flex-row shrink-0 gap-3 sm:gap-4">
        <CaptainSidebar faction={faction} />
        <LorePanel title="What we know">
          <p>{faction.lore}</p>
        </LorePanel>
      </div>

      {/* Desktop: two columns */}
      <div className="hidden sm:flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-[3] flex-col">
          <SectionHeading>Captain&apos;s errands</SectionHeading>
          <ScrollArea className="min-h-0 flex-1">
            {faction.quests.map((q) => (
              <DetailedQuestCard key={q.id} quest={q} />
            ))}
          </ScrollArea>
        </div>
        <div className="flex min-h-0 min-w-0 flex-[2] flex-col border-l border-border-subtle pl-2">
          <SectionHeading>Reputation rewards</SectionHeading>
          <ScrollArea className="min-h-0 flex-1">
            {faction.milestones.map((m, i) => (
              <MilestoneRow key={m.reputation} milestone={m} index={i} />
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Mobile: stacked scroll */}
      <div className="flex sm:hidden min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1">
          <SectionHeading>Captain&apos;s errands</SectionHeading>
          {faction.quests.map((q) => (
            <DetailedQuestCard key={q.id} quest={q} />
          ))}
          <div className="mt-3 border-t border-border-subtle pt-3">
            <SectionHeading>Reputation rewards</SectionHeading>
            {faction.milestones.map((m, i) => (
              <MilestoneRow key={m.reputation} milestone={m} index={i} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export const reputationPage = definePage({
  id: "reputation",
  path: "/reputation",
  title: "Reputation",
  icon,
  background,
  transparentBackground: true,
  children: (
    <Book
      name="Reputation"
      panels={factionOrder.map((id) => ({
        id,
        label: factions[id].name,
        icon: factions[id].crest,
        content: factionPanel(factions[id]),
      }))}
    />
  ),
});
