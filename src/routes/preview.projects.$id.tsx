import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ProjectDetailView } from "@/views/ProjectDetailView";
import { normalizeBlocks } from "@/lib/project-blocks";
import type { PortfolioDTO } from "@/lib/portfolio.functions";

type PreviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; project: PortfolioDTO };

export const Route = createFileRoute("/preview/projects/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "معاينة المشروع — يوسف رحاب" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProjectPreviewPage,
});

function ProjectPreviewPage() {
  const { id } = useParams({ from: "/preview/projects/$id" });
  const [state, setState] = useState<PreviewState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        if (mounted) setState({ status: "error", message: "سجّل الدخول كمدير لعرض معاينة المشروع." });
        return;
      }

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!role) {
        if (mounted) setState({ status: "error", message: "هذه المعاينة متاحة للمدير فقط." });
        return;
      }

      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        setState({ status: "error", message: error.message });
        return;
      }
      if (!data) {
        setState({ status: "error", message: "المشروع غير موجود." });
        return;
      }
      setState({ status: "ready", project: mapPreviewProject(data) });
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (state.status !== "ready") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6 py-24 text-center" dir="rtl">
        <div>
          <p className="text-sm text-muted-foreground">
            {state.status === "loading" ? "جاري تجهيز المعاينة…" : state.message}
          </p>
        </div>
      </main>
    );
  }

  return <ProjectDetailView project={state.project} next={null} />;
}

function parseBullets(value: string | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.replace(/^[•\-\s]+/, "").trim())
    .filter(Boolean);
}

function mapPreviewProject(row: any): PortfolioDTO {
  const gallery: string[] = Array.isArray(row.gallery)
    ? row.gallery.map((item: any) => (typeof item === "string" ? item : item?.url)).filter(Boolean)
    : [];
  const cover = row.thumbnail_url || row.og_image_url || gallery[0] || row.hero_image_url || "";
  const mockup = row.hero_image_url || gallery[1] || gallery[0] || cover;
  return {
    slug: row.slug ?? "preview",
    name_ar: row.name_ar || row.name_en || "مشروع بدون عنوان",
    name_en: row.name_en || row.name_ar || "Untitled project",
    industry: row.industry ?? null,
    category_slug: row.category_slug ?? null,
    short_ar: row.short_description_ar ?? "",
    short_en: row.short_description_en ?? row.short_description_ar ?? "",
    description_ar: row.challenge_ar ?? "",
    description_en: row.challenge_en ?? row.challenge_ar ?? "",
    approach_ar: parseBullets(row.solution_ar),
    approach_en: parseBullets(row.solution_en || row.solution_ar),
    value_ar: row.results_ar ?? "",
    value_en: row.results_en ?? row.results_ar ?? "",
    cover,
    mockup,
    gallery,
    featured: !!row.featured,
    sort_order: row.sort_order ?? 0,
    blocks: normalizeBlocks(row.layout_blocks),
    country: row.client_country ?? null,
    year: row.year ?? null,
    tags: Array.isArray(row.tags_list) ? row.tags_list.filter((tag: any) => typeof tag === "string") : [],
    published_at: row.published_at ?? null,
  };
}