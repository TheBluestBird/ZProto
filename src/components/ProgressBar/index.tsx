import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import type { Layout, Size } from '@components/shared';

import './index.css';

interface ProgressBarCommonProps {
  size?: Size;
  layout?: Layout;
  className?: string;
}

interface ValueProgressBarProps extends ProgressBarCommonProps {
  mode?: 'value';
  value: number;
  label?: ReactNode;
}

interface TimedProgressBarProps extends ProgressBarCommonProps {
  mode: 'timed';
  startedAt: number;
  totalMs: number;
}

export type ProgressBarProps = ValueProgressBarProps | TimedProgressBarProps;

const timedLabelUpdateMs = 250;

const sizeClasses: Record<
  Size,
  {
    horizontal: string;
    vertical: string;
    label: string;
  }
> = {
  small: {
    horizontal: 'h-progress-bar-sm min-h-progress-bar-sm',
    vertical: 'w-progress-bar-sm min-w-progress-bar-sm',
    label: 'px-2 py-px text-[0.625rem] leading-snug',
  },
  normal: {
    horizontal: 'h-progress-bar-md min-h-progress-bar-md',
    vertical: 'w-progress-bar-md min-w-progress-bar-md',
    label: 'px-3.5 py-1 text-xs leading-snug',
  },
  large: {
    horizontal: 'h-progress-bar-lg min-h-progress-bar-lg',
    vertical: 'w-progress-bar-lg min-w-progress-bar-lg',
    label: 'px-4 py-1 text-sm leading-snug',
  },
};

function clampProgress(value: number) {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function clampMs(value: number) {
  if (value < 0) {
    return 0;
  }

  return value;
}

function formatProgressTime(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(totalSeconds)}s`;
}

export function ProgressBar(props: ProgressBarProps) {
  const { size = 'normal', layout = 'horizontal', className } = props;
  const isTimed = props.mode === 'timed';
  const startedAt = isTimed ? props.startedAt : 0;
  const totalMs = isTimed ? clampMs(props.totalMs) : 0;
  const [now, setNow] = useState(() => Date.now());
  const [animationElapsedMs, setAnimationElapsedMs] = useState(0);

  useEffect(() => {
    if (!isTimed || totalMs <= 0) {
      return;
    }

    const endAt = startedAt + totalMs;
    const timerId = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      if (currentTime >= endAt) {
        window.clearInterval(timerId);
      }
    }, timedLabelUpdateMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isTimed, startedAt, totalMs]);

  useEffect(() => {
    if (!isTimed || totalMs <= 0) {
      setAnimationElapsedMs(0);
      return;
    }

    const initialElapsed = Math.min(totalMs, Math.max(0, Date.now() - startedAt));
    setAnimationElapsedMs(initialElapsed);
  }, [isTimed, startedAt, totalMs]);

  const durationMs = isTimed ? Math.max(1, totalMs) : 0;
  const elapsedMs = isTimed
    ? Math.min(durationMs, Math.max(0, now - startedAt))
    : 0;
  const progress = isTimed
    ? clampProgress(elapsedMs / durationMs)
    : clampProgress(props.value);
  const label = isTimed
    ? formatProgressTime(Math.max(0, durationMs - elapsedMs))
    : props.label;
  const classes = sizeClasses[size];
  const dimension =
    layout === 'horizontal' ? classes.horizontal : classes.vertical;
  const progressPercent = String(progress * 100);
  const fillStyle: CSSProperties = isTimed
    ? {
      width: layout === 'horizontal' ? '100%' : undefined,
      height: layout === 'vertical' ? '100%' : undefined,
      ['--progress-duration-ms' as string]: `${durationMs}ms`,
      ['--progress-delay-ms' as string]: `-${animationElapsedMs}ms`,
      ['--progress-static-horizontal' as string]: String(progress),
      ['--progress-static-vertical' as string]: String(progress),
    }
    : layout === 'horizontal'
      ? { width: `${progressPercent}%` }
      : { height: `${progressPercent}%` };
  const fillPosition =
    layout === 'horizontal'
      ? 'inset-y-0 left-0'
      : 'inset-x-0 bottom-0';
  const fillAnimationClass = isTimed
    ? layout === 'horizontal'
      ? 'fill-animated-horizontal'
      : 'fill-animated-vertical'
    : 'transition-[width,height] duration-150 linear motion-reduce:transition-none';
  const fillKey = isTimed ? `${startedAt}:${durationMs}:${layout}` : 'value';
  const rootClasses =
    'progressbar relative isolate grid min-h-0 min-w-0 place-items-center rounded-full ' +
    layout +
    ' ' +
    size +
    ' ' +
    dimension +
    (layout === 'horizontal' ? ' w-full' : ' h-full') +
    (className ? ' ' + className : '');

  return (
    <div
      className={rootClasses}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="track absolute inset-0 overflow-hidden rounded-[inherit]"
        aria-hidden
      >
        <div className="groove">
          <div
            key={fillKey}
            className={
              'fill absolute ' + fillAnimationClass + ' ' + fillPosition
            }
            style={fillStyle}
          />
        </div>
      </div>
      {label !== undefined ? (
        <div
          className={
            'label relative z-1 box-border w-full min-w-0 text-center font-bold ' +
            classes.label
          }
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
