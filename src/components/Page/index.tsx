import type { ReactNode } from 'react';

export type PageProps = {
  children?: ReactNode;
  className?: string;
};

/** Page shell over the Scene layer; content sets pointer-events where needed. */
export function Page({ children, className }: PageProps) {
  const classes = 'h-full w-full' + (className ? ' ' + className : '');

  return <div className={classes}>{children}</div>;
}
