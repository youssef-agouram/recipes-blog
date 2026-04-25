"use client";

import React, { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Embed from "@/components/editor/extensions/embed";

type Props = {
  content: any; // Tiptap JSON
  className?: string;
};

export default function BlogRenderer({ content, className = "prose dark:prose-invert max-w-none" }: Props) {
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({ openOnClick: true }),
    Image.configure({
      inline: false,
      HTMLAttributes: { class: 'mx-auto my-6 max-w-full rounded-md' },
    }),
    Embed,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Typography,
    Highlight,
  ], []);

  const editor = useEditor({
    editable: false,
    extensions,
    content: content ?? { type: 'doc', content: [] },
    // avoid SSR hydration mismatches
    immediatelyRender: false,
  });

  if (!content || !content.content || content.content.length === 0) {
    return <div className={`prose text-muted-foreground ${className}`}>No content available.</div>;
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
