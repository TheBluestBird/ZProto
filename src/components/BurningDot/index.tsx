import type { ReactNode } from 'react';

import dotDes from './assets/dot_des.png';
import dotEn from './assets/dot_en.png';

/**
 * - `inline`: in document flow (book tabs — avoids clipping under overflow-hidden ancestors).
 * - `above`: centered just outside a `relative` anchor.
 * - `tag`: top-right overlay on a `relative` parent — use via `NewTag`.
 */
export type BurningDotPlacement = 'inline' | 'above' | 'tag';

const placementClasses: Record<BurningDotPlacement, string> = {
  inline: 'pointer-events-none relative mx-auto size-7 shrink-0',
  above: 'pointer-events-none absolute left-1/2 -top-3 size-7 -translate-x-1/2',
  tag: 'pointer-events-none absolute -right-1 -top-1 size-7',
};

export interface BurningDotProps {
  placement?: BurningDotPlacement;
  className?: string;
}

export function BurningDot({ placement = 'above', className }: BurningDotProps) {
  const classes = placementClasses[placement] + (className ? ' ' + className : '');

  return (
    <div className={classes} aria-hidden>
      <img src={dotDes} alt="" className="absolute inset-0 size-full object-contain" />
      <img src={dotEn} alt="" className="absolute inset-0 size-full object-contain" />
    </div>
  );
}

export interface NewTagProps {
  children: ReactNode;
  show?: boolean;
}

/** Overlays a burning dot on the tagged element without shifting surrounding layout. */
export function NewTag({ children, show = true }: NewTagProps) {
  if (!show) {
    return children;
  }

  return (
    <div className="relative inline-grid shrink-0">
      {children}
      <BurningDot placement="tag" />
    </div>
  );
}
