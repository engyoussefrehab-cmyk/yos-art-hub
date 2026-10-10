import { createFileRoute } from "@tanstack/react-router";
import { ToolsLibrary } from "@/components/tools/ToolsLibrary";

export const Route = createFileRoute("/en/tools/")({
  head: () => ({
    meta: [
      { title: "Design Tools | Youssef Rehab" },
      { name: "description", content: "Practical tools for everyday design decisions, starting with color selection." },
    ],
  }),
  component: ToolsLibrary,
});
