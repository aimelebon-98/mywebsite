"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code,
  Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Minus,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function BlogEditor({ value, onChange, placeholder = "Start writing...", minHeight = 400 }: Props) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl my-4" },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none px-5 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => { setMounted(true); }, []);

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!mounted || !editor) {
    return (
      <div className="border border-gray-200 rounded-xl bg-gray-50 animate-pulse" style={{ minHeight }}>
        <div className="h-11 border-b border-gray-200"></div>
      </div>
    );
  }

  const addLink = () => {
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:", "https://");
    if (url && url !== "https://") {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const Btn = ({
    onClick, active, disabled, title, children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition text-sm ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-600 hover:bg-gray-100"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-gray-200 mx-0.5" />;

  const words = editor.getText().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(words / 200));

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-gray-900 transition">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <ListOrdered className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
          <Code className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal line">
          <Minus className="w-4 h-4" />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
          <AlignLeft className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
          <AlignCenter className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
          <AlignRight className="w-4 h-4" />
        </Btn>

        <Divider />

        <Btn onClick={addLink} active={editor.isActive("link")} title="Insert link">
          <LinkIcon className="w-4 h-4" />
        </Btn>
        <Btn onClick={addImage} title="Insert image">
          <ImageIcon className="w-4 h-4" />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
          <Redo className="w-4 h-4" />
        </Btn>

        {/* Word count on right */}
        <div className="ml-auto text-xs text-gray-500 pr-2">
          <span className="font-medium">{words}</span> words &middot; <span className="font-medium">{readTime}</span> min read
        </div>
      </div>

      {/* Editor */}
      <div style={{ minHeight }} className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
