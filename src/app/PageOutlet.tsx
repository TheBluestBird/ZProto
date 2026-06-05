import { useNavigation } from '@navigation/useNavigation';

/** Active route page — middle layer above Scene, below Overlay. */
export function PageOutlet() {
  const { page } = useNavigation();
  const { Component } = page;

  return (
    <div className="pointer-events-none relative z-[1] min-h-dvh w-full overflow-hidden">
      <Component />
    </div>
  );
}
