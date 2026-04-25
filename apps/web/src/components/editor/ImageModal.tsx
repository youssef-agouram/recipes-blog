"use client";

import React, { useCallback, useState } from "react";
import type { Editor } from "@tiptap/core";

export default function ImageModal({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [src, setSrc] = useState("");

  const insert = useCallback(async () => {
    if (!src) return;
    // mock async upload / insert
    await new Promise((r) => setTimeout(r, 400));
    editor.chain().focus().setImage({ src }).run();
    onClose();
  }, [editor, src, onClose]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setSrc(url);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="bg-white rounded-lg p-4 z-10 w-[480px]">
        <h3 className="text-sm font-semibold mb-2">Insert Image</h3>
        <input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="Image URL" className="w-full p-2 border rounded mb-2" />
        <div className="flex items-center gap-2 mb-4">
          <input type="file" accept="image/*" onChange={handleFile} />
          <span className="text-sm text-muted-foreground">(or paste an image URL)</span>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded">Cancel</button>
          <button onClick={insert} className="px-3 py-1 rounded bg-primary text-white">Insert</button>
        </div>
      </div>
    </div>
  );
}
