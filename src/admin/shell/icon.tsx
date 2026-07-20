/**
 * Resolves a Lucide icon name (string) at render time.
 * Keeps the registries plain-serializable and prevents circular imports.
 */
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function AdminIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Fallback = Icons.Circle as LucideIcon;
  const Comp = (name && (Icons as unknown as Record<string, LucideIcon>)[name]) || Fallback;
  return <Comp className={className} />;
}
