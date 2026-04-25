"use client";

import React, { useEffect, useState } from "react";
import type { Editor } from "@tiptap/core";

export default function BubbleMenuComponent({ editor }: { editor: Editor }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setVisible(false);
        return;
      }

      try {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const midX = (start.left + end.right) / 2 + window.scrollX;
        const top = Math.min(start.top, end.top) + window.scrollY - 10;
        setPos({ left: midX, top });
        setVisible(true);
      } catch (e) {
        setVisible(false);
      }
    };

    const onBlur = () => setVisible(false);

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    editor.on("blur", onBlur);

    // initial
    update();

    return () => {
      try {
        editor.off("selectionUpdate", update);
        editor.off("transaction", update);
        editor.off("blur", onBlur);
      } catch (_) {}
    };
  }, [editor]);

  if (!editor) return null;

  return visible ? (
    <div style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translateX(-50%) translateY(-100%)" }} className="rounded-md bg-white p-2 tiptap-toolbar-shadow z-50">
      <div className="flex gap-2 items-center">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded ${editor.isActive("bold") ? "bg-primary/10" : ""}`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded ${editor.isActive("italic") ? "bg-primary/10" : ""}`}>I</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-2 py-1 rounded ${editor.isActive("strike") ? "bg-primary/10" : ""}`}>S</button>
        <button onClick={() => editor.chain().focus().toggleLink().run()} className="px-2 py-1 rounded">Link</button>
      </div>
    </div>
  ) : null;
}
