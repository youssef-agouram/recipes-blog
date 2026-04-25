import React, { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Bold, Italic, Link as LinkIcon, Highlighter } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorBubbleMenuProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
}

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor, onOpenLinkModal }) => {
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

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    editor.on('blur', () => setVisible(false));

    update();

    return () => {
      try {
        editor.off('selectionUpdate', update);
        editor.off('transaction', update);
      } catch (_) {}
    };
  }, [editor]);

  if (!editor || !visible) return null;

  const MenuButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon, 
    label 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    label: string; 
  }) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle 
            size="sm" 
            pressed={isActive} 
            onPressedChange={onClick} 
            aria-label={label}
            className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            <Icon className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div style={{ position: 'absolute', left: pos.left, top: pos.top, transform: 'translateX(-50%) translateY(-100%)' }} className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md z-50">
      <MenuButton
        label="Bold"
        icon={Bold}
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <MenuButton
        label="Italic"
        icon={Italic}
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <MenuButton
        label="Highlight"
        icon={Highlighter}
        isActive={editor.isActive('highlight')}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />
      <MenuButton
        label="Link"
        icon={LinkIcon}
        isActive={editor.isActive('link')}
        onClick={onOpenLinkModal}
      />
    </div>
  );
};
