import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LinkEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, openInNewTab: boolean) => void;
  onRemove?: () => void;
  initialUrl?: string;
  initialOpenInNewTab?: boolean;
}

export const LinkEditorModal: React.FC<LinkEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onRemove,
  initialUrl = '',
  initialOpenInNewTab = true,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab);

  useEffect(() => {
    setUrl(initialUrl);
    setOpenInNewTab(initialOpenInNewTab);
  }, [initialUrl, initialOpenInNewTab, isOpen]);

  const handleSave = () => {
    let finalUrl = url;
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    onSave(finalUrl, openInNewTab);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="openInNewTab"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="openInNewTab" className="cursor-pointer">Open in new tab</Label>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={onRemove} disabled={!initialUrl}>
            Remove Link
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!url.trim()}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
