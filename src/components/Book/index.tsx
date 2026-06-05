import { useEffect, useRef, useState, type ReactNode } from 'react';

import { BurningDot } from '@components/BurningDot';
import { useNavigation } from '@navigation/useNavigation';

import frameName from './assets/frame_name.png';
import frameNameActive from './assets/frame_name_add.png';
import './index.css';

interface BookPanel {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

export interface BookProps {
  name: string;
  panels: BookPanel[];
}

function resolveActivePanelId(panels: BookPanel[], tab: string | null | undefined): string | undefined {
  if (tab && panels.some((panel) => panel.id === tab)) {
    return tab;
  }
  return panels[0]?.id;
}

function BookTab({
  label,
  icon,
  isActive,
  onSelect,
}: {
  label: string;
  icon?: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative flex h-7 w-32 shrink-0 cursor-pointer items-end justify-center border-0 bg-transparent bg-size-[100%_100%] bg-bottom bg-no-repeat pt-5 text-button-text sm:h-[53px] sm:w-[232px] sm:pt-6"
      style={{ backgroundImage: `url(${isActive ? frameNameActive : frameName})` }}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive ? (
        <span className="pointer-events-none absolute -top-1 left-1/2 size-3 -translate-x-1/2 sm:-top-2 sm:size-6">
          <BurningDot placement="inline" className="size-full" />
        </span>
      ) : null}
      {icon ? (
        <span className="flex min-w-0 items-center gap-1 px-1.5 sm:gap-2 sm:px-2">
          <img src={icon} alt="" className="size-4 shrink-0 object-contain sm:size-6" />
          <span className="truncate font-serif text-xs font-bold leading-none sm:text-base">{label}</span>
        </span>
      ) : (
        <span className="truncate px-1.5 font-serif text-sm font-bold leading-none sm:px-2 sm:text-2xl">
          {label}
        </span>
      )}
    </button>
  );
}

export function Book({ name, panels }: BookProps) {
  const { tab } = useNavigation();
  const panelsRef = useRef(panels);
  panelsRef.current = panels;
  const [activePanelId, setActivePanelId] = useState(() => resolveActivePanelId(panels, tab));

  useEffect(() => {
    const linkedId = resolveActivePanelId(panelsRef.current, tab);
    if (linkedId) {
      setActivePanelId(linkedId);
    }
  }, [tab]);

  const showTabs = panels.length > 1;
  const activePanel = panels.find((panel) => panel.id === activePanelId) ?? panels[0];

  return (
    <div className="pointer-events-auto box-border flex h-dvh flex-col px-[var(--book-inset-x)] pt-[var(--book-inset-top)] pb-[var(--book-inset-bottom)]">
      <div className="book-wrapper mx-auto flex min-h-0 w-full max-w-[var(--book-max-width)] flex-1 flex-col">
        <h2 className="sr-only">{name}</h2>
        {showTabs && (
          <div
            className="relative z-20 shrink-0 px-4 -mb-[var(--book-tab-overlap)] sm:px-6"
            role="tablist"
            aria-label={name}
          >
            <div className="overflow-x-auto pt-2 text-center [scrollbar-width:none] sm:pt-3 [&::-webkit-scrollbar]:hidden">
              <div className="inline-flex gap-1">
                {panels.map((panel) => (
                  <BookTab
                    key={panel.id}
                    label={panel.label}
                    {...(panel.icon !== undefined ? { icon: panel.icon } : {})}
                    isActive={activePanelId === panel.id}
                    onSelect={() => setActivePanelId(panel.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="book relative z-0 min-h-0 flex-1">
          <div className="page page-surface h-full">
            <div className="inner flex h-full min-h-0 flex-col gap-3 p-4">
              {activePanel?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
