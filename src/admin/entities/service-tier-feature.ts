import { registerEntity } from "@/admin/lib/entity-registry";
import { L } from "@/i18n/admin-lang";

const INCLUSION_OPTIONS = [
  { value: "none", label: L("غير مضمّن", "Not included") },
  { value: "core", label: L("أساسي", "Core") },
  { value: "extended", label: L("موسّع", "Extended") },
  { value: "full", label: L("كامل", "Full") },
];

registerEntity({
  key: "service_tier_feature",
  label: L("عنصر مقارنة", "Comparison Row"),
  labelPlural: L("مقارنة الفئات", "Tier Comparison"),
  table: "service_tier_features",
  slugColumn: null,
  hasI18n: true,
  supportsWorkflow: false,
  supportsVersioning: false,
  deletable: true,
  section: "content",
  icon: "ListChecks",
  fields: [
    { key: "label_ar", label: L("العنوان (عربي)", "Label (AR)"), kind: "text", required: true, localized: true },
    { key: "label_en", label: L("العنوان (إنجليزي)", "Label (EN)"), kind: "text", required: true, localized: true },
    { key: "launch", label: L("انطلاق العلامة", "Brand Launch"), kind: "select", options: INCLUSION_OPTIONS },
    { key: "signature", label: L("توقيع العلامة", "Brand Signature"), kind: "select", options: INCLUSION_OPTIONS },
    { key: "system", label: L("نظام العلامة", "Brand System"), kind: "select", options: INCLUSION_OPTIONS },
    { key: "sort_order", label: L("ترتيب العرض", "Sort order"), kind: "number" },
    { key: "is_published", label: L("منشور", "Published"), kind: "boolean" },
  ],
  listColumns: [
    { key: "label_en", label: L("العنوان", "Label"), sortable: true },
    { key: "launch", label: L("Launch", "Launch") },
    { key: "signature", label: L("Signature", "Signature") },
    { key: "system", label: L("System", "System") },
    { key: "sort_order", label: L("الترتيب", "Order"), sortable: true },
    { key: "updated_at", label: L("آخر تحديث", "Updated"), render: "date", sortable: true },
  ],
});
