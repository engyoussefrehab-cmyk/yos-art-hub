/**
 * Block Registry — the plugin surface for editor blocks.
 *
 * Adding a new block type is a single `registerBlock({...})` call. The
 * ProjectBlocksEditor (and future page/homepage/category-layout editors) read
 * this registry and automatically render the block in the picker, the
 * inspector, and the renderer.
 *
 * A block definition owns:
 *   - a stable `type` key (matches `blocks[].type` in JSONB)
 *   - JSON schema for props (drives the inspector form)
 *   - default props (used when the block is inserted)
 *   - allowed contexts (project, page, homepage, category_layout, ...)
 *   - a lazy `render` and `edit` component pointer (loaded on demand)
 */

import type { ComponentType, LazyExoticComponent } from "react";

export type BlockContext =
  | "project"
  | "page"
  | "homepage"
  | "category_layout"
  | "article"
  | "reusable";

export interface BlockPropField {
  key: string;
  label: string;
  kind:
    | "text"
    | "textarea"
    | "richtext"
    | "number"
    | "boolean"
    | "select"
    | "media"
    | "color"
    | "url"
    | "list";
  options?: Array<{ value: string; label: string }>;
  itemFields?: BlockPropField[];
  default?: unknown;
  helpText?: string;
}

export interface BlockDefinition<TProps = Record<string, unknown>> {
  /** Stable identifier stored in `blocks[].type`. */
  type: string;
  label: string;
  category:
    | "content"
    | "structured"
    | "social_proof"
    | "conversion"
    | "project"
    | "layout"
    | "media";
  description?: string;
  icon?: string;
  /** Contexts this block is allowed in. */
  contexts: BlockContext[];
  /** Field schema shown in the block inspector. */
  propFields: BlockPropField[];
  /** Default props used when block is inserted. */
  defaultProps: TProps;
  /** Whether the block supports being saved as a reusable block. */
  reusable?: boolean;
  /** Feature flag required to expose this block. */
  featureFlag?: string;
  /** Lazy renderer (public site + preview). */
  render?: LazyExoticComponent<ComponentType<{ props: TProps }>>;
  /** Lazy editor (inline WYSIWYG); falls back to schema-driven inspector. */
  edit?: LazyExoticComponent<ComponentType<{ props: TProps; onChange: (p: TProps) => void }>>;
}

const blocks = new Map<string, BlockDefinition>();

export function registerBlock<TProps>(def: BlockDefinition<TProps>): void {
  if (blocks.has(def.type) && import.meta.env?.DEV) {
    console.warn(`[block-registry] Overwriting block "${def.type}"`);
  }
  blocks.set(def.type, def as BlockDefinition);
}

export function getBlock(type: string): BlockDefinition | undefined {
  return blocks.get(type);
}

export function listBlocks(context?: BlockContext): BlockDefinition[] {
  const all = Array.from(blocks.values());
  return context ? all.filter((b) => b.contexts.includes(context)) : all;
}

export function listBlocksByCategory(context: BlockContext) {
  const map = new Map<string, BlockDefinition[]>();
  for (const b of listBlocks(context)) {
    const arr = map.get(b.category) ?? [];
    arr.push(b);
    map.set(b.category, arr);
  }
  return map;
}
