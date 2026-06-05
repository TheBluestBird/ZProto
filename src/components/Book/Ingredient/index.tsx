import { Frame } from '@components/Frame';
import { useGameState } from '@game/hooks/useGameState';
import { gameLibrary } from '@game/library/gameLibrary';
import type { Ingredient as IngredientData } from '@game/library/types';

import emptySlotImage from './assets/empty-slot.png';

export interface IngredientProps {
  ingredient?: IngredientData | null;
  className?: string;
}

export function Ingredient({ ingredient, className }: IngredientProps) {
  const inventory = useGameState((state) => state.inventory);
  const isEmpty = ingredient == null;
  const item = ingredient ? gameLibrary.items[ingredient.itemId] : undefined;
  const inventoryCount = ingredient ? (inventory[ingredient.itemId] ?? 0) : 0;
  const requiredCount = ingredient?.quantity ?? 0;
  const title = item?.name ?? ingredient?.itemId ?? '';
  const iconSrc = item?.icon ?? emptySlotImage;
  const classes =
    'ingredient' +
    (className ? ' ' + className : '');

  return (
    <Frame
      className={classes}
      contentClassName={
        'page-surface flex flex-col items-center gap-1 p-1.5 text-center' +
        (isEmpty ? ' justify-center' : '')
      }
    >
      <div className="icon-slot size-[3rem]">
        <img src={iconSrc} alt={isEmpty ? '' : title} className="size-full object-contain" />
      </div>
      {!isEmpty && (
        <>
          <h3 className="m-0 w-full truncate font-serif text-xs font-bold leading-snug">{title}</h3>
          <p className="m-0 text-xs tabular-nums leading-snug opacity-75">
            {inventoryCount} / {requiredCount}
          </p>
        </>
      )}
    </Frame>
  );
}
