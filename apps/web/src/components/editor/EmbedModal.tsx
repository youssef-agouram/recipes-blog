import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

function isValidEmbed(url: string) {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('tiktok.com')
  );
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!isOpen) setUrl('');
  }, [isOpen]);

  const sanitizeUrl = (u: string) => {
    try {
      const parsed = new URL(u);
      return parsed.toString();
    } catch (e) {
      // try to add protocol
      try {
        const parsed = new URL('https://' + u);
        return parsed.toString();
      } catch {
        return null;
      }
    }
  };

  const handleInsert = () => {
    const final = sanitizeUrl(url.trim());
    if (!final) return;
    if (!isValidEmbed(final)) return;
    onInsert(final);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Video / Embed</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="embedUrl">URL</Label>
            <Input
              id="embedUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsert();
                }
              }}
            />
          </div>
          <div className="text-sm text-muted-foreground">Supported: YouTube, Vimeo, TikTok</div>
        </div>
        <DialogFooter className="sm:justify-between">
          <div />
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleInsert} disabled={!url.trim()}>Insert</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedModal;
