import { CreationBlock } from '@components/Book/CreationBlock';
import { Ingredient } from '@components/Book/Ingredient';
import { Portrait } from '@components/Portrait';
import { Plan } from '@game/events/Plan';
import { useGameDispatch } from '@game/hooks/useGameDispatch';
import { useWorkshopSkillState } from '@game/hooks/useWorkshopSkillState';
import { gameLibrary } from '@game/library/gameLibrary';
import {
  getSkillDescription,
  getSkillDurationLabel,
  getSkillXp,
} from '@game/library/skillDisplay';
import type { LibrarySkill } from '@game/library/types';

export interface WorkshopCreationProps {
  skill: LibrarySkill;
}

function HourglassIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-page-text/70"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6 2v6l4 4-4 4v6h12v-6l-4-4 4-4V2H6zm2 2h8v3.17L13.83 12 16 14.17V18H8v-3.83L10.17 12 8 9.83V4z" />
    </svg>
  );
}

export function WorkshopCreation({ skill }: WorkshopCreationProps) {
  const dispatch = useGameDispatch();
  const workshopSkill = useWorkshopSkillState(skill);
  const item = gameLibrary.items[skill.id];
  const title = item?.name ?? skill.id;
  const description = getSkillDescription(skill);
  const canPlan = workshopSkill.canPlan;
  const ingredients = skill.ingredients.slice(0, 3);
  const slots: Array<(typeof ingredients)[number] | null> = [...ingredients];
  while (slots.length < 3) {
    slots.push(null);
  }

  function handleCreate(quantity: number) {
    if (!canPlan) return;
    dispatch(new Plan(skill.id, quantity));
  }

  const titleBlock = (
    <>
      <h1 className="font-serif text-2xl font-bold leading-tight">{title}</h1>
      {description ? (
        <p className="mt-1 text-sm italic leading-snug text-page-text/75">{description}</p>
      ) : null}
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col py-1">
      {workshopSkill.isCraft ? (
        <div className="mb-2 grid shrink-0 grid-cols-[2fr_1fr] items-start gap-2">
          <Portrait iconSrc={skill.icon} iconAlt={title} className="aspect-square h-auto w-[47%] justify-self-center" />
          <div className="min-w-0">{titleBlock}</div>
        </div>
      ) : (
        <div className="mb-2 shrink-0">
          <div className="flex justify-center">
            <Portrait
              iconSrc={skill.icon}
              iconAlt={title}
              className="aspect-square h-auto w-[31%]"
            />
          </div>
          <div className="mt-2 min-w-0">{titleBlock}</div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col pt-1">
        {workshopSkill.isCraft ? (
          <section className="flex-1">
            <h4 className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-page-text/60">
              Required materials
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((ingredient, index) => (
                <Ingredient
                  key={ingredient?.itemId ?? `empty-${index}`}
                  ingredient={ingredient}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-4 pt-1">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-serif text-xl font-bold">
          {workshopSkill.isCraft ? (
            <span>Max: {workshopSkill.maxCraftableQuantity}</span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <HourglassIcon />
            {getSkillDurationLabel(skill)}
          </span>
          <span>XP: {getSkillXp(skill)}</span>
        </div>

        <CreationBlock
          maxCount={workshopSkill.maxCraftableQuantity}
          disabled={!canPlan}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
