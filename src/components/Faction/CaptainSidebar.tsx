import { Frame } from '@components/Frame';
import { ProgressBar } from '@components/ProgressBar';
import type { Faction } from '@game/factions';

export function CaptainSidebar({ faction }: { faction: Faction }) {
  const repRatio =
    faction.reputation.next > 0
      ? faction.reputation.current / faction.reputation.next
      : 0;

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
            label={`${faction.reputation.current} / ${faction.reputation.next}`}
          />
        </Frame>
        <Frame contentClassName="page-surface flex items-center justify-between px-2.5 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-page-text/60">Standing</span>
          <span className="text-sm font-bold uppercase tracking-wide text-accent-cyan">
            {faction.reputation.label}
          </span>
        </Frame>
      </div>
    </div>
  );
}
