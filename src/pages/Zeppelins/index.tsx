import { type ReactNode, useState } from 'react';
import { Book } from '@components/Book';
import { NewTag } from '@components/BurningDot';
import { Button } from '@components/Button';
import { Frame } from '@components/Frame';
import { Panel } from '@components/Panel';
import {
  CaptainSidebar,
  LorePanel,
  QuestRewards,
  SectionHeading,
} from '@components/Faction';
import { ValueBadge, coinIcon, reputationIcon } from '@components/ValueBadge';
import { useFactionVisit } from '@game/hooks/useFactionVisit';
import { useGameState } from '@game/hooks/useGameState';
import { gameLibrary } from '@game/library/gameLibrary';
import type { FactionQuest, LibraryFaction } from '@game/library/types';

import { definePage } from '../definePage';

import icon from './assets/icon.png';

function CardAction({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <Panel layout="horizontal" className="w-full shrink-0">
      <Button
        className="w-full min-w-0 font-bold text-l"
        {...(disabled !== undefined ? { disabled } : {})}
      >
        {children}
      </Button>
    </Panel>
  );
}

function TradeCard({
  icon: itemIcon,
  name,
  sub,
  price,
  action,
}: {
  icon: string;
  name: string;
  sub?: string;
  price: number;
  action: string;
}) {
  return (
    <Frame
      className="h-full min-h-0"
      contentClassName="page-surface flex h-full min-h-0 flex-col gap-2 p-3 text-center"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center gap-2">
        <div className="icon-slot size-16">
          <img src={itemIcon} alt={name} className="size-full object-contain" />
        </div>
        <h4 className="line-clamp-2 font-serif text-sm font-bold leading-tight">{name}</h4>
        {sub && <span className="text-xs font-bold opacity-60">{sub}</span>}
        <ValueBadge icon={coinIcon} value={price} label="Price" />
      </div>
      <CardAction>{action}</CardAction>
    </Frame>
  );
}

function QuestCard({ quest }: { quest: FactionQuest }) {
  const done = quest.delivered >= quest.required;
  const started = quest.delivered > 0 && !done;

  return (
    <Frame
      className="h-full min-h-0"
      contentClassName="page-surface flex h-full min-h-0 flex-col gap-2 p-3 text-center"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center gap-2">
        <h4 className="font-serif text-sm font-bold leading-tight">{quest.itemName}</h4>

        <NewTag show={!started && !done}>
          <div className="icon-slot size-24">
            <img src={quest.icon} alt={quest.itemName} className="size-full object-contain" />
          </div>
        </NewTag>

        <p className="text-sm leading-snug opacity-75">{quest.description}</p>
        <span className="font-mono text-lg font-bold tabular-nums">
          {quest.delivered} / {quest.required}
        </span>

        <div className="mt-auto flex w-full flex-col items-center gap-1 border-t border-border-subtle pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-page-text/60">Reward</h4>
          <QuestRewards reward={quest.reward} />
        </div>
      </div>

      {done ? (
        <CardAction disabled>Complete</CardAction>
      ) : (
        <CardAction>{started ? 'Turn in' : 'Accept'}</CardAction>
      )}
    </Frame>
  );
}

function QuestRowMobile({ quest }: { quest: FactionQuest }) {
  const done = quest.delivered >= quest.required;
  const started = quest.delivered > 0 && !done;
  const isNew = !started && !done;

  return (
    <Frame contentClassName="page-surface flex gap-2.5 p-2">
      <NewTag show={isNew}>
        <div className="icon-slot size-16 shrink-0">
          <img src={quest.icon} alt={quest.itemName} className="size-full object-contain" />
        </div>
      </NewTag>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="min-w-0 truncate font-serif text-sm font-bold leading-tight">{quest.itemName}</h4>
          <span className="shrink-0 font-mono text-sm font-bold tabular-nums">
            {quest.delivered}/{quest.required}
          </span>
        </div>
        <p className="line-clamp-2 text-xs leading-snug opacity-75">{quest.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-subtle pt-1.5">
          <div className="flex items-center gap-2.5 text-xs font-bold text-page-text/75">
            <ValueBadge icon={coinIcon} value={quest.reward.coins} label="Gold" />
            <ValueBadge icon={reputationIcon} value={quest.reward.reputation} label="Reputation" prefix="+" />
            {quest.reward.blueprints > 0 && <span className="opacity-75">BP×{quest.reward.blueprints}</span>}
          </div>
          {done ? (
            <Button disabled className="shrink-0 px-3 py-1 text-xs font-bold">Done</Button>
          ) : (
            <Button className="shrink-0 px-3 py-1 text-xs font-bold">{started ? 'Turn in' : 'Accept'}</Button>
          )}
        </div>
      </div>
    </Frame>
  );
}

function QuestsSection({ faction }: { faction: LibraryFaction }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SectionHeading>Captain&apos;s errands</SectionHeading>
      <div className="grid min-h-0 flex-1 grid-cols-2 sm:grid-cols-4 items-stretch gap-3">
        {faction.quests.slice(0, 4).map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
      </div>
    </div>
  );
}

function TradeCell({
  icon: itemIcon,
  name,
  sub,
  price,
  action,
}: {
  icon: string;
  name: string;
  sub?: string;
  price: number;
  action: string;
}) {
  return (
    <Frame contentClassName="page-surface flex flex-col gap-1.5 p-2">
      <div className="flex items-center gap-2">
        <div className="icon-slot size-10 shrink-0">
          <img src={itemIcon} alt={name} className="size-full object-contain" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-xs font-bold">{name}</span>
          {sub && <span className="text-[10px] opacity-55">{sub}</span>}
          <ValueBadge icon={coinIcon} value={price} label="Price" />
        </div>
      </div>
      <Button className="w-full py-1 text-xs font-bold">{action}</Button>
    </Frame>
  );
}

function TradeListMobile({ faction }: { faction: LibraryFaction }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <SectionHeading>Trade</SectionHeading>
      <div className="flex flex-col gap-1.5">
        <span className="px-0.5 text-xs font-bold uppercase tracking-wider opacity-50">You sell</span>
        <div className="grid grid-cols-2 gap-1.5">
          {faction.buying.slice(0, 4).map((g) => (
            <TradeCell key={g.itemId} icon={g.icon} name={g.name} sub={`×${g.quantity}`} price={g.price} action="Sell" />
          ))}
        </div>
        <span className="mt-1 px-0.5 text-xs font-bold uppercase tracking-wider opacity-50">You buy</span>
        <div className="grid grid-cols-2 gap-1.5">
          {faction.goods.slice(0, 4).map((g) => (
            <TradeCell key={g.itemId} icon={g.icon} name={g.name} sub={`×${g.quantity}`} price={g.price} action="Buy" />
          ))}
        </div>
      </div>
    </div>
  );
}

function TradeSection({ faction }: { faction: LibraryFaction }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SectionHeading>Trade</SectionHeading>
      <div className="grid min-h-0 flex-1 grid-cols-2 items-stretch gap-4">
        <div className="flex min-h-0 flex-col">
          <span className="mb-1 text-xs font-bold uppercase tracking-wider opacity-50">Selling</span>
          <div className="grid flex-1 grid-cols-2 grid-rows-2 items-stretch gap-2">
            {faction.buying.slice(0, 4).map((g) => (
              <TradeCard key={g.itemId} icon={g.icon} name={g.name} sub={`×${g.quantity}`} price={g.price} action="Sell" />
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col border-l border-border-subtle pl-4">
          <span className="mb-1 text-xs font-bold uppercase tracking-wider opacity-50">Buying</span>
          <div className="grid flex-1 grid-cols-2 grid-rows-2 items-stretch gap-2">
            {faction.goods.slice(0, 4).map((g) => (
              <TradeCard key={g.itemId} icon={g.icon} name={g.name} sub={`×${g.quantity}`} price={g.price} action="Buy" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type ZepTab = 'quests' | 'trade';

function VisitPanel({ faction, reputation }: { faction: LibraryFaction; reputation: number }) {
  const [mobileTab, setMobileTab] = useState<ZepTab>('quests');

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-col sm:flex-row gap-3 sm:gap-4">
        <CaptainSidebar faction={faction} reputation={reputation} />
        <LorePanel title="Arrival">
          <span className="text-2xl leading-none opacity-40">&ldquo;</span>
          {faction.quote}
        </LorePanel>
      </div>

      <div className="hidden sm:flex min-h-0 flex-1 gap-5">
        <QuestsSection faction={faction} />
        <div className="flex min-h-0 min-w-0 flex-[2] flex-col border-l border-border-subtle pl-5">
          <TradeSection faction={faction} />
        </div>
      </div>

      <div className="flex sm:hidden min-h-0 flex-1 flex-col gap-2">
        <div className="flex shrink-0 gap-1">
          {(['quests', 'trade'] as ZepTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMobileTab(t)}
              className={
                'flex-1 rounded py-1.5 text-sm font-bold capitalize transition-colors ' +
                (mobileTab === t ? 'bg-button-bg text-button-text' : 'opacity-50')
              }
            >
              {t === 'quests' ? 'Errands' : 'Trade'}
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {mobileTab === 'quests' ? (
            <>
              <SectionHeading>Captain&apos;s errands</SectionHeading>
              <div className="flex flex-col gap-1.5">
                {faction.quests.slice(0, 4).map((q) => (
                  <QuestRowMobile key={q.id} quest={q} />
                ))}
              </div>
            </>
          ) : (
            <TradeListMobile faction={faction} />
          )}
        </div>
      </div>
    </div>
  );
}

function awaitingDock() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="font-serif text-2xl font-bold text-page-text/70">Awaiting the zeppelin…</p>
      <p className="max-w-md text-sm text-page-text/50">
        When a zeppelin docks at your tower, the captain will appear here ready to trade
        and hand out errands.
      </p>
    </div>
  );
}

function ZeppelinsBook() {
  const visit = useFactionVisit();
  const docked = visit.phase === 'docked';
  const faction = gameLibrary.factions[visit.factionId];
  const reputation = useGameState((state) => state.player.reputation[visit.factionId]);

  return (
    <Book
      name="Zeppelins"
      panels={[
        {
          id: 'visit',
          label: faction.name,
          content: docked ? <VisitPanel faction={faction} reputation={reputation} /> : awaitingDock(),
        },
      ]}
    />
  );
}

export const zeppelinsPage = definePage({
  id: "zeppelins",
  path: "/zeppelins",
  title: "Zeppelins",
  icon,
  children: <ZeppelinsBook />,
});
