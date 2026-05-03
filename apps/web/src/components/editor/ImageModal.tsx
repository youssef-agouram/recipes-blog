"use client";

import React, { useCallback, useState, useRef } from "react";
import type { Editor } from "@tiptap/core";
import { useUploadImageMutation } from "@/store/api/recipeApi";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ImageModalProps {
  editor: Editor;
  onClose: () => void;
}

export default function ImageModal({ editor, onClose }: ImageModalProps) {
  const [src, setSrc] = useState("");
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertFromUrl = useCallback(() => {
    if (!src.trim()) return;
    editor.chain().focus().setImage({ src: src.trim() }).run();
    onClose();
  }, [editor, src, onClose]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const result = await uploadImage(formData).unwrap();
        editor.chain().focus().setImage({ src: result.imageUrl }).run();
        onClose();
      } catch (err) {
        console.error("Failed to upload image:", err);
      }
    },
    [editor, uploadImage, onClose]
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-[#1a1d26] border-[#272a35] text-[#e4e6eb]">
        <DialogHeader>
          <DialogTitle className="text-[#e4e6eb]">Insert Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8b929d]">
              Image URL
            </label>
            <Input
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="https://example.com/image.jpg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertFromUrl();
                }
              }}
              className="bg-[#141821] border-[#272a35] text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:ring-[#f29e1f]/50"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#272a35]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1a1d26] px-2 text-[#8b929d]">or</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8b929d]">
              Upload from device
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#272a35] bg-[#141821] px-4 py-6 text-sm text-[#8b929d] transition-colors hover:border-[#f29e1f]/30 hover:bg-[#141821]/80 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Click to select a file"
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#272a35] bg-transparent px-4 text-sm font-medium text-[#e4e6eb] transition-colors hover:bg-[#1a1d26]"
          >
            Cancel
          </button>
          <button
            onClick={insertFromUrl}
            disabled={!src.trim()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#f29e1f] px-4 text-sm font-medium text-[#0f1117] transition-colors hover:bg-[#f29e1f]/90 disabled:opacity-50"
          >
            Insert
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}