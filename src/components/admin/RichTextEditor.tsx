import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link as LinkIcon, Image as ImageIcon, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Minus, Pilcrow,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  minHeight?: number;
};

function ToolBtn({ onClick, active, disabled, title, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 ${active ? "bg-accent/15 text-accent" : ""}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImageUpload }: { editor: Editor; onImageUpload?: (f: File) => Promise<string> }) {
  const addLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("رابط URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank", rel: "noopener noreferrer" }).run();
  };
  const addImage = async () => {
    if (onImageUpload) {
      const input = document.createElement("input");
      input.type = "file"; input.accept = "image/*";
      input.onchange = async () => {
        const f = input.files?.[0]; if (!f) return;
        const url = await onImageUpload(f);
        if (url) editor.chain().focus().setImage({ src: url }).run();
      };
      input.click();
      return;
    }
    const url = window.prompt("رابط الصورة"); if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5">
      <ToolBtn title="غامق" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="مائل" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="مشطوب" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><Strikethrough className="h-4 w-4" /></ToolBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolBtn title="فقرة" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")}><Pilcrow className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="عنوان H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="عنوان H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="h-4 w-4" /></ToolBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolBtn title="قائمة نقطية" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="قائمة مرقّمة" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="اقتباس" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="كتلة كود" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><Code className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="خط فاصل" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></ToolBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolBtn title="محاذاة بداية" onClick={() => editor.chain().focus().setTextAlign("start").run()} active={editor.isActive({ textAlign: "start" })}><AlignRight className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="توسيط" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><AlignCenter className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="محاذاة نهاية" onClick={() => editor.chain().focus().setTextAlign("end").run()} active={editor.isActive({ textAlign: "end" })}><AlignLeft className="h-4 w-4" /></ToolBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolBtn title="رابط" onClick={addLink} active={editor.isActive("link")}><LinkIcon className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="صورة" onClick={addImage}><ImageIcon className="h-4 w-4" /></ToolBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolBtn title="تراجع" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo className="h-4 w-4" /></ToolBtn>
      <ToolBtn title="إعادة" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo className="h-4 w-4" /></ToolBtn>
    </div>
  );
}

export function RichTextEditor({ value, onChange, dir = "rtl", placeholder, onImageUpload, minHeight = 320 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl border border-border my-4" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline underline-offset-2" } }),
      Placeholder.configure({ placeholder: placeholder ?? "اكتب هنا…" }),
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["start", "center", "end"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none px-4 py-4 focus:outline-none",
        dir,
        style: `min-height:${minHeight}px`,
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return <div className="rounded-xl border border-border bg-background" style={{ minHeight }} />;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <Toolbar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} />
    </div>
  );
}
