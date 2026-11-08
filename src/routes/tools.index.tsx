import { createFileRoute } from "@tanstack/react-router";
import { ToolsLibrary } from "@/components/tools/ToolsLibrary";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "أدوات التصميم | يوسف رحاب" },
      { name: "description", content: "أدوات عملية تساعدك في تفاصيل التصميم اليومية، بدءا من اختيار الألوان." },
    ],
  }),
  component: ToolsLibrary,
});
