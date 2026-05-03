import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

function isValidEmbedUrl(url: string) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("tiktok.com")
  );
}

function transformToEmbed(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;

  let input = raw.trim();
  if (!/^https?:\/\//i.test(input)) {
    input = "https://" + input;
  }

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();

    // YouTube
    if (host.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        const v = url.searchParams.get("v");
        if (v && /^[A-Za-z0-9_-]+$/.test(v)) {
          return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
        }
      }
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && (parts[0] === "shorts" || parts[0] === "embed")) {
        const id = parts[1];
        if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
          return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
        }
      }
      return null;
    }

    // youtu.be
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
        return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
      }
      return null;
    }

    // Vimeo
    if (host.endsWith("vimeo.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const id = parts[0];
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}`;
      }
      return null;
    }

    // TikTok
    if (host.endsWith("tiktok.com")) {
      // TikTok embeds use their own oEmbed or iframe pattern
      // We'll pass through the URL for iframe embedding
      return input;
    }

    return null;
  } catch {
    return null;
  }
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setError("");
    }
  }, [isOpen]);

  const handleInsert = () => {
    const final = transformToEmbed(url.trim());
    if (!final) {
      setError("Please enter a valid YouTube, Vimeo, or TikTok URL");
      return;
    }
    onInsert(final);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-[#1a1d26] border-[#272a35] text-[#e4e6eb]">
        <DialogHeader>
          <DialogTitle className="text-[#e4e6eb]">Insert Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8b929d]">
              Video URL
            </label>
            <Input
              autoFocus
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInsert();
                }
              }}
              className="bg-[#141821] border-[#272a35] text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:ring-[#f29e1f]/50"
            />
            {error && <p className="text-xs text-[#ef4444]">{error}</p>}
          </div>
          <p className="text-xs text-[#8b929d]">
            Supported: YouTube, Vimeo, TikTok
          </p>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#272a35] bg-transparent px-4 text-sm font-medium text-[#e4e6eb] transition-colors hover:bg-[#1a1d26]"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!url.trim()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#f29e1f] px-4 text-sm font-medium text-[#0f1117] transition-colors hover:bg-[#f29e1f]/90 disabled:opacity-50"
          >
            Insert
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedModal;