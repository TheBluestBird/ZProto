import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';

import './index.css';

export interface ScrollAreaProps {
  children?: ReactNode;
  className?: string;
}

export function ScrollArea({ children, className }: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScrollTop: number } | null>(null);
  const touchRef = useRef<{ startY: number; startScrollTop: number } | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  const classes = 'scroll-area flex min-h-0 flex-1 mr-1' + (className ? ' ' + className : '');
  const maxScrollTop = Math.max(contentHeight - viewportHeight, 0);
  const thumbHeight =
    maxScrollTop > 0 && trackHeight > 0
      ? Math.max(32, (viewportHeight / contentHeight) * trackHeight)
      : trackHeight;
  const maxThumbTop = Math.max(trackHeight - thumbHeight, 0);
  const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

  const updateMeasurements = useCallback(() => {
    const nextViewportHeight = viewportRef.current?.clientHeight ?? 0;
    const nextContentHeight = contentRef.current?.scrollHeight ?? 0;
    const nextTrackHeight = trackRef.current?.clientHeight ?? 0;

    setViewportHeight(nextViewportHeight);
    setContentHeight(nextContentHeight);
    setTrackHeight(nextTrackHeight);
    setScrollTop((current) => Math.min(current, Math.max(nextContentHeight - nextViewportHeight, 0)));
  }, []);

  const scrollTo = useCallback(
    (nextScrollTop: number) => {
      setScrollTop(Math.min(Math.max(nextScrollTop, 0), maxScrollTop));
    },
    [maxScrollTop]
  );

  const scrollTopRef = useRef(scrollTop);
  scrollTopRef.current = scrollTop;
  const maxScrollTopRef = useRef(maxScrollTop);
  maxScrollTopRef.current = maxScrollTop;

  function handleStep(direction: -1 | 1) {
    scrollTo(scrollTop + direction * 80);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchRef.current = { startY: event.touches[0].clientY, startScrollTop: scrollTop };
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (!touchRef.current) return;
    const delta = touchRef.current.startY - event.touches[0].clientY;
    scrollTo(touchRef.current.startScrollTop + delta);
  }

  function handleTouchEnd() {
    touchRef.current = null;
  }

  function handleThumbPointerDown(event: PointerEvent<HTMLButtonElement>) {
    dragRef.current = {
      startY: event.clientY,
      startScrollTop: scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleThumbPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current || maxThumbTop <= 0) return;

    const delta = event.clientY - dragRef.current.startY;
    scrollTo(dragRef.current.startScrollTop + (delta / maxThumbTop) * maxScrollTop);
  }

  function handleThumbPointerUp(event: PointerEvent<HTMLButtonElement>) {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  useEffect(() => {
    updateMeasurements();

    const resizeObserver = new ResizeObserver(updateMeasurements);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);

    return () => resizeObserver.disconnect();
  }, [children, updateMeasurements]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (maxScrollTopRef.current <= 0) return;
      event.preventDefault();
      scrollTo(scrollTopRef.current + event.deltaY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes}>
      <div
        ref={viewportRef}
        className="min-h-0 flex-1 overflow-hidden my-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={contentRef} style={{ transform: `translateY(-${scrollTop}px)` }}>
          <div className="flex flex-col mr-1 gap-y-2">
            {children}
          </div>
        </div>
      </div>
      <div className="bar flex w-6 flex-none flex-col items-center text-button-text">
        <button
          type="button"
          className="control grid size-6 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
          aria-label="Scroll up"
          onClick={() => handleStep(-1)}
        >
          <span className="arrow up" aria-hidden />
        </button>
        <div ref={trackRef} className="track relative min-h-0 flex-1">
          <button
            type="button"
            className="thumb absolute top-0 left-[calc(50%-0.375rem)] w-3 min-h-8 cursor-grab touch-none rounded-full border border-button-text bg-page-bg p-0"
            aria-label="Scroll"
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`,
            }}
          />
        </div>
        <button
          type="button"
          className="control grid size-6 cursor-pointer place-items-center border-0 bg-transparent p-0 text-inherit"
          aria-label="Scroll down"
          onClick={() => handleStep(1)}
        >
          <span className="arrow down" aria-hidden />
        </button>
      </div>
    </div>
  );
}
