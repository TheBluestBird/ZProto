import { Frame } from '@components/Frame';
import { ProgressBar } from '@components/ProgressBar';
import type { LibraryFaction } from '@game/library/types';

export function CaptainSidebar({
  faction,
  reputation,
}: {
  faction: LibraryFaction;
  reputation: number;
}) {
  const thresholds = faction.milestones.map((m) => m.reputation).sort((a, b) => a - b);
  const next = thresholds.find((t) => t > reputation) ?? thresholds.at(-1) ?? reputation;
  const repRatio = next > 0 ? reputation / next : 0;

  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="size-16 sm:size-36 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-page-text/5">
        <img src={faction.portrait} alt={faction.name} className="size-full object-cover object-top" />
      </div>

      <div className="flex min-w-0 flex-1 sm:w-64 sm:flex-none flex-col gap-2">
        <div className="px-0.5">
          <h3 className="font-serif text-lg font-bold leading-tight">{faction.name}</h3>
          <p className="text-xs opacity-60">Zeppelin captain</p>
        </div>
        <Frame contentClassName="page-surface flex flex-col gap-1.5 p-2.5">
          <ProgressBar
            value={repRatio}
            size="small"
            label={`${reputation} / ${next}`}
          />
        </Frame>
        <Frame contentClassName="page-surface flex items-center justify-between px-2.5 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-page-text/60">Standing</span>
          <span className="text-sm font-bold uppercase tracking-wide text-accent-cyan">
            {faction.mood}
          </span>
        </Frame>
      </div>
    </div>
  );
}
