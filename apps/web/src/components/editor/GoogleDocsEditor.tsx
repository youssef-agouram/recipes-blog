"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Toolbar from "./Toolbar";
import BubbleMenuComponent from "./BubbleMenu";
import LinkModal from "./LinkModal";
import ImageModal from "./ImageModal";

type Props = {
  initialContent?: any;
  onChange?: (json: any) => void;
};

export default function GoogleDocsEditor({ initialContent, onChange }: Props) {
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({ openOnClick: false }),
    Image,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: "Start writing your document..." }),
    Typography,
    Highlight,
    CharacterCount.configure({ limit: 100000 }),
  ], []);

  const editor = useEditor({
    extensions,
    content: initialContent ?? null,
    // Prevent immediate render during SSR to avoid hydration mismatches
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "ProseMirror prose prose-lg max-w-none focus:outline-none",
      },
    },
  });

  const getWordCount = useCallback(() => {
    if (!editor) return 0;
    const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, " ");
    return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
  }, [editor]);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const openLinkModal = useCallback(() => setShowLinkModal(true), []);
  const openImageModal = useCallback(() => setShowImageModal(true), []);


  if (!editor) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Loading editor…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-4 z-20">
        <Toolbar editor={editor} onOpenImageModal={openImageModal} onOpenLinkModal={openLinkModal} />
      </div>

      <div className="bg-white shadow-md rounded-lg p-8 mt-4 min-h-[500px]">
        <BubbleMenuComponent editor={editor} />
        <EditorContent editor={editor} />
      </div>

      <div className="mt-2 text-right text-sm text-muted-foreground">
        <span className="mr-4">{getWordCount()} words</span>
        <span>{editor.storage.characterCount.characters()} chars</span>
      </div>
      {showLinkModal && <LinkModal editor={editor} onClose={() => setShowLinkModal(false)} />}
      {showImageModal && <ImageModal editor={editor} onClose={() => setShowImageModal(false)} />}
    </div>
  );
}
