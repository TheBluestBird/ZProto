import type { ComponentType, ReactNode } from 'react';

export type PageId =
  | "tower"
  | "gathering"
  | "craft"
  | "inventory"
  | "zeppelins"
  | "reputation";

export interface PageDefinition {
  id: PageId;
  path: string;
  title: string;
  icon: string;
  Component: ComponentType;
}

export interface DefinePageOptions {
  id: PageId;
  path: string;
  title: string;
  icon: string;
  children?: ReactNode;
}
