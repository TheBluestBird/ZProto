import { useState } from 'react';
import { Book } from '@components/Book';
import { Portrait } from '@components/Portrait';
import { ScrollArea } from '@components/ScrollArea';

import { gameLibrary } from '@game/library/gameLibrary';
import { useGameState } from '@game/hooks/useGameState';
import type { LibraryItem } from '@game/library/types';
import { definePage } from '../definePage';

import { InventoryItem } from './InventoryItem';
import icon from './assets/icon.png';

function ItemDetail({ item, quantity }: { item: LibraryItem; quantity: number }) {
  const price = item.price;
  const total = price !== undefined ? price * quantity : undefined;

  return (
    <div className="flex flex-col gap-3 p-3 sm:h-full sm:items-center sm:p-4 sm:text-center">
      <div className="flex items-start gap-3 sm:flex-col sm:items-center">
        <Portrait
          iconSrc={item.icon}
          iconAlt={item.name}
          className="size-16 shrink-0 sm:aspect-square sm:h-auto sm:w-full"
        />
        <div className="min-w-0 flex-1 sm:flex-initial">
          <h3 className="font-serif text-base font-bold leading-tight sm:text-xl">{item.name}</h3>
          <p className="mt-1 text-sm italic leading-snug opacity-70 sm:mt-0 sm:text-center">
            {item.description}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1 border-t border-border-muted pt-3 sm:mt-auto sm:w-full">
        <div className="flex justify-between text-sm">
          <span className="opacity-60">In stock</span>
          <span className="font-bold tabular-nums">{quantity}</span>
        </div>
        {price !== undefined && (
          <>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Price each</span>
              <span className="font-bold tabular-nums">{price} g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Total value</span>
              <span className="font-bold tabular-nums text-accent-cyan">{total} g</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DefaultDetail({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <h3 className="mb-3 font-serif text-2xl font-bold">{title}</h3>
      <p className="text-sm leading-relaxed opacity-75">{blurb}</p>
    </div>
  );
}

export function InventoryComponent() {
  const inventory = useGameState((state) => state.inventory);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const items = Object.values(gameLibrary.items);

  const rawMaterials = items.filter((item) =>
    item.id.startsWith('fishing_') || item.id.startsWith('lumber_') || item.id.startsWith('mining_')
  );

  const craftedGoods = items.filter((item) =>
    item.id.startsWith('cooking_') || item.id.startsWith('carpentry_') || item.id.startsWith('blacksmith_')
  );

  function renderItemGrid(itemsList: typeof items) {
    const owned = itemsList.filter((item) => (inventory[item.id] ?? 0) > 0);

    if (owned.length === 0) {
      return (
        <p className="py-8 text-center text-page-text/40">Nothing in stock yet.</p>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1 pr-1">
        {owned.map((item) => (
          <InventoryItem
            key={item.id}
            itemId={item.id}
            quantity={inventory[item.id] ?? 0}
            selected={selectedItemId === item.id}
            onClick={() => setSelectedItemId(item.id)}
          />
        ))}
      </div>
    );
  }

  function inventoryPanel(itemsList: typeof items, title: string, blurb: string) {
    const selectedItem = selectedItemId ? gameLibrary.items[selectedItemId] : null;
    const selectedQty = selectedItemId ? (inventory[selectedItemId] ?? 0) : 0;
    const isSelectedInThisList = selectedItem
      ? itemsList.some((i) => i.id === selectedItemId)
      : false;

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col sm:flex-row">
        <section className="flex min-h-0 min-w-0 flex-[2] flex-col">
          <ScrollArea className="min-h-0 flex-1">{renderItemGrid(itemsList)}</ScrollArea>
        </section>
        <div className="hidden sm:block w-px shrink-0 self-stretch bg-button-text" aria-hidden />
        <section className="flex min-w-0 shrink-0 flex-col border-t border-button-text sm:min-h-0 sm:flex-1 sm:overflow-hidden sm:border-t-0">
          {isSelectedInThisList && selectedItem ? (
            <ItemDetail item={selectedItem} quantity={selectedQty} />
          ) : (
            <DefaultDetail title={title} blurb={blurb} />
          )}
        </section>
      </div>
    );
  }

  return (
    <Book
      name="Inventory"
      panels={[
        {
          id: 'raw',
          label: 'Raw Materials',
          content: inventoryPanel(
            rawMaterials,
            'Resource Stockpile',
            'Raw goods gathered from the river, mine, and forests.',
          ),
        },
        {
          id: 'crafted',
          label: 'Crafted Goods',
          content: inventoryPanel(
            craftedGoods,
            'Artisan Output',
            'Refined and created by your blacksmiths, carpenters, and cooks.',
          ),
        },
      ]}
    />
  );
}

export const inventoryPage = definePage({
  id: "inventory",
  path: "/inventory",
  title: "Inventory",
  icon,
  children: <InventoryComponent />,
});
