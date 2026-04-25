"use client";

import React, { useCallback, useState } from "react";
import type { Editor } from "@tiptap/core";

export default function LinkModal({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [href, setHref] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const apply = useCallback(() => {
    if (!href) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href, target: openInNewTab ? "_blank" : undefined }).run();
    onClose();
  }, [editor, href, openInNewTab, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="bg-white rounded-lg p-4 z-10 w-[420px]">
        <h3 className="text-sm font-semibold mb-2">Insert Link</h3>
        <input autoFocus value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://example.com" className="w-full p-2 border rounded mb-2" />
        <label className="flex items-center gap-2 text-sm mb-4">
          <input type="checkbox" checked={openInNewTab} onChange={(e) => setOpenInNewTab(e.target.checked)} /> Open in new tab
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded">Cancel</button>
          <button onClick={apply} className="px-3 py-1 rounded bg-primary text-white">Apply</button>
        </div>
      </div>
    </div>
  );
}
