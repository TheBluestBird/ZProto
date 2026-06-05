import { Page } from '@components/Page';

import type { DefinePageOptions, PageDefinition } from './types';

export function definePage({
  id,
  path,
  title,
  icon,
  children,
}: DefinePageOptions): PageDefinition {
  function Component() {
    return <Page>{children}</Page>;
  }

  return {
    id,
    path,
    title,
    icon,
    Component,
  };
}
