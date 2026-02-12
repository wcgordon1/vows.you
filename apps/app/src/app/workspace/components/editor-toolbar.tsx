"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  List,
  ListOrdered,
  MoreHorizontal,
  Heading2,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  visible: boolean;
}

function ToolbarButton({
  onClick,
  isActive = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center h-7 w-7 rounded text-base-400 transition-colors hover:bg-sand-100 hover:text-base-700 ${
        isActive ? "bg-sand-100 text-base-800" : ""
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-base-200 mx-0.5" />;
}

export function EditorToolbar({ editor, visible }: EditorToolbarProps) {
  const [showOverflow, setShowOverflow] = useState(false);

  if (!editor) return null;

  return (
    <div
      className={`flex items-center gap-0.5 px-6 py-1.5 border-b border-base-100 transition-all duration-200 ${
        visible
          ? "opacity-100 max-h-12"
          : "opacity-0 max-h-0 overflow-hidden py-0 border-transparent"
      }`}
    >
      {/* Heading */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Core formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("URL", previousUrl);
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        isActive={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Overflow toggle */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowOverflow(!showOverflow)}
          title="More formatting"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </ToolbarButton>

        {showOverflow && (
          <div className="absolute top-full left-0 mt-1 flex items-center gap-0.5 rounded-lg border border-base-200 bg-white px-1.5 py-1 shadow-md z-20">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>
        )}
      </div>
    </div>
  );
}
