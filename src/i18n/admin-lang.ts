/**
 * Admin i18n — canonical dictionary + hook.
 *
 * Every admin surface should resolve visible strings through `useAdminLang`.
 * The selected language is persisted in localStorage under `admin-lang`
 * and syncs across tabs. A wrapping `<div dir>` in the admin shell flips
 * layout, so consumers never need to reason about dir directly.
 */

import { useEffect, useState, useCallback } from "react";

export type AdminLang = "ar" | "en";
export type L = { ar: string; en: string };

const KEY = "admin-lang";
const EVT = "admin-lang-change";

function read(): AdminLang {
  if (typeof window === "undefined") return "ar";
  const v = window.localStorage.getItem(KEY);
  return v === "en" ? "en" : "ar";
}

/** Convenience constructor. Accepts either an `L` pair or a plain string
 *  (kept as-is for both languages). */
export function L(ar: string, en: string): L {
  return { ar, en };
}

export function resolveL(v: L | string | undefined | null, lang: AdminLang): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[lang] ?? v.en ?? v.ar ?? "";
}

export function useAdminLang() {
  const [lang, setLang] = useState<AdminLang>("ar");
  useEffect(() => {
    setLang(read());
    const on = () => setLang(read());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  const set = useCallback((next: AdminLang) => {
    window.localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVT));
    setLang(next);
  }, []);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";
  const t = <T extends L | string | undefined | null>(pair: T) =>
    resolveL(pair as L | string | undefined | null, lang);
  const isRTL = lang === "ar";
  return { lang, setLang: set, dir, t, isRTL };
}

/* -------------------------------------------------------------------------- */
/*  Dictionary                                                                */
/* -------------------------------------------------------------------------- */

export const A = {
  // Navigation groups
  content_group:      L("المحتوى", "Content"),
  design_group:       L("تصميم الموقع", "Site Design"),
  taxonomy_group:     L("التصنيفات والوسائط", "Taxonomy & Media"),
  ops_group:          L("التشغيل", "Operations"),
  system_group:       L("النظام", "System"),
  commerce_group:     L("التجارة", "Commerce"),
  developer_group:    L("المطوّرون", "Developer"),
  settings_group:     L("الإعدادات", "Settings"),

  // Modules
  dashboard:          L("الرئيسية", "Dashboard"),
  pages:              L("صفحات الموقع", "Site Pages"),
  sections:           L("أقسام الصفحات", "Page Sections"),
  menus:              L("قوائم التنقل", "Menus"),
  testimonials:       L("آراء العملاء", "Testimonials"),
  page_seo:           L("SEO لكل صفحة", "Per-page SEO"),
  insights:           L("المقالات", "Insights"),
  portfolio:          L("المشاريع", "Projects"),
  services:           L("الخدمات", "Services"),
  categories:         L("التصنيفات", "Categories"),
  tags:               L("الوسوم", "Tags"),
  media:              L("مكتبة الوسائط", "Media Library"),
  messages:           L("الرسائل", "Messages"),
  seo:                L("مدير SEO", "SEO Manager"),
  indexing:           L("حالة الفهرسة", "Indexing Status"),
  audit:              L("سجلات التدقيق", "Audit Logs"),
  settings:           L("إعدادات الموقع", "Site Settings"),
  profile:            L("الملف الشخصي", "Profile"),

  // Shell
  cms_title:          L("استوديو CMS", "Studio CMS"),
  cms_subtitle:       L("لوحة التحكم", "Admin Dashboard"),
  view_site:          L("عرض الموقع", "View Site"),
  sign_out:           L("تسجيل الخروج", "Sign Out"),
  language:           L("اللغة", "Language"),
  switch_to_arabic:   L("العربية", "Arabic"),
  switch_to_english:  L("English", "English"),
  cmd_placeholder:    L("اكتب أمرًا أو ابحث…", "Type a command or search…"),
  cmd_button:         L("بحث أو تشغيل أمر…", "Search or run command…"),
  cmd_empty:          L("لا توجد نتائج.", "No results."),
  cmd_group_navigate: L("التنقّل", "Navigate"),
  cmd_group_create:   L("إنشاء", "Create"),
  cmd_group_search:   L("بحث", "Search"),
  cmd_group_actions:  L("إجراءات", "Actions"),
  cmd_group_settings: L("إعدادات", "Settings"),
  cmd_group_help:     L("مساعدة", "Help"),
  go_to:              L("انتقل إلى", "Go to"),
  new_prefix:         L("جديد", "New"),

  // Common actions
  loading:            L("جاري التحميل…", "Loading…"),
  saving:             L("جاري الحفظ…", "Saving…"),
  save:               L("حفظ", "Save"),
  cancel:             L("إلغاء", "Cancel"),
  close:              L("إغلاق", "Close"),
  delete:             L("حذف", "Delete"),
  edit:               L("تعديل", "Edit"),
  duplicate:          L("نسخ", "Duplicate"),
  archive:            L("أرشفة", "Archive"),
  unarchive:          L("استعادة من الأرشيف", "Unarchive"),
  restore:            L("استعادة", "Restore"),
  publish:            L("نشر", "Publish"),
  unpublish:          L("إرجاع كمسودة", "Move to draft"),
  refresh:            L("تحديث", "Refresh"),
  back:               L("رجوع", "Back"),
  next:               L("التالي", "Next"),
  prev:               L("السابق", "Previous"),
  view:               L("عرض", "View"),
  create:             L("إنشاء", "Create"),
  update:             L("تحديث", "Update"),

  // Notifications
  created:            L("تم الإنشاء", "Created"),
  saved:              L("تم الحفظ", "Saved"),
  deleted:            L("تم الحذف", "Deleted"),
  duplicated:         L("تم النسخ", "Duplicated"),
  archived:           L("تمت الأرشفة", "Archived"),
  unarchived:         L("تمت الاستعادة من الأرشيف", "Unarchived"),
  restored:           L("تمت الاستعادة", "Restored"),
  workflow_updated:   L("تم تحديث الحالة", "Workflow updated"),
  revision_restored:  L("تمت استعادة النسخة", "Revision restored"),
  op_failed:          L("فشلت العملية", "Operation failed"),

  // Confirmations
  confirm_trash:      L("نقل إلى المهملات؟", "Move to trash?"),
  confirm_restore_rev: L("استعادة هذه النسخة؟", "Restore this revision?"),

  // Placeholders / empty
  search_ph:          L("ابحث…", "Search…"),
  search_records_ph: L("ابحث بالاسم أو المعرّف…", "Search name or slug…"),
  no_records:         L("لا توجد سجلات.", "No records."),
  no_activity:        L("لم يُسجَّل أي نشاط بعد.", "No activity recorded."),
  no_revisions:       L("لا توجد نسخ سابقة بعد.", "No revisions yet."),
  none:               L("لا شيء", "None"),

  // List / filters
  records_singular:   L("سجل", "record"),
  records_plural:     L("سجلات", "records"),
  engine_note:        L("محرّك CMS الموحّد", "Generic CMS engine"),
  include_archived:   L("عرض المؤرشف", "Include archived"),
  include_trash:      L("عرض المهملات", "Include trash"),
  any_state:          L("كل الحالات", "Any state"),
  page_of:            L("صفحة {n} من {t}", "Page {n} of {t}"),

  // Workflow
  wf_draft:           L("مسودة", "Draft"),
  wf_in_review:       L("قيد المراجعة", "In review"),
  wf_approved:        L("معتمد", "Approved"),
  wf_published:       L("منشور", "Published"),
  wf_archived:        L("مؤرشف", "Archived"),
  wf_current_state:   L("الحالة الحالية", "Current state"),
  wf_publish_note:    L("النشر يعيّن ", "Publishing sets "),
  wf_publish_note_2:  L(". الأرشفة تُخفي السجل من القوائم العامة.", ". Archive hides from public lists."),

  // Editor tabs
  tab_content:        L("المحتوى", "Content"),
  tab_seo:            L("SEO", "SEO"),
  tab_workflow:       L("الحالة", "Workflow"),
  tab_history:        L("السجل", "History"),
  tab_activity:       L("النشاط", "Activity"),
  tab_deps:           L("الاعتماديات", "Dependencies"),
  new_record:         L("سجل جديد", "New"),
  edit_record:        L("تعديل", "Edit"),
  deps_incoming:      L("مُشار إليه من (وارد)", "Referenced by (incoming)"),
  deps_outgoing:      L("يشير إلى (صادر)", "References (outgoing)"),

  // Field helper
  json_hint:          L("JSON — يُحلَّل عند الحفظ", "JSON — parsed on save"),
  select_placeholder: L("اختر…", "Select…"),
  required:           L("مطلوب", "Required"),

  // Dashboard
  dashboard_intro:    L(
    "نظرة عامة على الموقع. يمكن لأي وحدة تسجيل ودجات خاصة بها هنا.",
    "Overview of the site. Every module can register its own widgets here.",
  ),
  kpi_projects:       L("المشاريع", "Projects"),
  kpi_articles:       L("المقالات", "Articles"),
  kpi_services:       L("الخدمات", "Services"),
  kpi_pages:          L("الصفحات", "Pages"),
  kpi_unread_messages:L("رسائل غير مقروءة", "Unread Messages"),
  kpi_media:          L("ملفات الوسائط", "Media Files"),
  kpi_leads:          L("العملاء المحتملون", "Leads"),
  kpi_events_30d:     L("الأحداث (٣٠ يومًا)", "Events (30d)"),
  recent_activity:    L("النشاط الأخير", "Recent Activity"),
  no_activity_yet:    L("لا يوجد نشاط بعد.", "No activity yet."),

  // Registry error
  unknown_entity:     L("كيان غير معروف:", "Unknown entity:"),
  register_via:       L("سجّله عبر", "Register it via"),

  // Sign-in
  admin_signin_title: L("تسجيل دخول لوحة التحكم", "Admin sign-in"),
} as const;

export type ALiteral = keyof typeof A;
