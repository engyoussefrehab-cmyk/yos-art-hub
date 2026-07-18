import { useEffect, useState, useCallback } from "react";

export type AdminLang = "ar" | "en";
const KEY = "admin-lang";
const EVT = "admin-lang-change";

function read(): AdminLang {
  if (typeof window === "undefined") return "ar";
  const v = window.localStorage.getItem(KEY);
  return v === "en" ? "en" : "ar";
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
  const t = <T extends { ar: string; en: string }>(pair: T) => pair[lang];
  return { lang, setLang: set, dir, t };
}

// Common admin strings — extend as pages get translated.
export const A = {
  dashboard:      { ar: "الرئيسية", en: "Dashboard" },
  pages:          { ar: "صفحات الموقع", en: "Site Pages" },
  sections:       { ar: "أقسام الصفحات", en: "Page Sections" },
  menus:          { ar: "قوائم التنقل", en: "Menus" },
  testimonials:   { ar: "آراء العملاء", en: "Testimonials" },
  page_seo:       { ar: "SEO لكل صفحة", en: "Per-page SEO" },
  insights:       { ar: "المقالات", en: "Insights" },
  portfolio:      { ar: "المشاريع", en: "Projects" },
  services:       { ar: "الخدمات", en: "Services" },
  categories:     { ar: "التصنيفات", en: "Categories" },
  tags:           { ar: "الوسوم", en: "Tags" },
  media:          { ar: "مكتبة الوسائط", en: "Media Library" },
  messages:       { ar: "الرسائل", en: "Messages" },
  seo:            { ar: "مدير SEO", en: "SEO Manager" },
  audit:          { ar: "سجلات التدقيق", en: "Audit Logs" },
  settings:       { ar: "إعدادات الموقع", en: "Site Settings" },
  profile:        { ar: "الملف الشخصي", en: "Profile" },
  content_group:  { ar: "المحتوى", en: "Content" },
  design_group:   { ar: "تصميم الموقع", en: "Site Design" },
  taxonomy_group: { ar: "التصنيفات والوسائط", en: "Taxonomy & Media" },
  ops_group:      { ar: "التشغيل", en: "Operations" },
  settings_group: { ar: "الإعدادات", en: "Settings" },
  cms_subtitle:   { ar: "لوحة التحكم", en: "Admin Dashboard" },
  view_site:      { ar: "عرض الموقع", en: "View Site" },
  sign_out:       { ar: "تسجيل الخروج", en: "Sign Out" },
  language:       { ar: "اللغة", en: "Language" },

  // Common
  loading:        { ar: "جاري التحميل…", en: "Loading…" },
  saving:         { ar: "جاري الحفظ…", en: "Saving…" },
  save:           { ar: "حفظ", en: "Save" },
  cancel:         { ar: "إلغاء", en: "Cancel" },
  delete:         { ar: "حذف", en: "Delete" },
  edit:           { ar: "تعديل", en: "Edit" },
  duplicate:      { ar: "نسخ", en: "Duplicate" },
  publish:        { ar: "نشر", en: "Publish" },
  unpublish:      { ar: "إرجاع كمسودة", en: "Move to draft" },
  search_ph:      { ar: "بحث…", en: "Search…" },
  select_all:     { ar: "تحديد الكل", en: "Select all" },
  clear_selection:{ ar: "إلغاء التحديد", en: "Clear selection" },
  deleting:       { ar: "جاري الحذف…", en: "Deleting…" },
  delete_final:   { ar: "حذف نهائي", en: "Delete permanently" },

  // Portfolio list
  portfolio_title:{ ar: "المشاريع", en: "Projects" },
  portfolio_subtitle: { ar: "إدارة مشاريع البرتفوليو والتصنيفات والحالة.", en: "Manage your portfolio projects, categories, and status." },
  new_project:    { ar: "مشروع جديد", en: "New Project" },
  status_all:     { ar: "كل الحالات", en: "All statuses" },
  status_draft:   { ar: "مسودة", en: "Draft" },
  status_published:{ ar: "منشور", en: "Published" },
  selected_count: { ar: "محدد", en: "selected" },
  no_projects:    { ar: "لا توجد مشاريع بعد. ابدأ بإضافة مشروع جديد.", en: "No projects yet. Start by creating a new one." },
  col_name:       { ar: "الاسم", en: "Name" },
  col_client:     { ar: "العميل", en: "Client" },
  col_category:   { ar: "التصنيف", en: "Category" },
  col_status:     { ar: "الحالة", en: "Status" },
  confirm_delete_project: { ar: "تأكيد حذف المشروع", en: "Confirm project deletion" },
  confirm_delete_project_desc: { ar: "سيتم حذف المشروع نهائيًا. لا يمكن التراجع عن هذا الإجراء.", en: "This project will be permanently deleted. This action cannot be undone." },
  bulk_delete_title: { ar: "حذف عدة مشاريع", en: "Delete multiple projects" },
  bulk_delete_desc: { ar: "سيتم حذف المشاريع المحددة بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.", en: "The selected projects will be permanently deleted. This action cannot be undone." },
  project_deleted:{ ar: "تم حذف المشروع", en: "Project deleted" },
  project_duplicated: { ar: "تم نسخ المشروع كمسودة", en: "Project duplicated as draft" },
  bulk_published: { ar: "تم النشر", en: "Published" },
  bulk_drafted:   { ar: "تم الإرجاع كمسودة", en: "Moved to draft" },
  bulk_deleted:   { ar: "تم الحذف", en: "Deleted" },

  // Settings
  settings_title: { ar: "إعدادات الموقع", en: "Site Settings" },
  settings_subtitle: { ar: "اللوجو، بيانات الشركة، السوشيال ميديا، وإعدادات التتبع.", en: "Logo, company info, social media, and analytics settings." },
  identity:       { ar: "الهوية", en: "Identity" },
  logo_url:       { ar: "رابط اللوجو", en: "Logo URL" },
  favicon_url:    { ar: "رابط الفافيكون", en: "Favicon URL" },
  company_name:   { ar: "اسم الشركة", en: "Company name" },
  contact_email:  { ar: "بريد التواصل", en: "Contact email" },
  contact_phone:  { ar: "رقم الهاتف", en: "Phone number" },
  address:        { ar: "العنوان", en: "Address" },
  socials:        { ar: "السوشيال ميديا", en: "Social Media" },
  analytics:      { ar: "التتبع والتحليلات", en: "Tracking & Analytics" },
  settings_saved: { ar: "تم حفظ الإعدادات", en: "Settings saved" },
} as const;

