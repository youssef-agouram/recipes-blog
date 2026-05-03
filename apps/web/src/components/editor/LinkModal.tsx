"use client";

import React, { useCallback, useState } from "react";
import type { Editor } from "@tiptap/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface LinkModalProps {
  editor: Editor;
  onClose: () => void;
}

export default function LinkModal({ editor, onClose }: LinkModalProps) {
  const [href, setHref] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const apply = useCallback(() => {
    if (!href.trim()) return;
    let url = href.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: openInNewTab ? "_blank" : undefined })
      .run();
    onClose();
  }, [editor, href, openInNewTab, onClose]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-[#1a1d26] border-[#272a35] text-[#e4e6eb]">
        <DialogHeader>
          <DialogTitle className="text-[#e4e6eb]">Insert Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8b929d]">URL</label>
            <Input
              autoFocus
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
              className="bg-[#141821] border-[#272a35] text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:ring-[#f29e1f]/50"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#8b929d] cursor-pointer">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="rounded border-[#272a35] bg-[#141821] text-[#f29e1f] focus:ring-[#f29e1f]/50"
            />
            Open in new tab
          </label>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#272a35] bg-transparent px-4 text-sm font-medium text-[#e4e6eb] transition-colors hover:bg-[#1a1d26]"
          >
            Cancel
          </button>
          <button
            onClick={apply}
            disabled={!href.trim()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#f29e1f] px-4 text-sm font-medium text-[#0f1117] transition-colors hover:bg-[#f29e1f]/90 disabled:opacity-50"
          >
            Apply
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}