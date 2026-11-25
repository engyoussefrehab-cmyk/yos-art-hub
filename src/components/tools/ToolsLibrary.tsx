import { Link } from "@tanstack/react-router";
import { ArrowLeft, Palette, Target } from "lucide-react";
import { useLang } from "@/i18n/use-lang";
import { StudioSectionHero, container } from "@/components/studio";

const tools = [
  {
    path: "/tools/color-brief",
    title: "tools_palette_title",
    description: "tools_palette_desc",
    icon: Palette,
    colors: ["#D93D3D", "#D98C4A", "#E5C66F", "#47796E", "#263B39"],
  },
  {
    path: "/tools/color-wheel",
    title: "tools_wheel_title",
    description: "tools_wheel_desc",
    icon: Target,
    colors: ["#1F4E5A", "#C1CDD0", "#FF8253"],
  },
] as const;

export function ToolsLibrary() {
  const { t } = useLang();
  return (
    <>
      <StudioSectionHero title={t("tools_title")} intro={t("tools_intro")} />
      <section aria-label={t("nav_tools")} className={`${container} grid gap-4 py-8 sm:grid-cols-2 sm:gap-6 md:py-12`}>
        {tools.map(({ path, title, description, icon: Icon, colors }) => (
          <Link key={path} to={path} className="group flex flex-col rounded-xl border border-border bg-cream p-5 text-foreground transition-colors hover:border-accent md:p-7">
            <div aria-hidden="true" className="mb-6 flex h-20 overflow-hidden rounded-lg">
              {colors.map((color) => <span key={color} className="flex-1" style={{ backgroundColor: color }} />)}
            </div>
            <div className="flex items-start gap-3">
              <Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
              <div>
                <h2 className="font-display text-2xl font-bold">{t(title)}</h2>
                <p className="mt-2 text-sm leading-loose text-muted-foreground">{t(description)}</p>
              </div>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold group-hover:text-accent">
              {t("tools_palette_cta")} <ArrowLeft aria-hidden="true" size={17} />
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
