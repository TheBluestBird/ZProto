import { Frame } from '@components/Frame';
import { getItem } from '@game/library/gameLibrary';

export interface InventoryItemProps {
  itemId: string;
  quantity: number;
  selected?: boolean;
  onClick?: () => void;
}

export function InventoryItem({ itemId, quantity, selected, onClick }: InventoryItemProps) {
  const item = getItem(itemId);
  if (!item) {
    return null;
  }

  const hoverTitle = `${item.name}\n\n${item.description}`;

  return (
    <Frame
      className={'inventory-item min-w-0 cursor-pointer' + (selected ? ' selected' : '')}
      contentClassName="page-surface grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 p-2"
      title={hoverTitle}
      onClick={onClick}
    >
      <div className="icon-slot size-10">
        <img src={item.icon} alt={item.name} className="size-full object-contain" />
      </div>
      <div className="grid h-10 min-w-0 grid-rows-2">
        <h4 className="truncate self-start font-serif text-sm font-bold leading-tight">{item.name}</h4>
        <span className="justify-self-end self-end font-mono text-sm font-bold tabular-nums leading-snug opacity-75">
          ×{quantity}
        </span>
      </div>
    </Frame>
  );
}
