import type { Size } from '@components/shared';
import type { LevelProgress } from '@game/state/types';

import levelBadgeBg from './dot_des.png';

export interface LevelBadgeProps {
  level: LevelProgress;
  size?: Size;
  className?: string;
  onDoubleClick?: () => void;
}

const sizeClasses: Record<Size, { container: string; label: string }> = {
  small: {
    container: 'size-8',
    label: 'text-xs font-semibold',
  },
  normal: {
    container: 'size-10',
    label: 'text-sm font-semibold',
  },
  large: {
    container: 'size-12',
    label: 'text-xl font-semibold',
  },
};

export function LevelBadge({
  level,
  size = 'normal',
  className,
  onDoubleClick,
}: LevelBadgeProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={`relative grid select-none place-items-center text-button-text ${classes.container}${className ? ' ' + className : ''}${onDoubleClick ? ' cursor-pointer' : ''}`}
      aria-label={`Level ${level.value}`}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDoubleClick?.();
      }}
    >
      <img
        className="pointer-events-none col-start-1 row-start-1 size-full object-contain"
        src={levelBadgeBg}
        alt=""
        aria-hidden
        decoding="async"
      />
      <h2
        className={`z-10 col-start-1 row-start-1 select-none text-center leading-none ${classes.label}`}
      >
        {level.value}
      </h2>
    </div>
  );
}
