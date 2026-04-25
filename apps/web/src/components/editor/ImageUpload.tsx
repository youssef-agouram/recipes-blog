import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ isOpen, onClose, onInsert }) => {
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Mock upload function
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Create a local object URL to simulate the uploaded file URL
    const fakeUrl = URL.createObjectURL(file);
    setIsUploading(false);
    onInsert(fakeUrl);
    onClose();
  };

  const handleUrlInsert = () => {
    if (url) {
      onInsert(url);
      setUrl('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="image-upload">Upload from computer</Label>
            <Input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={isUploading}
            />
            {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink-0 px-2 text-muted-foreground text-sm">OR</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image-url">Image URL</Label>
            <div className="flex space-x-2">
              <Input
                id="image-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlInsert();
                  }
                }}
              />
              <Button onClick={handleUrlInsert} disabled={!url.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
