import { useEffect, useState, type ReactNode } from 'react';

import { useNavigation } from '@navigation/useNavigation';
import { BurningDot } from '@components/BurningDot';
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

function BookTabButton({
  label,
  icon,
  isActive,
  widthPercent,
  onSelect,
}: {
  label: string;
  icon?: string;
  isActive: boolean;
  widthPercent: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="book-tab relative flex cursor-pointer items-end justify-center text-button-text transition-all"
      style={{
        width: `${widthPercent}%`,
        ['--book-tab-bg' as string]: `url(${isActive ? frameNameActive : frameName})`,
      }}
    >
      {isActive && <BurningDot placement="above" />}
      {icon ? (
        <span className="flex items-center gap-1 pb-2 px-1">
          <img src={icon} alt="" className="size-5 sm:size-7 object-contain" />
          <span className="font-serif text-xs sm:text-xl font-bold leading-none">{label}</span>
        </span>
      ) : (
        <span className="pb-2 px-1 text-sm sm:text-2xl font-bold leading-none">{label}</span>
      )}
    </button>
  );
}

export function Book({ name, panels }: BookProps) {
  const { tab } = useNavigation();
  const [activePanelId, setActivePanelId] = useState(() => resolveActivePanelId(panels, tab));

  useEffect(() => {
    const linkedId = resolveActivePanelId(panels, tab);
    if (linkedId) {
      setActivePanelId(linkedId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const showTabs = panels.length > 1;
  const tabWidthPercent = panels.length > 0 ? 100 / panels.length : 100;
  const activePanel = panels.find((panel) => panel.id === activePanelId) ?? panels[0];

  return (
    <div className="pointer-events-auto box-border flex h-dvh flex-col px-[var(--book-inset-x)] pt-[var(--book-inset-top)] pb-[var(--book-inset-bottom)]">
      <div className="book-wrapper mx-auto flex min-h-0 w-full max-w-[var(--book-max-width)] flex-1 flex-col">
        <h2 className="sr-only">{name}</h2>
        {showTabs && (
          <div className="book-tabs relative z-20 flex justify-center gap-1">
            {panels.map((panel) => (
              <BookTabButton
                key={panel.id}
                label={panel.label}
                {...(panel.icon !== undefined ? { icon: panel.icon } : {})}
                isActive={activePanelId === panel.id}
                widthPercent={tabWidthPercent}
                onSelect={() => setActivePanelId(panel.id)}
              />
            ))}
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
